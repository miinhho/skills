import type { Document } from '../../src/memo/document.js';

type Mutable<T> = T extends readonly (infer Item)[]
  ? Mutable<Item>[]
  : T extends object
    ? { -readonly [Key in keyof T]: Mutable<T[Key]> }
    : T;

export type FixtureDocument = Mutable<Document>;

export function planning(workId = 'case-one'): FixtureDocument {
  return {
    schemaVersion: 1,
    workId,
    spec: {
      revision: 'contract-1',
      request: 'Preserve café 雪 exactly.',
      constraints: [],
      requirements: [
        {
          id: 'outcome',
          text: 'Deliver the requested outcome.',
          status: 'open',
          evidence: [],
        },
      ],
      sources: [],
    },
    scope: {
      id: 'delivery',
      goal: 'Deliver the outcome.',
    },
    phases: [
      {
        id: 'deliver',
        goal: 'Verify the outcome.',
        requirements: ['outcome'],
        dependsOn: [],
        status: 'planned',
        doneWhen: ['The outcome is verified.'],
        evidence: [],
      },
    ],
    tasks: [],
    current: {
      phaseId: null,
      taskId: null,
    },
    memo: {
      currentWork: 'Preparing the outcome.',
      nextAction: 'Check the outcome.',
      decisions: [],
      blockers: [],
      retrieval: [],
      deadEnds: [],
    },
  };
}

export function active(workId = 'case-one'): FixtureDocument {
  const document = planning(workId);
  document.phases[0]!.status = 'active';
  document.tasks.push({
    id: 'check',
    phaseId: 'deliver',
    title: 'Inspect the outcome.',
    requirements: ['outcome'],
    dependsOn: [],
    status: 'active',
    doneWhen: ['Inspection passes.'],
    evidence: [],
  });
  document.current.phaseId = 'deliver';
  document.current.taskId = 'check';

  return document;
}
