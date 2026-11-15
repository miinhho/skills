import { createHash } from 'node:crypto';
import { mkdir, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { idSchema } from '../memo/document.js';
import { RevisionConflictError, WorkNotFoundError } from '../memo/errors.js';
import { Work } from '../memo/work.js';
import { hasCode, StoredStateError } from './errors.js';
import { parseJsonBytes } from './json.js';
import { LockedFile } from './locked-file.js';
import { assertMissingStorePath, type Store } from './paths.js';

export interface SnapshotInfo {
  readonly workId: string;
  readonly path: string;
  readonly revision: string;
}

export interface Snapshot extends SnapshotInfo {
  readonly workspace: string;
  readonly work: Work;
}

export interface SaveResult extends SnapshotInfo {
  readonly workspace: string;
}

function revisionOf(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export class Repository {
  constructor(readonly store: Store) {}

  private path(workId: string): string {
    return join(this.store.directory, `work-${workId}.json`);
  }

  private async read(workId: string): Promise<Snapshot | undefined> {
    const path = this.path(workId);
    let bytes: Buffer;

    try {
      bytes = await readFile(path);
    } catch (error) {
      if (!hasCode(error, 'ENOENT')) {
        throw error;
      }

      await assertMissingStorePath(this.store.directory);

      return undefined;
    }

    // Only document corruption is contextualized; native filesystem failures stay native.
    let work: Work;

    try {
      work = Work.parse(parseJsonBytes(bytes, path), workId);
    } catch (cause) {
      throw new StoredStateError(path, { cause });
    }

    return {
      workId,
      workspace: this.store.workspace,
      path,
      revision: revisionOf(bytes),
      work,
    };
  }

  async load(workId: string): Promise<Snapshot> {
    const snapshot = await this.read(workId);
    if (!snapshot) {
      throw new WorkNotFoundError(workId);
    }

    return snapshot;
  }

  private async listFilenames(): Promise<string[]> {
    try {
      return await readdir(this.store.directory);
    } catch (error) {
      if (!hasCode(error, 'ENOENT')) {
        throw error;
      }

      await assertMissingStorePath(this.store.directory);

      return [];
    }
  }

  private workIdFromFilename(filename: string): string | undefined {
    if (!filename.startsWith('work-') || !filename.endsWith('.json')) {
      return undefined;
    }

    const parsed = idSchema.safeParse(filename.slice(5, -5));
    if (!parsed.success) {
      throw new StoredStateError(join(this.store.directory, filename), {
        cause: parsed.error,
      });
    }

    return parsed.data;
  }

  async list(): Promise<SnapshotInfo[]> {
    const filenames = await this.listFilenames();
    const snapshots: SnapshotInfo[] = [];

    for (const filename of filenames) {
      const workId = this.workIdFromFilename(filename);
      if (workId === undefined) {
        continue;
      }

      const snapshot = await this.read(workId);
      if (!snapshot) {
        continue;
      }

      snapshots.push({
        workId: snapshot.workId,
        path: snapshot.path,
        revision: snapshot.revision,
      });
    }

    return snapshots.sort((left, right) => {
      if (left.workId < right.workId) {
        return -1;
      }

      if (left.workId > right.workId) {
        return 1;
      }

      return 0;
    });
  }

  async save(work: Work, expected: string): Promise<SaveResult> {
    const { store } = this;
    const workId = work.document.workId;
    const path = this.path(workId);

    // Existing directory permissions are untouched; new directories are private.
    await mkdir(store.root, {
      recursive: true,
      mode: 0o700,
    });
    await mkdir(store.directory, {
      recursive: true,
      mode: 0o700,
    });

    // Keep the lease through comparison and publication. Scoped async disposal releases
    // it on every exit and retains both errors if the save and release fail.
    await using currentFile = await LockedFile.acquire(store.directory, path);

    // Compare the revision of the exact stored bytes, not a reserialized document.
    const current = await this.read(workId);
    const actual = current?.revision ?? 'missing';
    if (actual !== expected) {
      throw new RevisionConflictError(expected, actual);
    }

    // The aggregate must accept the replacement before any new bytes are published.
    const accepted = current ? current.work.replace(work) : work;
    const bytes = Buffer.from(`${JSON.stringify(accepted.document, null, 2)}\n`, 'utf8');
    const revision = revisionOf(bytes);

    // Rejections before publication leave bytes intact. A post-publication or release failure
    // can still reject this save after the new snapshot has become visible.
    await currentFile.write(bytes);

    return {
      workId,
      workspace: store.workspace,
      path,
      revision,
    };
  }
}
