import { execFile } from 'node:child_process';
import { lstat, realpath, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { hasCode, InvalidInputError } from './errors.js';
import { requirePath } from './paths.js';

const execFileAsync = promisify(execFile);

export async function discoverWorkspace(selected: string): Promise<string> {
  const canonical = await realpath(resolve(requirePath(selected, 'workspace')));

  const workspaceStats = await stat(canonical);
  const isDirectory = workspaceStats.isDirectory();
  if (!isDirectory) {
    throw new InvalidInputError('Workspace must be a directory.', [
      {
        path: ['workspace'],
        message: 'Workspace must be a directory.',
      },
    ]);
  }

  let ancestor = canonical;

  while (true) {
    try {
      await lstat(join(ancestor, '.git'));
      break;
    } catch (error) {
      if (!hasCode(error, 'ENOENT')) {
        throw error;
      }
    }

    const parent = dirname(ancestor);
    if (parent === ancestor) {
      return canonical;
    }

    ancestor = parent;
  }

  // A detected but broken repository must fail rather than change workspace identity.
  const { stdout } = await execFileAsync('git', ['-C', canonical, 'rev-parse', '--show-toplevel'], {
    encoding: 'utf8',
  });
  const topLevel = stdout.replace(/\r?\n$/, '');
  if (topLevel.length === 0) {
    throw new Error('Git returned an empty workspace path.');
  }

  return realpath(topLevel);
}
