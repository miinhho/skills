import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import lockfile from 'proper-lockfile';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { PlanError, RevisionConflictError, WorkNotFoundError } from '../src/memo/errors.js';
import { Work } from '../src/memo/work.js';
import { StoredStateError } from '../src/storage/errors.js';
import { createStore } from '../src/storage/paths.js';
import { Repository } from '../src/storage/repository.js';
import { active, planning } from './fixtures/state-fixtures.js';
import type { CaseFixture, Saved } from './helpers/process-helpers.js';
import {
  absent,
  cli,
  digest,
  failure,
  json,
  load,
  temporaryCase,
} from './helpers/process-helpers.js';

let fixture: CaseFixture;
let repository: Repository;

beforeEach(async () => {
  fixture = await temporaryCase();
  repository = new Repository(createStore(fixture.workspace, fixture.store));
});

afterEach(async () => {
  await fixture.cleanup();
});

describe('exact-byte revisions protect accepted work', () => {
  test('reads do not initialize an absent repository', async () => {
    expect(await repository.list()).toEqual([]);
    await expect(repository.load('case-one')).rejects.toBeInstanceOf(WorkNotFoundError);
    await absent(fixture.store);
  });

  test('external formatting changes the CAS token without changing the document', async () => {
    const input = active();
    const saved = await repository.save(Work.parse(input), 'missing');
    const externalBytes = Buffer.from(`${JSON.stringify(input, null, 4)}\n`);
    await writeFile(saved.path, externalBytes);

    const observed = await repository.load(input.workId);
    expect(observed.work.document).toEqual(input);
    expect(observed.revision).toBe(digest(externalBytes));
    expect(observed.revision).not.toBe(saved.revision);

    input.memo.nextAction = 'Continue after reconciling the formatted file.';
    const next = Work.parse(input);
    const conflict = failure(
      await cli(fixture, ['save', '--work', input.workId, '--expect', saved.revision], input),
      3,
      'CONFLICT',
    );

    expect(conflict.details).toMatchObject({
      expected: saved.revision,
      actual: observed.revision,
    });
    expect(await readFile(saved.path)).toEqual(externalBytes);

    const accepted = await repository.save(next, observed.revision);
    expect((await repository.load(input.workId)).work.document).toEqual(input);
    expect(accepted.revision).toBe(digest(await readFile(saved.path)));
  });

  test('memo updates participate in CAS even when the binding revision stays unchanged', async () => {
    const original = planning();
    const first = await repository.save(Work.parse(original), 'missing');
    const stale = structuredClone(original);
    original.memo.currentWork = 'A newer observation was saved.';
    const latest = await repository.save(Work.parse(original), first.revision);
    const bytes = await readFile(latest.path);

    stale.memo.nextAction = 'A stale writer must not replace the observation.';
    for (const expectation of [first.revision, 'missing']) {
      await expect(repository.save(Work.parse(stale), expectation)).rejects.toBeInstanceOf(
        RevisionConflictError,
      );
      expect(await readFile(latest.path)).toEqual(bytes);
    }

    expect((await repository.load(original.workId)).work.document).toEqual(original);
    expect(original.spec.revision).toBe('contract-1');
  });

  test('a hash cannot create a missing record', async () => {
    await expect(repository.save(Work.parse(planning()), '0'.repeat(64))).rejects.toMatchObject({
      expected: '0'.repeat(64),
      actual: 'missing',
    });
    expect(await repository.list()).toEqual([]);
  });

  test('rejected obligation removal leaves the last accepted bytes and evidence intact', async () => {
    const input = active();
    input.spec.requirements[0]!.evidence = ['Earlier observed inspection.'];
    const saved = await repository.save(Work.parse(input), 'missing');
    const bytes = await readFile(saved.path);
    const removed = structuredClone(input);
    removed.tasks = [];
    removed.current.taskId = null;
    const otherwiseValid = Work.parse(removed);

    await expect(repository.save(otherwiseValid, saved.revision)).rejects.toBeInstanceOf(PlanError);
    expect(await readFile(saved.path)).toEqual(bytes);
    expect((await repository.load(input.workId)).work.document).toEqual(input);
  });

  test('invalid incoming state is diagnosed without replacing an accepted record', async () => {
    const input = planning();
    const saved = await repository.save(Work.parse(input), 'missing');
    const bytes = await readFile(saved.path);
    input.memo.nextAction = ' ';

    const error = failure(
      await cli(fixture, ['save', '--work', input.workId, '--expect', saved.revision], input),
      1,
      'INVALID_STATE',
    );

    expect(error.details?.issues?.map((issue) => issue.path)).toContain('memo.nextAction');
    expect(await readFile(saved.path)).toEqual(bytes);
    expect((await repository.load(input.workId)).revision).toBe(saved.revision);
  });

  test('a native lock remains owned by its holder when another writer is rejected', async () => {
    const input = planning();
    const saved = await repository.save(Work.parse(input), 'missing');
    const bytes = await readFile(saved.path);
    const lockPath = `${saved.path}.lock`;
    const release = await lockfile.lock(repository.store.directory, { lockfilePath: lockPath });

    try {
      input.memo.nextAction = 'An unowned writer must not publish this.';
      await expect(repository.save(Work.parse(input), saved.revision)).rejects.toMatchObject({
        code: 'ELOCKED',
      });
      failure(
        await cli(fixture, ['save', '--work', input.workId, '--expect', saved.revision], input),
        4,
        'BUSY',
      );

      expect(await readFile(saved.path)).toEqual(bytes);
      expect((await stat(lockPath)).isDirectory()).toBe(true);
    } finally {
      await release();
    }

    const next = await repository.save(Work.parse(input), saved.revision);
    expect((await repository.load(input.workId)).revision).toBe(next.revision);
  });

  test('competing processes publish exactly one complete candidate, then release ownership', async () => {
    const original = active();
    const saved = await repository.save(Work.parse(original), 'missing');
    const left = structuredClone(original);
    const right = structuredClone(original);
    left.memo.currentWork = 'Left observation.';
    left.memo.nextAction = 'Left continuation.';
    right.memo.currentWork = 'Right observation.';
    right.memo.nextAction = 'Right continuation.';
    const candidates = [left, right];

    const results = await Promise.all(
      candidates.map((candidate) =>
        cli(fixture, ['save', '--work', original.workId, '--expect', saved.revision], candidate),
      ),
    );
    const winners = results.flatMap((result, index) => (result.code === 0 ? [index] : []));
    expect(winners).toHaveLength(1);

    const winner = winners[0]!;
    const acknowledgment = json<Saved>(results[winner]!);
    const loser = results[1 - winner]!;
    expect([3, 4]).toContain(loser.code);
    failure(loser, loser.code!, loser.code === 3 ? 'CONFLICT' : 'BUSY');

    const observed = await load(fixture);
    expect(observed.state).toEqual(candidates[winner]);
    expect(observed.state.spec).toEqual(original.spec);
    expect(observed.state.tasks).toEqual(original.tasks);
    expect(observed.revision).toBe(acknowledgment.revision);
    expect(observed.revision).toBe(digest(await readFile(saved.path)));

    const followup = structuredClone(observed.state);
    followup.memo.nextAction = 'Continue after both writers settled.';
    await repository.save(Work.parse(followup), observed.revision);
    expect((await repository.load(original.workId)).work.document).toEqual(followup);
  }, 20000);
});

