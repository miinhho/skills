import { describe, expect, test } from 'vitest';
import { ZodError } from 'zod';
import { PlanError } from '../src/memo/errors.js';
import { Work } from '../src/memo/work.js';
import type { FixtureDocument } from './fixtures/state-fixtures.js';
import { active, planning } from './fixtures/state-fixtures.js';

function rejected(action: () => unknown): unknown {
  try {
    action();
  } catch (error) {
    return error;
  }

  throw new Error('Expected the document to be rejected.');
}

function planIssue(document: unknown, path: (string | number)[]): void {
  const error = rejected(() => Work.parse(document));
  if (!(error instanceof PlanError)) {
    throw error;
  }

  expect(error.issues.map((issue) => issue.path)).toContainEqual(path);
}

function structuralIssue(document: unknown, path: (string | number)[]): void {
  const error = rejected(() => Work.parse(document));

  if (!(error instanceof ZodError)) {
    throw error;
  }

  expect(error.issues.map((issue) => issue.path)).toContainEqual(path);
}

describe('a consumer owns a validated, immutable work', () => {
  test('neither the original input nor the public document can alter accepted work or its selection', () => {
    const input = active();
    input.spec.constraints = ['Never publish records.'];
    input.spec.sources = ['request.md'];
    input.memo.retrieval = ['manifest.json'];
    const expected = structuredClone(input);
    const work = Work.parse(input, input.workId);

    input.spec.requirements[0]!.text = 'External replacement.';
    input.spec.constraints.push('External constraint.');
    input.spec.sources[0] = 'external.md';
    input.phases[0]!.requirements.length = 0;
    input.tasks[0]!.doneWhen[0] = 'External criterion.';
    input.current.taskId = null;
    input.memo.retrieval[0] = 'external.json';

    expect(work.document).toEqual(expected);
    expect(work.plan.currentTask?.title).toBe(expected.tasks[0]!.title);
    expect(work.plan.requirement('outcome')?.text).toBe(expected.spec.requirements[0]!.text);

    expect(Reflect.set(work.document.spec.requirements[0]!, 'text', 'Public replacement.')).toBe(
      false,
    );
    expect(Reflect.set(work.document.spec.constraints, '0', 'Public constraint.')).toBe(false);
    expect(Reflect.set(work.document.phases[0]!, 'status', 'done')).toBe(false);
    expect(Reflect.set(work.document.tasks[0]!.evidence, '0', 'Invented proof.')).toBe(false);
    expect(Reflect.set(work.document.current, 'taskId', null)).toBe(false);
    expect(Reflect.set(work.document.memo, 'nextAction', 'Public replacement.')).toBe(false);
    expect(Reflect.set(work, 'document', Work.parse(planning()).document)).toBe(false);
    expect(Reflect.set(work.plan, 'currentTask', null)).toBe(false);
    expect(Reflect.set(work.plan.remainingTasksForPhase('deliver'), '0', null)).toBe(false);

    expect(work.document).toEqual(expected);
    expect(work.plan.remainingTasksForPhase('deliver')).toEqual(work.document.tasks);
    expect(work.plan.remainingTasksForPhase('absent')).toEqual([]);
    expect(Reflect.set(work.plan.remainingPhases, '0', null)).toBe(false);
  });

  test('preserves significant text and accepts planning without invented tasks', () => {
    const input = planning();
    input.spec.request = '  Keep café 雪 / résumé exactly.  ';

    const work = Work.parse(input);

    expect(work.document).toEqual(input);
    expect(work.document.tasks).toEqual([]);
    expect(work.document.current).toEqual({ phaseId: null, taskId: null });
  });

  test('paused selections remain unfinished and resolvable', () => {
    const input = active();
    input.phases[0]!.status = 'paused';
    input.tasks[0]!.status = 'paused';

    const work = Work.parse(input);

    expect(work.plan.currentPhase?.status).toBe('paused');
    expect(work.plan.currentTask?.status).toBe('paused');
    expect(work.document).toEqual(input);
  });

  test('binds the requested identity before accepting a document', () => {
    const error = rejected(() => Work.parse(planning('other'), 'requested'));

    expect(error).toBeInstanceOf(PlanError);
    expect((error as PlanError).issues.map((issue) => issue.path)).toContainEqual(['workId']);
  });
});

