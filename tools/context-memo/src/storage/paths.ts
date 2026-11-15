import { createHash } from 'node:crypto';
import type { Stats } from 'node:fs';
import { stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import envPaths from 'env-paths';
import { hasCode, InvalidInputError } from './errors.js';

export interface Store {
  readonly workspace: string;
  readonly root: string;
  readonly directory: string;
}

export function createStore(workspace: string, root?: string): Store {
  let selectedRoot: string;

  if (root !== undefined) {
    selectedRoot = requirePath(root, 'store');
  } else {
    const environmentRoot = process.env.CONTEXT_MEMO_HOME;

    if (environmentRoot !== undefined) {
      selectedRoot = requirePath(environmentRoot, 'CONTEXT_MEMO_HOME');
    } else {
      selectedRoot = requirePath(envPaths('context-memo', { suffix: '' }).data, 'store');
    }
  }

  const absoluteRoot = resolve(selectedRoot);
  const identity = process.platform === 'win32' ? workspace.toLowerCase() : workspace;
  const key = createHash('sha256').update(identity, 'utf8').digest('hex');

  return {
    workspace,
    root: absoluteRoot,
    directory: join(absoluteRoot, key),
  };
}

export function requirePath(value: string, name: string): string {
  if (value.trim().length === 0) {
    throw new InvalidInputError(`${name} must not be blank.`, [
      {
        path: [name],
        message: 'Path must not be blank.',
      },
    ]);
  }

  return value;
}

export async function assertMissingStorePath(directory: string): Promise<void> {
  // Windows can report ENOENT for a file used as an ancestor, not just a missing path.
  let candidate = directory;

  while (true) {
    let candidateStats: Stats;

    try {
      candidateStats = await stat(candidate);
    } catch (error) {
      if (!hasCode(error, 'ENOENT')) {
        throw error;
      }

      const parent = dirname(candidate);
      if (parent === candidate) {
        throw error;
      }

      candidate = parent;
      continue;
    }

    const isDirectory = candidateStats.isDirectory();
    if (!isDirectory) {
      throw Object.assign(
        new Error(`Store ancestor is not a directory: ${JSON.stringify(candidate)}.`),
        {
          code: 'ENOTDIR',
          path: candidate,
          syscall: 'stat',
        },
      );
    }

    return;
  }
}
