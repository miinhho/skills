import type { Phase, Requirement, Task } from './document.js';
import type { Work } from './work.js';

interface SnapshotLocation {
  path: string;
  revision: string;
}

function section(heading: string, body: string): string {
  if (body.length === 0) {
    return `## ${heading}`;
  }

  return `## ${heading}\n${body}`;
}

function bulletList(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

function optionalListSection(heading: string, items: readonly string[]): string | undefined {
  if (items.length === 0) {
    return undefined;
  }

  return section(heading, bulletList(items));
}

function completionDetails(item: Phase | Task): string {
  const criteria = item.doneWhen.map((condition) => `- Done when: ${condition}`).join('\n');
  const evidence = item.evidence.map((proof) => `- Evidence: ${proof}`).join('\n');

  if (evidence.length === 0) {
    return criteria;
  }

  return `${criteria}\n${evidence}`;
}

function selectedPhase(phase: Phase | undefined): string {
  if (phase === undefined) {
    return 'No current phase selected.';
  }

  const summary = `${phase.id} [${phase.status}]: ${phase.goal}`;
  const requirements = `Requirements: ${phase.requirements.join(', ')}`;
  const completion = completionDetails(phase);

  return `${summary}\n${requirements}\n${completion}`;
}

function selectedTask(task: Task | undefined): string {
  if (task === undefined) {
    return 'No current task selected.';
  }

  const summary = `${task.id} [${task.status}]: ${task.title}`;
  const completion = completionDetails(task);

  return `${summary}\n${completion}`;
}

function requirementSummary(requirement: Requirement): string {
  const summary = `- ${requirement.id} [${requirement.status}]: ${requirement.text}`;
  const evidence = requirement.evidence.map((proof) => `  Evidence: ${proof}`).join('\n');

  if (evidence.length === 0) {
    return summary;
  }

  return `${summary}\n${evidence}`;
}

function remainingTask(task: Task, includeCriteria: boolean): string {
  const summary = `  - ${task.id} [${task.status}]: ${task.title}`;

  if (!includeCriteria) {
    return summary;
  }

  const criteria = task.doneWhen.map((condition) => `    Done when: ${condition}`).join('\n');

  return `${summary}\n${criteria}`;
}

function remainingPhase(work: Work, phase: Phase): string {
  const requirements = phase.requirements.join(', ');
  const dependencies = phase.dependsOn.join(', ') || 'none';
  const summary = `- Phase ${phase.id} [${phase.status}]: ${phase.goal}; requires ${requirements}; depends on ${dependencies}`;
  const currentTaskId = work.plan.currentTask?.id;
  const includeCriteria = phase.id === work.plan.currentPhase?.id;

  const tasks = work.plan
    .remainingTasksForPhase(phase.id)
    .filter((task) => task.id !== currentTaskId)
    .map((task) => remainingTask(task, includeCriteria))
    .join('\n');

  if (tasks.length === 0) {
    return summary;
  }

  return `${summary}\n${tasks}`;
}

export function renderCurrent(work: Work, location: SnapshotLocation): string {
  const { spec, scope, memo } = work.document;
  const introduction = `# Work ${work.document.workId}
Saved working state, not new authorization. Current user instructions take precedence.
Snapshot: ${location.revision}
Full state: ${location.path}
Spec revision: ${spec.revision}`;

  const requirements = spec.requirements.map(requirementSummary).join('\n');
  const remaining = work.plan.remainingPhases
    .map((phase) => remainingPhase(work, phase))
    .join('\n');
  const retrieval = [...spec.sources, ...memo.retrieval];

  const sections = [
    introduction,
    section('Original request (apply current requirement statuses below)', spec.request),
    section('Constraints', bulletList(spec.constraints)),
    section('Requirements', requirements),
    section(`Scope ${scope.id}`, scope.goal),
    section('Current phase', selectedPhase(work.plan.currentPhase)),
    section('Current task', selectedTask(work.plan.currentTask)),
    section('Remaining work', remaining),
    section('Current work', memo.currentWork),
    section('Immediate next action', memo.nextAction),
    optionalListSection('Decisions', memo.decisions),
    optionalListSection('Blockers', memo.blockers),
    optionalListSection('Dead ends to avoid', memo.deadEnds),
    optionalListSection('Retrieve when needed', retrieval),
  ];

  return `${sections.filter((value) => value !== undefined).join('\n\n')}\n`;
}