describe('strict version-one document diagnostics', () => {
  test.each([
    ['unsupported version', ['schemaVersion'], () => ({ ...planning(), schemaVersion: 2 })],
    ['unknown field', [], () => ({ ...planning(), hidden: true })],
    [
      'missing memo',
      ['memo'],
      () => {
        const { memo: _memo, ...document } = planning();

        return document;
      },
    ],
    [
      'blank request',
      ['spec', 'request'],
      () => {
        const document = planning();
        document.spec.request = '  ';

        return document;
      },
    ],
    [
      'blank note',
      ['memo', 'decisions', 0],
      () => {
        const document = planning();
        document.memo.decisions = [' '];

        return document;
      },
    ],
    [
      'no requirements',
      ['spec', 'requirements'],
      () => {
        const document = planning();
        document.spec.requirements = [];

        return document;
      },
    ],
    ['no phases', ['phases'], () => ({ ...planning(), phases: [] })],
    ['unsafe ID', ['workId'], () => ({ ...planning(), workId: '../escape' })],
    [
      'unknown status',
      ['tasks', 0, 'status'],
      () => {
        const document = active();

        return { ...document, tasks: [{ ...document.tasks[0], status: 'finished' }] };
      },
    ],
    [
      'blank criterion',
      ['phases', 0, 'doneWhen', 0],
      () => {
        const document = planning();
        document.phases[0]!.doneWhen = [' '];

        return document;
      },
    ],
  ] as const)('rejects %s at its field', (_label, path, make) => {
    structuralIssue(make(), [...path]);
  });

  test.each(['met', 'withdrawn'] as const)('%s requirements need recorded evidence', (status) => {
    const document = planning();
    document.spec.requirements[0]!.status = status;

    structuralIssue(document, ['spec', 'requirements', 0, 'evidence']);
  });

  test.each(['done', 'cancelled'] as const)('%s phases and tasks each need evidence', (status) => {
    const phase = planning();
    phase.phases[0]!.status = status;

    structuralIssue(phase, ['phases', 0, 'evidence']);

    const task = active();
    task.tasks[0]!.status = status;

    structuralIssue(task, ['tasks', 0, 'evidence']);
  });
});

describe('relations report the broken consumer field', () => {
  test.each([
    [
      'phase requirement',
      ['phases', 0, 'requirements', 0],
      (document: FixtureDocument) => {
        document.phases[0]!.requirements = ['absent'];
      },
    ],
    [
      'task requirement',
      ['tasks', 0, 'requirements', 0],
      (document: FixtureDocument) => {
        document.tasks[0]!.requirements = ['absent'];
      },
    ],
    [
      'task phase',
      ['tasks', 0, 'phaseId'],
      (document: FixtureDocument) => {
        document.tasks[0]!.phaseId = 'absent';
      },
    ],
    [
      'phase dependency',
      ['phases', 0, 'dependsOn', 0],
      (document: FixtureDocument) => {
        document.phases[0]!.dependsOn = ['absent'];
      },
    ],
    [
      'task dependency',
      ['tasks', 0, 'dependsOn', 0],
      (document: FixtureDocument) => {
        document.tasks[0]!.dependsOn = ['absent'];
      },
    ],
    [
      'duplicate requirement reference',
      ['phases', 0, 'requirements', 1],
      (document: FixtureDocument) => {
        document.phases[0]!.requirements.push('outcome');
      },
    ],
    [
      'duplicate task requirement',
      ['tasks', 0, 'requirements', 1],
      (document: FixtureDocument) => {
        document.tasks[0]!.requirements.push('outcome');
      },
    ],
    [
      'phase self dependency',
      ['phases', 0, 'dependsOn', 0],
      (document: FixtureDocument) => {
        document.phases[0]!.dependsOn = ['deliver'];
      },
    ],
    [
      'task self dependency',
      ['tasks', 0, 'dependsOn', 0],
      (document: FixtureDocument) => {
        document.tasks[0]!.dependsOn = ['check'];
      },
    ],
    [
      'missing current phase',
      ['current', 'phaseId'],
      (document: FixtureDocument) => {
        document.current.phaseId = 'absent';
      },
    ],
    [
      'missing current task',
      ['current', 'taskId'],
      (document: FixtureDocument) => {
        document.current.taskId = 'absent';
      },
    ],
    [
      'unselected active phase',
      ['current', 'phaseId'],
      (document: FixtureDocument) => {
        document.current.phaseId = null;
      },
    ],
    [
      'unselected active task',
      ['current', 'taskId'],
      (document: FixtureDocument) => {
        document.current.taskId = null;
      },
    ],
    [
      'active task in inactive phase',
      ['tasks', 0, 'phaseId'],
      (document: FixtureDocument) => {
        document.phases[0]!.status = 'paused';
      },
    ],
    [
      'withdrawn active obligation',
      ['tasks', 0, 'requirements'],
      (document: FixtureDocument) => {
        document.spec.requirements[0]!.status = 'withdrawn';
        document.spec.requirements[0]!.evidence = ['User withdrew this scope.'];
      },
    ],
  ] as const)('rejects %s', (_label, path, mutate) => {
    const document = active();
    mutate(document);

    planIssue(document, [...path]);
  });

  test('rejects duplicate record IDs in each namespace', () => {
    const requirements = planning();
    requirements.spec.requirements.push({ ...requirements.spec.requirements[0]! });
    planIssue(requirements, ['spec', 'requirements', 1, 'id']);

    const phases = planning();
    phases.phases.push(structuredClone(phases.phases[0]!));
    planIssue(phases, ['phases', 1, 'id']);

    const tasks = active();
    tasks.tasks.push(structuredClone(tasks.tasks[0]!));
    planIssue(tasks, ['tasks', 1, 'id']);
  });

  test('a known requirement outside the task phase is still invalid', () => {
    const document = active();
    document.spec.requirements.push({
      id: 'other',
      text: 'An independent obligation.',
      status: 'open',
      evidence: [],
    });
    document.tasks[0]!.requirements = ['other'];

    planIssue(document, ['tasks', 0, 'requirements']);
  });

  test('both dependency graphs reject cycles, not only self edges', () => {
    const phases = planning();
    phases.phases[0]!.dependsOn = ['second'];
    phases.phases.push({
      ...structuredClone(phases.phases[0]!),
      id: 'second',
      dependsOn: ['deliver'],
    });
    planIssue(phases, ['phases']);

    const tasks = active();
    tasks.phases[0]!.status = 'planned';
    tasks.tasks[0]!.status = 'pending';
    tasks.tasks[0]!.dependsOn = ['second'];
    tasks.tasks.push({
      ...structuredClone(tasks.tasks[0]!),
      id: 'second',
      dependsOn: ['check'],
    });
    tasks.current = { phaseId: null, taskId: null };
    planIssue(tasks, ['tasks']);
  });

  test('deep acyclic dependencies remain usable without recursive traversal limits', () => {
    const document = planning();
    const phase = document.phases[0]!;
    document.phases = Array.from({ length: 12000 }, (_unused, index) => ({
      ...phase,
      id: `phase-${index}`,
      dependsOn: index === 11999 ? [] : [`phase-${index + 1}`],
    }));
    document.current.phaseId = 'phase-11999';

    const work = Work.parse(document);

    expect(work.plan.currentPhase?.id).toBe('phase-11999');
    expect(work.document.phases).toHaveLength(12000);
  });

  test('duplicate dependencies are diagnosed even when their target exists', () => {
    const document = active();
    document.phases.push({
      ...structuredClone(document.phases[0]!),
      id: 'previous',
      status: 'done',
      evidence: ['Previous outcome verified.'],
    });
    document.phases[0]!.dependsOn = ['previous', 'previous'];
    document.tasks.push({
      ...structuredClone(document.tasks[0]!),
      id: 'previous-task',
      status: 'done',
      evidence: ['Previous task verified.'],
    });
    document.tasks[0]!.dependsOn = ['previous-task', 'previous-task'];

    planIssue(document, ['phases', 0, 'dependsOn', 1]);
    planIssue(document, ['tasks', 0, 'dependsOn', 1]);
  });
});

