import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import type writeFileAtomic from 'write-file-atomic';
import { RevisionConflictError } from '../src/memo/errors.js';
import { Work } from '../src/memo/work.js';
import { LockedFile } from '../src/storage/locked-file.js';
import { createStore } from '../src/storage/paths.js';
import { Repository } from '../src/storage/repository.js';
import { planning } from './fixtures/state-fixtures.js';
import { reported } from './helpers/error-helpers.js';
import type { CaseFixture } from './helpers/process-helpers.js';
import { digest, temporaryCase } from './helpers/process-helpers.js';

const faults = vi.hoisted(() => ({
  compromise: undefined as ((error: Error) => void) | undefined,
  duringTemporaryFile: undefined as (() => void) | undefined,
  afterPublication: undefined as (() => void) | undefined,
  releaseError: undefined as Error | undefined,
}));

vi.mock('proper-lockfile', () => ({
  default: {
    lock: async (_path: string, options: { onCompromised(error: Error): void }) => {
      faults.compromise = options.onCompromised;

      return async () => {
        if (faults.releaseError) {
          throw faults.releaseError;
        }
      };
    },
  },
}));

vi.mock('write-file-atomic', async (importOriginal) => {
  const actual = await importOriginal<{ default: typeof writeFileAtomic }>();

  return {
    default: async (path: string, bytes: Buffer, options: writeFileAtomic.Options) => {
      await actual.default(path, bytes, {
        ...options,
        tmpfileCreated: (temporaryFile) => {
          faults.duringTemporaryFile?.();
          options.tmpfileCreated?.(temporaryFile);
        },
      });

      faults.afterPublication?.();
    },
  };
});

let fixture: CaseFixture;
let repository: Repository;
let path: string;
let original: Buffer;

beforeEach(async () => {
  faults.compromise = undefined;
  faults.duringTemporaryFile = undefined;
  faults.afterPublication = undefined;
  faults.releaseError = undefined;
  fixture = await temporaryCase();
  const store = createStore(fixture.workspace, fixture.store);
  repository = new Repository(store);
  path = join(store.directory, 'work-case-one.json');
  original = Buffer.from(JSON.stringify(planning()));

  await mkdir(store.directory, { recursive: true });
  await writeFile(path, original);
});

afterEach(async () => {
  await fixture.cleanup();
});

describe('publication and disposal have distinct observable outcomes', () => {
  test('ownership lost before commit rejects the write and preserves the existing record', async () => {
    const lost = Object.assign(new Error('Lease ownership was lost.'), { code: 'ECOMPROMISED' });

    await expect(
      (async () => {
        await using file = await LockedFile.acquire(repository.store.directory, path);
        faults.compromise!(lost);
        await file.write(Buffer.from('must not become visible'));
      })(),
    ).rejects.toBe(lost);

    expect(await readFile(path)).toEqual(original);
    expect(await readdir(repository.store.directory)).toEqual([basename(path)]);
  });

  test('loss observed during temporary-file creation cannot publish or leave temporary files', async () => {
    const lost = Object.assign(new Error('Lease was lost while preparing a temporary file.'), {
      code: 'ECOMPROMISED',
    });
    faults.duringTemporaryFile = () => faults.compromise!(lost);
    const next = planning();
    next.memo.nextAction = 'An unowned writer must not publish this.';

    await expect(repository.save(Work.parse(next), digest(original))).rejects.toBe(lost);

    expect(await readFile(path)).toEqual(original);
    expect(await readdir(repository.store.directory)).toEqual([basename(path)]);
  });

  test('a conflict and a failed disposal retain the original classification and cleanup diagnostic', async () => {
    const releaseError = Object.assign(new Error('Lease release failed.'), { code: 'ERELEASED' });
    faults.releaseError = releaseError;
    let caught: unknown;

    try {
      await repository.save(Work.parse(planning()), '0'.repeat(64));
    } catch (error) {
      caught = error;
    }

    expect(caught).toMatchObject({
      name: 'SuppressedError',
      suppressed: expect.any(RevisionConflictError),
      error: releaseError,
    });
    const output = reported(caught);

    expect(output.exit).toBe(3);
    expect(output.error.code).toBe('CONFLICT');
    expect(output.error.details?.actual).toBe(digest(original));
    expect(output.error.details?.releaseErrors).toEqual([
      expect.objectContaining({ message: releaseError.message, code: 'ERELEASED' }),
    ]);
    expect(await readFile(path)).toEqual(original);
  });

  test('compromise reported after publication returns BUSY but reconciliation sees the complete new work', async () => {
    const lost = Object.assign(new Error('Lease loss was detected after publication.'), {
      code: 'ECOMPROMISED',
    });
    faults.afterPublication = () => faults.compromise!(lost);
    const next = planning();
    next.memo.nextAction = 'This document was already published.';

    await expect(repository.save(Work.parse(next), digest(original))).rejects.toBe(lost);
    const observed = await repository.load(next.workId);
    const output = reported(lost);

    expect(output.exit).toBe(4);
    expect(output.error.code).toBe('BUSY');
    expect(observed.work.document).toEqual(next);
    expect(observed.revision).toBe(digest(await readFile(path)));
    expect(observed.revision).not.toBe(digest(original));
  });

  test('release-only failure does not falsely promise rollback of an accepted snapshot', async () => {
    const releaseError = Object.assign(new Error('Published, but release failed.'), {
      code: 'ERELEASED',
    });
    faults.releaseError = releaseError;
    const next = planning();
    next.memo.currentWork = 'A complete accepted observation.';

    await expect(repository.save(Work.parse(next), digest(original))).rejects.toBe(releaseError);
    const observed = await repository.load(next.workId);

    expect(observed.work.document).toEqual(next);
    expect(observed.revision).toBe(digest(await readFile(path)));
    expect(observed.revision).not.toBe(digest(original));
  });
});