describe('corruption and filesystem failures are not absence', () => {
  const corruptDocuments = [
    ['invalid JSON', Buffer.from('{not-json')],
    ['invalid UTF-8', Buffer.from([0xff, 0xfe])],
    ['unsupported version', Buffer.from(JSON.stringify({ ...planning(), schemaVersion: 99 }))],
    ['invalid shape', Buffer.from(JSON.stringify({ ...planning(), memo: {} }))],
    ['wrong identity', Buffer.from(JSON.stringify(planning('other-work')))],
    [
      'invalid graph',
      Buffer.from(JSON.stringify({ ...planning(), current: { phaseId: 'absent', taskId: null } })),
    ],
  ] as const;

  test.each(corruptDocuments)(
    '%s cannot be loaded, listed or overwritten',
    async (_label, corrupt) => {
      const input = planning();
      const saved = await repository.save(Work.parse(input), 'missing');
      await writeFile(saved.path, corrupt);

      const operations = [
        () => repository.load(input.workId),
        () => repository.list(),
        () => repository.save(Work.parse(input), digest(corrupt)),
      ];

      for (const operation of operations) {
        await expect(operation()).rejects.toBeInstanceOf(StoredStateError);
        expect(await readFile(saved.path)).toEqual(corrupt);
      }
    },
  );

  test('a corruption diagnostic names the stored path and keeps its original cause', async () => {
    const saved = await repository.save(Work.parse(planning()), 'missing');
    await writeFile(saved.path, '{not-json');

    const error = failure(await cli(fixture, ['load', '--work', 'case-one']), 1, 'INVALID_STATE');
    expect(error.details?.path).toBe(saved.path);
    expect(error.details?.cause).toMatchObject({ source: saved.path });
    expect(await readFile(saved.path, 'utf8')).toBe('{not-json');
  });

  test('an unusable ancestor is an I/O error on read and write, including Windows ENOENT', async () => {
    const ancestor = join(fixture.root, 'ordinary-file');
    await writeFile(ancestor, 'preserve this file');
    const inaccessible = { ...fixture, store: join(ancestor, 'nested', 'store') };

    for (const args of [
      ['list'],
      ['load', '--work', 'case-one'],
      ['save', '--work', 'case-one', '--expect', 'missing'],
    ]) {
      failure(await cli(inaccessible, args, planning()), 1, 'IO_ERROR');
      expect(await readFile(ancestor, 'utf8')).toBe('preserve this file');
    }
  });

  test('a record-path directory is not a missing record or an overwrite opportunity', async () => {
    const saved = await repository.save(Work.parse(planning()), 'missing');
    await rm(saved.path);
    await mkdir(saved.path);
    const sentinel = join(saved.path, 'unrelated');
    await writeFile(sentinel, 'preserve directory contents');

    for (const args of [
      ['load', '--work', 'case-one'],
      ['list'],
      ['save', '--work', 'case-one', '--expect', saved.revision],
    ]) {
      failure(await cli(fixture, args, planning()), 1, 'IO_ERROR');
      expect(await readFile(sentinel, 'utf8')).toBe('preserve directory contents');
    }
  });

  test('input file I/O errors never erase the stored document', async () => {
    const saved = await repository.save(Work.parse(planning()), 'missing');
    const bytes = await readFile(saved.path);

    for (const file of [join(fixture.root, 'missing.json'), fixture.workspace]) {
      failure(
        await cli(fixture, [
          'save',
          '--work',
          'case-one',
          '--expect',
          saved.revision,
          '--file',
          file,
        ]),
        1,
        'IO_ERROR',
      );
      expect(await readFile(saved.path)).toEqual(bytes);
    }
  });
});
