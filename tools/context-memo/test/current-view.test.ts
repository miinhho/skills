import { describe, expect, test } from 'vitest';
import { renderCurrent } from '../src/memo/current-view.js';
import { Work } from '../src/memo/work.js';
import { active, planning } from './fixtures/state-fixtures.js';

describe('a current brief carries authority without loading history', () => {
  test('shows global and withdrawn requirements, current detail, and compact future work, but not completed task history', () => {
    const input = active();
    input.spec.request = 'ORIGINAL_REQUEST includes the now-withdrawn export.';
    input.spec.constraints = ['GLOBAL_CONSTRAINT'];
    input.spec.sources = ['SOURCE_LOCATION.md'];
    input.spec.requirements.push(
      {
        id: 'global',
        text: 'GLOBAL_OPEN_OBLIGATION outside the current phase.',
        status: 'open',
        evidence: [],
      },
      {
        id: 'verified',
        text: 'GLOBAL_MET_OBLIGATION',
        status: 'met',
        evidence: ['GLOBAL_REQUIREMENT_PROOF'],
      },
      {
        id: 'export',
        text: 'WITHDRAWN_EXPORT_OBLIGATION',
        status: 'withdrawn',
        evidence: ['WITHDRAWAL_DECISION: the user cancelled export; do not revive it.'],
      },
    );
    input.phases[0]!.goal = 'CURRENT_PHASE_GOAL';
    input.phases[0]!.doneWhen = ['CURRENT_PHASE_CONDITION'];
    input.phases[0]!.evidence = ['CURRENT_PHASE_EVIDENCE'];
    input.tasks[0]!.title = 'CURRENT_TASK_TITLE';
    input.tasks[0]!.doneWhen = ['CURRENT_TASK_CONDITION'];
    input.tasks[0]!.evidence = ['CURRENT_TASK_EVIDENCE'];
    input.tasks.push({
      ...structuredClone(input.tasks[0]!),
      id: 'review',
      title: 'SAME_PHASE_PENDING_TITLE',
      status: 'needs-review',
      doneWhen: ['SAME_PHASE_PENDING_CONDITION'],
      evidence: ['SAME_PHASE_PENDING_EVIDENCE'],
    });
    input.phases.push(
      {
        ...structuredClone(input.phases[0]!),
        id: 'future',
        goal: 'FUTURE_PHASE_GOAL',
        requirements: ['global'],
        status: 'planned',
        doneWhen: ['FUTURE_PHASE_CONDITION'],
        evidence: [],
      },
      {
        ...structuredClone(input.phases[0]!),
        id: 'past',
        goal: 'HISTORICAL_PHASE_GOAL',
        requirements: ['verified'],
        status: 'done',
        doneWhen: ['HISTORICAL_PHASE_CONDITION'],
        evidence: ['HISTORICAL_PHASE_PROOF'],
      },
    );
    input.tasks.push(
      {
        ...structuredClone(input.tasks[0]!),
        id: 'future-task',
        phaseId: 'future',
        title: 'FUTURE_UNFINISHED_TITLE',
        requirements: ['global'],
        status: 'blocked',
        doneWhen: ['FUTURE_TASK_DETAIL_NOT_NEEDED'],
        evidence: ['FUTURE_TASK_PROOF_NOT_NEEDED'],
      },
      {
        ...structuredClone(input.tasks[0]!),
        id: 'past-task',
        phaseId: 'past',
        title: 'HISTORICAL_TASK_TITLE',
        requirements: ['verified'],
        status: 'done',
        doneWhen: ['HISTORICAL_TASK_CONDITION'],
        evidence: ['HISTORICAL_TASK_PROOF'],
      },
      {
        ...structuredClone(input.tasks[0]!),
        id: 'same-phase-done',
        title: 'CURRENT_PHASE_COMPLETED_HISTORY',
        status: 'done',
        evidence: ['CURRENT_PHASE_COMPLETED_PROOF'],
      },
    );
    input.memo.currentWork = 'MEMO_CURRENT_WORK';
    input.memo.nextAction = 'MEMO_NEXT_ACTION';
    input.memo.decisions = ['MEMO_DECISION'];
    input.memo.blockers = ['MEMO_BLOCKER'];
    input.memo.retrieval = ['RETRIEVAL_LOCATION.json'];
    input.memo.deadEnds = ['MEMO_DEAD_END'];
    const location = {
      path: '/private/work-case-one.json',
      revision: 'a'.repeat(64),
    };

    const brief = renderCurrent(Work.parse(input), location);

    for (const required of [
      input.spec.request,
      ...input.spec.constraints,
      ...input.spec.sources,
      ...input.spec.requirements.flatMap((item) => [item.id, item.text, ...item.evidence]),
      'CURRENT_PHASE_GOAL',
      'CURRENT_PHASE_CONDITION',
      'CURRENT_PHASE_EVIDENCE',
      'CURRENT_TASK_TITLE',
      'CURRENT_TASK_CONDITION',
      'CURRENT_TASK_EVIDENCE',
      'SAME_PHASE_PENDING_TITLE',
      'SAME_PHASE_PENDING_CONDITION',
      'future-task',
      'FUTURE_UNFINISHED_TITLE',
      'blocked',
      'MEMO_CURRENT_WORK',
      'MEMO_NEXT_ACTION',
      'MEMO_DECISION',
      'MEMO_BLOCKER',
      'RETRIEVAL_LOCATION.json',
      'MEMO_DEAD_END',
      location.path,
      location.revision,
    ]) {
      expect(brief, required).toContain(required);
    }

    expect(brief).toContain('export [withdrawn]');
    expect(brief).toContain('future');

    for (const historicalOrDeferred of [
      'FUTURE_TASK_DETAIL_NOT_NEEDED',
      'FUTURE_TASK_PROOF_NOT_NEEDED',
      'HISTORICAL_PHASE_GOAL',
      'HISTORICAL_PHASE_CONDITION',
      'HISTORICAL_PHASE_PROOF',
      'HISTORICAL_TASK_TITLE',
      'HISTORICAL_TASK_CONDITION',
      'HISTORICAL_TASK_PROOF',
      'CURRENT_PHASE_COMPLETED_HISTORY',
      'CURRENT_PHASE_COMPLETED_PROOF',
    ]) {
      expect(brief, historicalOrDeferred).not.toContain(historicalOrDeferred);
    }
  });

  test('planning with no selected work still exposes binding obligations and the next action', () => {
    const input = planning();
    const brief = renderCurrent(Work.parse(input), {
      path: '/private/planning.json',
      revision: 'b'.repeat(64),
    });

    expect(brief).toContain(input.spec.request);
    expect(brief).toContain(input.spec.requirements[0]!.text);
    expect(brief).toContain(input.memo.nextAction);
    expect(brief).toContain(input.phases[0]!.id);
  });
});