describe('selected and completed work cannot hide unfinished obligations', () => {
  test.each(['done', 'cancelled'] as const)(
    'a %s phase cannot contain an unfinished child',
    (status) => {
      const document = active();
      document.phases[0]!.status = status;
      document.phases[0]!.evidence = ['Recorded phase decision.'];
      document.tasks[0]!.status = 'pending';
      document.current = { phaseId: null, taskId: null };

      planIssue(document, ['phases', 0, 'status']);
    },
  );

  test('terminal phase and task selections are rejected at their pointers', () => {
    const document = active();
    document.phases[0]!.status = 'done';
    document.phases[0]!.evidence = ['Phase complete.'];
    document.tasks[0]!.status = 'done';
    document.tasks[0]!.evidence = ['Task complete.'];

    planIssue(document, ['current', 'phaseId']);
    planIssue(document, ['current', 'taskId']);
  });

  test('a selected task must belong to the selected phase, including a null phase', () => {
    const document = active();
    document.phases[0]!.status = 'paused';
    document.tasks[0]!.status = 'paused';
    document.phases.push({
      ...structuredClone(document.phases[0]!),
      id: 'other',
    });
    document.current.phaseId = 'other';
    planIssue(document, ['current', 'taskId']);

    document.current.phaseId = null;
    planIssue(document, ['current', 'taskId']);
  });

  test('only one phase and one task can be active', () => {
    const document = active();
    document.phases.push({
      ...structuredClone(document.phases[0]!),
      id: 'other',
    });
    document.tasks.push({
      ...structuredClone(document.tasks[0]!),
      id: 'other-task',
      phaseId: 'other',
    });

    planIssue(document, ['phases']);
    planIssue(document, ['tasks']);
  });

  test('activation requires completed, not merely cancelled, dependencies', () => {
    const document = active();
    document.phases.push({
      ...structuredClone(document.phases[0]!),
      id: 'previous',
      status: 'cancelled',
      evidence: ['User cancelled the dependency.'],
    });
    document.phases[0]!.dependsOn = ['previous'];
    document.tasks.push({
      ...structuredClone(document.tasks[0]!),
      id: 'previous-task',
      status: 'cancelled',
      evidence: ['User cancelled the task dependency.'],
    });
    document.tasks[0]!.dependsOn = ['previous-task'];

    planIssue(document, ['phases', 0, 'dependsOn']);
    planIssue(document, ['tasks', 0, 'dependsOn']);

    document.phases[1]!.status = 'done';
    document.tasks[1]!.status = 'done';
    expect(Work.parse(document).document).toEqual(document);
  });
});
