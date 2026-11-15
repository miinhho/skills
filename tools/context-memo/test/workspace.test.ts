import { copyFile, mkdir, readdir, readFile, realpath, symlink, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { active, planning } from './fixtures/state-fixtures.js';
import type { CaseFixture, Saved } from './helpers/process-helpers.js';
import {
  absent,
  bundle,
  cli,
  failure,
  json,
  load,
  run,
  save,
  temporaryCase,
} from './helpers/process-helpers.js';

let fixture: CaseFixture;

beforeEach(async () => {
  fixture = await temporaryCase();
});

afterEach(async () => {
  await fixture.cleanup();
});

async function git(args: string[], cwd = fixture.workspace): Promise<string> {
  const result = await run(
    'git',
    [
      '-c',
      `core.hooksPath=${join(fixture.root, 'no-hooks')}`,
      '-c',
      `init.templateDir=${join(fixture.root, 'no-templates')}`,
      '-c',
      'commit.gpgsign=false',
      ...args,
    ],
    {
      cwd,
      env: {
        GIT_CONFIG_NOSYSTEM: '1',
        GIT_CONFIG_GLOBAL: join(fixture.root, 'no-global-config'),
        GIT_DIR: undefined,
        GIT_WORK_TREE: undefined,
        GIT_COMMON_DIR: undefined,
        GIT_INDEX_FILE: undefined,
      },
    },
  );

  expect(result.code, result.stderr).toBe(0);

  return result.stdout.trim();
}

describe('explicit workspace identity', () => {
  test('realpath aliases find the same saved work, not a new namespace', async () => {
    const alias = join(fixture.root, 'workspace alias');
    await symlink(fixture.workspace, alias, process.platform === 'win32' ? 'junction' : 'dir');
    const document = planning();
    const saved = await save(fixture, document);
    const fromAlias = await load({ ...fixture, workspace: alias });

    expect(fromAlias).toEqual({ ...saved, state: document });
    expect(fromAlias.workspace).toBe(await realpath(fixture.workspace));
    expect(await readdir(fixture.workspace)).toEqual([]);
  });

  test('repository subdirectories share a checkout, while linked worktrees remain separate', async () => {
    await mkdir(join(fixture.root, 'no-hooks'));
    await mkdir(join(fixture.root, 'no-templates'));
    await git(['init', '--quiet']);
    await git([
      '-c',
      'user.name=Synthetic Test',
      '-c',
      'user.email=synthetic@example.invalid',
      'commit',
      '--quiet',
      '--allow-empty',
      '-m',
      'Disposable fixture',
    ]);
    const subdirectory = join(fixture.workspace, 'nested', 'directory');
    const worktree = join(fixture.root, 'linked worktree café 雪');
    await mkdir(subdirectory, { recursive: true });
    await git(['worktree', 'add', '--quiet', '--detach', worktree, 'HEAD']);
    const before = await git(['status', '--porcelain', '--untracked-files=all']);
    const original = planning();
    const saved = await save(fixture, original);

    expect(await load({ ...fixture, workspace: subdirectory })).toEqual({
      ...saved,
      state: original,
    });

    const separate = { ...fixture, workspace: worktree };
    expect(json(await cli(separate, ['list']))).toEqual([]);
    failure(await cli(separate, ['load', '--work', original.workId]), 2, 'NOT_FOUND');
    original.memo.nextAction = 'Only this linked worktree owns this continuation.';
    const linked = await save(separate, original);

    expect(linked.path).not.toBe(saved.path);
    expect(linked.workspace).toBe(await realpath(worktree));
    expect((await load(fixture)).state).toEqual(planning());
    expect((await load(separate)).state).toEqual(original);
    expect(await git(['status', '--porcelain', '--untracked-files=all'])).toBe(before);
    expect(await git(['status', '--porcelain', '--untracked-files=all'], worktree)).toBe('');
  }, 20000);

  test('a detected broken repository errors instead of silently selecting a new identity', async () => {
    await writeFile(join(fixture.workspace, '.git'), 'gitdir: unavailable-git-directory\n');

    const error = failure(await cli(fixture, ['list']), 1, 'IO_ERROR');

    expect(error.message).toContain('git');
    await absent(fixture.store);
  });

  test('a workspace file is rejected without initializing storage', async () => {
    const file = join(fixture.root, 'not-a-directory');
    await writeFile(file, 'preserve input');

    const result = await run(
      process.execPath,
      [bundle, 'list', '--workspace', file, '--store', fixture.store],
      { cwd: fixture.workspace },
    );
    const error = failure(result, 1, 'INVALID_INPUT');

    expect(error.details?.issues?.map((issue) => issue.path)).toContain('workspace');
    expect(await readFile(file, 'utf8')).toBe('preserve input');
    await absent(fixture.store);
  });

  test('an explicit root overrides the environment without mixing the two stores', async () => {
    const environmentRoot = join(fixture.root, 'environment-store');
    const document = planning();
    const args = [
      'save',
      '--work',
      document.workId,
      '--expect',
      'missing',
      '--workspace',
      fixture.workspace,
    ];
    const options = {
      cwd: fixture.workspace,
      input: JSON.stringify(document),
      env: { CONTEXT_MEMO_HOME: environmentRoot },
    };

    const environment = json<Saved>(await run(process.execPath, [bundle, ...args], options));
    const explicit = json<Saved>(
      await run(process.execPath, [bundle, ...args, '--store', fixture.store], options),
    );

    expect(dirname(dirname(environment.path))).toBe(environmentRoot);
    expect(dirname(dirname(explicit.path))).toBe(fixture.store);
    expect(environment.path).not.toBe(explicit.path);
    expect(JSON.parse(await readFile(environment.path, 'utf8'))).toEqual(document);
    expect(JSON.parse(await readFile(explicit.path, 'utf8'))).toEqual(document);
  });
});

async function installBundle(): Promise<string> {
  const directory = join(fixture.root, 'installed skill café 雪');
  const installed = join(directory, 'renamed-context-helper.cjs');

  await mkdir(directory);
  await copyFile(bundle, installed);

  return installed;
}

// Cold-start cost is paid for four separate processes in this copied-deployment check.
test('a single copied executable supports save, full/current load and list without dependencies', async () => {
  const installed = await installBundle();
  const directory = dirname(installed);

  expect(await readdir(directory)).toEqual([basename(installed)]);
  await absent(join(directory, 'node_modules'));
  await absent(join(directory, 'src'));

  const document = active();
  const saved = await save(fixture, document, 'missing', installed);
  const loaded = await load(fixture, document.workId, installed);
  const list = json(await cli(fixture, ['list'], undefined, installed));
  const current = await cli(
    fixture,
    ['load', '--work', document.workId, '--view', 'current'],
    undefined,
    installed,
  );

  expect(loaded).toEqual({ ...saved, state: document });
  expect(list).toEqual([{ workId: saved.workId, path: saved.path, revision: saved.revision }]);
  expect(current.code, current.stderr).toBe(0);
  expect(current.stdout).toContain(document.tasks[0]!.title);
  expect(current.stdout).toContain(saved.revision);
  expect(await readdir(fixture.workspace)).toEqual([]);
}, 20000);

test('nearby package metadata and manifests cannot replace the embedded CLI configuration', async () => {
  const installed = await installBundle();
  const directory = dirname(installed);

  await writeFile(
    join(directory, 'package.json'),
    JSON.stringify({
      name: 'unrelated-package',
      version: '99.0.0',
      type: 'module',
    }),
  );
  await writeFile(join(directory, 'oclif.manifest.json'), 'not an application manifest');

  const help = await cli(fixture, ['--help'], undefined, installed);
  const version = await cli(fixture, ['--version'], undefined, installed);
  const list = json(await cli(fixture, ['list'], undefined, installed));

  expect(help.code, help.stderr).toBe(0);
  expect(version.code, version.stderr).toBe(0);
  expect(version.stdout).toMatch(/\d+\.\d+\.\d+/);
  expect(version.stdout).not.toContain('99.0.0');
  expect(list).toEqual([]);

  for (const name of ['list', 'load', 'save']) {
    expect(help.stdout).toMatch(new RegExp(`\\b${name}\\b`));
  }

  await absent(fixture.store);
});
