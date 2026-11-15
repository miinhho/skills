import { describe, expect, test } from 'vitest';
import { PlanError } from '../src/memo/errors.js';
import { Work } from '../src/memo/work.js';
import type { FixtureDocument } from './fixtures/state-fixtures.js';
import { active, planning } from './fixtures/state-fixtures.js';

function replacementIssue(previous: Work, next: Work, path: (string | number)[]): void {
  let rejected: unknown;

  try {
    previous.replace(next);
  } catch (error) {
    rejected = error;
  }

  if (!(rejected instanceof PlanError)) {
    throw new Error('Expected an invalid replacement to be rejected.', { cause: rejected });
  }

  expect(rejected.issues.map((issue) => issue.path)).toContainEqual(path);
}

describe('accepted full-snapshot replacements', () => {
  test('progress returns the accepted document and retains exact requirement data', () => {
    const input = active();
    const previous = Work.parse(input);
    input.spec.requirements[0]!.status = 'met';
    input.spec.requirements[0]!.evidence = ['Recorded inspection passed.'];
    input.memo.currentWork = 'Inspection complete.';
    input.memo.nextAction = 'Prepare delivery.';
    const candidate = Work.parse(input);

    const accepted = previous.replace(candidate);

    expect(accepted.document).toEqual(input);
    expect(accepted.document.spec.requirements).toEqual(input.spec.requirements);
    expect(accepted.document.spec.revision).toBe('contract-1');
    expect(previous.document.spec.requirements[0]!.status).toBe('open');
  });

  test.each([
    [
      'request',
      (document: FixtureDocument) => {
        document.spec.request += ' Include the audit.';
      },
    ],
    [
      'constraint',
      (document: FixtureDocument) => {
        document.spec.constraints.push('Never modify source records.');
      },
    ],
    [
      'requirement text',
      (document: FixtureDocument) => {
        document.spec.requirements[0]!.text = 'Deliver the audited outcome.';
      },
    ],
    [
      'new requirement',
      (document: FixtureDocument) => {
        document.spec.requirements.push({
          id: 'audit',
          text: 'Keep the audit trail.',
          status: 'open',
          evidence: [],
        });
      },
    ],
    [
      'withdrawal',
      (document: FixtureDocument) => {
        document.spec.requirements[0]!.status = 'withdrawn';
        document.spec.requirements[0]!.evidence = ['User withdrew the outcome.'];
      },
    ],
  ] as const)('a changed %s needs a binding revision, not a snapshot hash', (_label, amend) => {
    const input = planning();
    const previous = Work.parse(input);
    amend(input);
    const unrevised = Work.parse(input);

    replacementIssue(previous, unrevised, ['spec', 'revision']);

    input.spec.revision = 'contract-2';
    const revised = Work.parse(input);

    expect(previous.replace(revised).document).toEqual(input);
  });

  test('restoring a withdrawn obligation also changes the binding contract', () => {
    const input = planning();
    input.spec.requirements[0]!.status = 'withdrawn';
    input.spec.requirements[0]!.evidence = ['User withdrew the outcome.'];
    const previous = Work.parse(input);
    input.spec.requirements[0]!.status = 'open';

    replacementIssue(previous, Work.parse(input), ['spec', 'revision']);

    input.spec.revision = 'restored-contract';
    expect(previous.replace(Work.parse(input)).document.spec.requirements[0]!.status).toBe('open');
  });

  test('removal cannot hide a prior requirement even when every remaining relation is valid', () => {
    const input = planning();
    input.spec.requirements.push({
      id: 'retained',
      text: 'Retain this independent obligation.',
      status: 'open',
      evidence: [],
    });
    const previous = Work.parse(input);
    input.spec.revision = 'contract-2';
    input.spec.requirements = input.spec.requirements.filter((item) => item.id !== 'retained');
    const validCandidate = Work.parse(input);

    expect(validCandidate.document.spec.requirements.map((item) => item.id)).toEqual(['outcome']);
    replacementIssue(previous, validCandidate, ['spec', 'requirements']);
  });

  test.each(['pending', 'paused', 'blocked', 'needs-review', 'active'] as const)(
    'removing an otherwise-valid %s task cannot erase the obligation',
    (status) => {
      const input = active();
      input.tasks[0]!.status = status;
      const previous = Work.parse(input);
      input.tasks = [];
      input.current.taskId = null;
      const validCandidate = Work.parse(input);

      expect(validCandidate.document.tasks).toEqual([]);
      replacementIssue(previous, validCandidate, ['tasks']);
    },
  );

  test('explicit withdrawal and cancellation retain the decision and accepted data', () => {
    const input = active();
    const previous = Work.parse(input);
    input.spec.revision = 'contract-2';
    input.spec.requirements[0]!.status = 'withdrawn';
    input.spec.requirements[0]!.evidence = ['User withdrew the outcome after review.'];
    input.tasks[0]!.status = 'cancelled';
    input.tasks[0]!.evidence = ['Task cancelled with the withdrawn outcome.'];
    input.phases[0]!.status = 'cancelled';
    input.phases[0]!.evidence = ['Phase cancelled by the user.'];
    input.current = { phaseId: null, taskId: null };
    const candidate = Work.parse(input);

    expect(previous.replace(candidate).document).toEqual(input);
    expect(candidate.document.spec.requirements[0]!.evidence).toEqual([
      'User withdrew the outcome after review.',
    ]);
    expect(candidate.document.tasks[0]!.status).toBe('cancelled');
  });

  test.each(['done', 'cancelled'] as const)(
    'terminal %s tasks may leave the forward snapshot',
    (status) => {
      const input = active();
      input.tasks[0]!.status = status;
      input.tasks[0]!.evidence = ['Recorded terminal decision.'];
      input.current.taskId = null;
      const previous = Work.parse(input);
      input.tasks = [];

      expect(previous.replace(Work.parse(input)).document).toEqual(input);
    },
  );

  test('replacement cannot rebind an existing work to another identity', () => {
    replacementIssue(Work.parse(planning('first')), Work.parse(planning('second')), ['workId']);
  });

  test('an otherwise-valid replacement reports every diagnostic family in obligation order', () => {
    const input = active('first');
    input.spec.requirements.push(
      {
        id: 'zeta',
        text: 'Keep the first independent obligation.',
        status: 'open',
        evidence: [],
      },
      {
        id: 'alpha',
        text: 'Keep the second independent obligation.',
        status: 'open',
        evidence: [],
      },
    );
    input.tasks.push({
      ...input.tasks[0]!,
      id: 'follow-up',
      status: 'pending',
    });
    const previous = Work.parse(input);

    input.workId = 'second';
    input.spec.requirements = input.spec.requirements.slice(0, 1);
    input.tasks = [];
    input.current.taskId = null;
    const validCandidate = Work.parse(input);
    let rejected: unknown;

    try {
      previous.replace(validCandidate);
    } catch (error) {
      rejected = error;
    }

    if (!(rejected instanceof PlanError)) {
      throw new Error('Expected all replacement violations to be rejected.', { cause: rejected });
    }

    expect(rejected.issues).toEqual([
      {
        path: ['workId'],
        message: 'Cannot change work identity',
      },
      {
        path: ['spec', 'requirements'],
        message: 'Keep requirement zeta; mark withdrawn instead of removing it',
      },
      {
        path: ['spec', 'requirements'],
        message: 'Keep requirement alpha; mark withdrawn instead of removing it',
      },
      {
        path: ['tasks'],
        message: 'Keep unfinished task check; mark cancelled instead of removing it',
      },
      {
        path: ['tasks'],
        message: 'Keep unfinished task follow-up; mark cancelled instead of removing it',
      },
      {
        path: ['spec', 'revision'],
        message:
          'Change the specification revision when the request, constraints, or requirement contract changes',
      },
    ]);
  });
});
