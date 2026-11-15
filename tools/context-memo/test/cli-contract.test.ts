import { readdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { active, planning } from './fixtures/state-fixtures.js';
import type { CaseFixture, Saved } from './helpers/process-helpers.js';
import {
  absent,
  bundle,
  cli,
  digest,
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

describe('native command parsing has no storage side effects', () => {
  test.each([
    ['--help'],
    ['--version'],
    ['list', '--help'],
    ['load', '--help'],
    ['save', '--help'],
  ])('handles %j without resolving execution paths', async (...args) => {
    const unavailable = join(fixture.root, 'unavailable workspace');
    const result = await run(
      process.execPath,
      [bundle, ...args, '--workspace', unavailable, '--store', fixture.store],
      { cwd: fixture.workspace },
    );

    expect(result.code, result.stderr).toBe(0);
    expect(result.stderr).toBe('');
    expect(result.stdout).toMatch(/context-memo/);
    await absent(unavailable);
    await absent(fixture.store);
  });

  test.each([
    ['no command', []],
    ['unknown command', ['erase']],
    ['unknown flag', ['list', '--quiet']],
    ['extra argument', ['list', 'unexpected']],
    ['missing work', ['load']],
    ['missing expectation', ['save', '--work', 'case-one']],
    ['missing work value', ['load', '--work']],
    ['missing expectation value', ['save', '--work', 'case-one', '--expect']],
    ['missing view value', ['load', '--work', 'case-one', '--view']],
    ['missing file value', ['save', '--work', 'case-one', '--expect', 'missing', '--file']],
    ['unknown view', ['load', '--work', 'case-one', '--view', 'summary']],
    ['invalid revision', ['save', '--work', 'case-one', '--expect', 'latest']],
    ['uppercase revision', ['save', '--work', 'case-one', '--expect', 'A'.repeat(64)]],
    ['extra load argument', ['load', '--work', 'case-one', 'unexpected']],
    ['extra save argument', ['save', '--work', 'case-one', '--expect', 'missing', 'unexpected']],
  ] as const)('rejects %s before opening the store', async (_label, args) => {
    const result =
      args.length === 0
        ? await run(process.execPath, [bundle], { cwd: fixture.workspace })
        : await cli(fixture, [...args], planning());

    failure(result, 1, 'INVALID_INPUT');
    await absent(fixture.store);
    expect(await readdir(fixture.workspace)).toEqual([]);
  });

  test.each([
    '../escape',
    '..',
    'nested/work',
    'nested\\work',
    '/absolute',
    'C:\\absolute',
    'UPPER',
    '-leading',
    'a'.repeat(81),
  ])('rejects unsafe work identity %s', async (workId) => {
    failure(await cli(fixture, ['load', `--work=${workId}`]), 1, 'INVALID_INPUT');
    failure(
      await cli(fixture, ['save', `--work=${workId}`, '--expect', 'missing'], planning(workId)),
      1,
      'INVALID_INPUT',
    );
    await absent(fixture.store);
  });

  test.each(['--workspace', '--store', '--file'])(
    'rejects blank %s before filesystem access',
    async (flag) => {
      const args =
        flag === '--file' ? ['save', '--work', 'case-one', '--expect', 'missing'] : ['list'];

      failure(
        await run(process.execPath, [bundle, ...args, flag, '  '], {
          cwd: fixture.workspace,
        }),
        1,
        'INVALID_INPUT',
      );
      await absent(fixture.store);
    },
  );

  test.each(['--workspace', '--store'])('requires a value for %s', async (flag) => {
    failure(
      await run(process.execPath, [bundle, 'list', flag], {
        cwd: fixture.workspace,
      }),
      1,
      'INVALID_INPUT',
    );
    await absent(fixture.store);
  });

  test('rejects a blank environment override rather than selecting a different store', async () => {
    failure(
      await run(process.execPath, [bundle, 'list', '--workspace', fixture.workspace], {
        cwd: fixture.workspace,
        env: { CONTEXT_MEMO_HOME: '  ' },
      }),
      1,
      'INVALID_INPUT',
    );
    await absent(fixture.store);
  });
});

describe('wire documents and diagnostics', () => {
  test('list and missing load leave an uninitialized store untouched', async () => {
    expect(json(await cli(fixture, ['list']))).toEqual([]);
    failure(await cli(fixture, ['load', '--work', 'case-one']), 2, 'NOT_FOUND');

    await absent(fixture.store);
    expect(await readdir(fixture.workspace)).toEqual([]);
  });

  test('stdin round-trips the full document and returns sorted, exact-byte metadata', async () => {
    const document = active('z-last');
    document.memo.retrieval = ['雪'.repeat(6000)];
    const first = await save(fixture, document);
    const second = await save(fixture, planning('a-first'));
    const bytes = await readFile(first.path);

    expect(first.workspace).toBe(await realpath(fixture.workspace));
    expect(first.revision).toBe(digest(bytes));
    expect(JSON.parse(bytes.toString('utf8'))).toEqual(document);
    expect(await load(fixture, document.workId)).toEqual({ ...first, state: document });
    expect(json(await cli(fixture, ['list']))).toEqual([
      { workId: second.workId, path: second.path, revision: second.revision },
      { workId: first.workId, path: first.path, revision: first.revision },
    ]);
    expect(await readdir(fixture.workspace)).toEqual([]);
  });

  test('file input accepts a UTF-8 BOM and Unicode path without modifying the input', async () => {
    const document = active();
    const file = join(fixture.root, 'state café 雪.json');
    const bytes = Buffer.from(`\uFEFF${JSON.stringify(document)}`);
    await writeFile(file, bytes);

    const saved = json<Saved>(
      await cli(fixture, [
        'save',
        '--work',
        document.workId,
        '--expect',
        'missing',
        '--file',
        file,
      ]),
    );
    const current = await cli(fixture, ['load', '--work', document.workId, '--view', 'current']);

    expect((await load(fixture)).state).toEqual(document);
    expect(await readFile(file)).toEqual(bytes);
    expect(current.code, current.stderr).toBe(0);
    expect(current.stderr).toBe('');
    expect(current.stdout).toContain(saved.path);
    expect(current.stdout).toContain(saved.revision);
    expect(current.stdout).toContain(document.tasks[0]!.title);
    expect(current.stdout).toContain(document.memo.nextAction);
  });

  test.each([
    ['invalid JSON', '{not-json', 'INVALID_INPUT', undefined],
    ['empty JSON', '', 'INVALID_INPUT', undefined],
    ['invalid UTF-8', Buffer.from([0xff, 0xfe]), 'INVALID_INPUT', undefined],
    ['unknown field', { ...planning(), unexpected: true }, 'INVALID_STATE', '$'],
    ['identity mismatch', planning('other-work'), 'INVALID_STATE', 'workId'],
    [
      'invalid selection',
      { ...planning(), current: { phaseId: 'absent', taskId: null } },
      'INVALID_STATE',
      'current.phaseId',
    ],
  ] as const)('rejects %s with no persisted candidate', async (_label, input, code, path) => {
    const error = failure(
      await cli(fixture, ['save', '--work', 'case-one', '--expect', 'missing'], input),
      1,
      code,
    );

    if (path !== undefined) {
      expect(error.details?.issues?.map((issue) => issue.path)).toContain(path);
    }

    await absent(fixture.store);
  });
});
