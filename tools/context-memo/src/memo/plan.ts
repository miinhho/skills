import type { Document, Phase, Requirement, Task } from './document.js';
import { PlanError, type PlanIssue } from './errors.js';

type DependencyRecord = {
  readonly id: string;
  readonly dependsOn: readonly string[];
};

type DependencyFrame = {
  readonly record: DependencyRecord;
  next: number;
};

const noTasks: readonly Task[] = Object.freeze([]);

export class Plan {
  readonly currentPhase: Phase | undefined;
  readonly currentTask: Task | undefined;

  readonly #document: Document;
  readonly #requirements: Map<string, Requirement>;
  readonly #phases: Map<string, Phase>;
  readonly #tasks: Map<string, Task>;
  readonly #remainingTasksByPhase = new Map<string, Task[]>();
  readonly #remainingPhases: Phase[] = [];
  readonly #issues: PlanIssue[] = [];

  private constructor(document: Document) {
    this.#document = document;
    this.#requirements = this.#indexRecords(document.spec.requirements, ['spec', 'requirements']);
    this.#phases = this.#indexRecords(document.phases, ['phases']);
    this.#tasks = this.#indexRecords(document.tasks, ['tasks']);

    const { phaseId, taskId } = document.current;

    if (phaseId !== null) {
      this.currentPhase = this.#phases.get(phaseId);
    }

    if (taskId !== null) {
      this.currentTask = this.#tasks.get(taskId);
    }

    this.#checkDependencies('phases');
    this.#checkDependencies('tasks');

    const activeTasks = this.#checkTasks();
    const activePhases = this.#checkPhases();

    if (activePhases > 1) {
      this.#issues.push({
        path: ['phases'],
        message: 'Only one phase may be active',
      });
    }

    if (activeTasks > 1) {
      this.#issues.push({
        path: ['tasks'],
        message: 'Only one task may be active',
      });
    }

    this.#checkCurrent();

    if (this.#issues.length > 0) {
      throw new PlanError(this.#issues);
    }

    for (const tasks of this.#remainingTasksByPhase.values()) {
      Object.freeze(tasks);
    }
    Object.freeze(this.#remainingPhases);

    Object.freeze(this);
  }

  static from(document: Document): Plan {
    return new Plan(document);
  }

  requirement(id: string): Requirement | undefined {
    return this.#requirements.get(id);
  }

  phase(id: string): Phase | undefined {
    return this.#phases.get(id);
  }

  task(id: string): Task | undefined {
    return this.#tasks.get(id);
  }

  get remainingPhases(): readonly Phase[] {
    return this.#remainingPhases;
  }

  remainingTasksForPhase(id: string): readonly Task[] {
    return this.#remainingTasksByPhase.get(id) ?? noTasks;
  }

  #indexRecords<T extends { readonly id: string }>(
    items: readonly T[],
    path: readonly (string | number)[],
  ): Map<string, T> {
    const records = new Map<string, T>();

    items.forEach((item, index) => {
      if (records.has(item.id)) {
        this.#issues.push({
          path: [...path, index, 'id'],
          message: `Duplicate ID: ${item.id}`,
        });
      }

      records.set(item.id, item);
    });

    return records;
  }

  #checkReferences(
    values: readonly string[],
    records: ReadonlyMap<string, unknown>,
    path: readonly (string | number)[],
    self?: string,
  ): void {
    const seen = new Set<string>();

    values.forEach((id, index) => {
      if (!records.has(id)) {
        this.#issues.push({
          path: [...path, index],
          message: `Unknown reference: ${id}`,
        });
      }

      if (seen.has(id)) {
        this.#issues.push({
          path: [...path, index],
          message: `Duplicate reference: ${id}`,
        });
      }

      if (id === self) {
        this.#issues.push({
          path: [...path, index],
          message: 'Cannot depend on itself',
        });
      }

      seen.add(id);
    });
  }

  #checkDependencies(collection: 'phases' | 'tasks'): void {
    const items = this.#document[collection];
    const records: ReadonlyMap<string, DependencyRecord> =
      collection === 'phases' ? this.#phases : this.#tasks;

    items.forEach((item, index) => {
      this.#checkReferences(item.dependsOn, records, [collection, index, 'dependsOn'], item.id);
    });

    const states = new Map<string, 'visiting' | 'visited'>();
    const stack: DependencyFrame[] = [];

    for (const record of records.values()) {
      if (states.has(record.id)) {
        continue;
      }

      states.set(record.id, 'visiting');
      stack.push({
        record,
        next: 0,
      });

      for (
        let frame = stack[stack.length - 1];
        frame !== undefined;
        frame = stack[stack.length - 1]
      ) {
        const dependencyId = frame.record.dependsOn[frame.next];

        if (dependencyId === undefined) {
          states.set(frame.record.id, 'visited');
          stack.pop();

          continue;
        }

        frame.next += 1;
        const dependency = records.get(dependencyId);

        if (!dependency || states.get(dependencyId) === 'visited') {
          continue;
        }
        if (states.get(dependencyId) === 'visiting') {
          this.#issues.push({
            path: [collection],
            message: 'Dependency graph contains a cycle',
          });

          return;
        }

        states.set(dependencyId, 'visiting');
        stack.push({
          record: dependency,
          next: 0,
        });
      }
    }
  }

  #checkTasks(): number {
    let active = 0;

    this.#document.tasks.forEach((task, index) => {
      const phase = this.#phases.get(task.phaseId);

      this.#groupRemainingTask(task);
      this.#checkTaskMembership(task, phase, index);

      if (task.status !== 'active') {
        return;
      }

      active += 1;
      this.#checkActiveTask(task, phase, index);
    });

    return active;
  }

  #groupRemainingTask(task: Task): void {
    const isFinished = task.status === 'done' || task.status === 'cancelled';

    if (isFinished) {
      return;
    }

    const grouped = this.#remainingTasksByPhase.get(task.phaseId);

    if (grouped) {
      grouped.push(task);

      return;
    }

    this.#remainingTasksByPhase.set(task.phaseId, [task]);
  }

  #checkTaskMembership(task: Task, phase: Phase | undefined, index: number): void {
    if (!phase) {
      this.#issues.push({
        path: ['tasks', index, 'phaseId'],
        message: `Unknown phase: ${task.phaseId}`,
      });
    }

    this.#checkReferences(task.requirements, this.#requirements, ['tasks', index, 'requirements']);

    if (!phase) {
      return;
    }

    const requirementsBelongToPhase = task.requirements.every((id) =>
      phase.requirements.includes(id),
    );

    if (!requirementsBelongToPhase) {
      this.#issues.push({
        path: ['tasks', index, 'requirements'],
        message: 'Task requirements must belong to its phase',
      });
    }
  }

  #checkActiveTask(task: Task, phase: Phase | undefined, index: number): void {
    const isSelected = task.id === this.#document.current.taskId;
    const hasActivePhase = phase?.status === 'active';
    const dependenciesDone = task.dependsOn.every((id) => this.#tasks.get(id)?.status === 'done');
    const targetsWithdrawnRequirement = task.requirements.some(
      (id) => this.#requirements.get(id)?.status === 'withdrawn',
    );

    if (!isSelected) {
      this.#issues.push({
        path: ['current', 'taskId'],
        message: 'Must select the active task',
      });
    }

    if (!hasActivePhase) {
      this.#issues.push({
        path: ['tasks', index, 'phaseId'],
        message: 'Active task requires an active phase',
      });
    }

    if (!dependenciesDone) {
      this.#issues.push({
        path: ['tasks', index, 'dependsOn'],
        message: 'Active task dependencies must be done',
      });
    }

    if (targetsWithdrawnRequirement) {
      this.#issues.push({
        path: ['tasks', index, 'requirements'],
        message: 'Active task cannot target withdrawn requirements',
      });
    }
  }

  #checkPhases(): number {
    let active = 0;

    this.#document.phases.forEach((phase, index) => {
      this.#checkReferences(phase.requirements, this.#requirements, [
        'phases',
        index,
        'requirements',
      ]);
      this.#collectRemainingPhase(phase, index);

      if (phase.status !== 'active') {
        return;
      }

      active += 1;
      this.#checkActivePhase(phase, index);
    });

    return active;
  }

  #collectRemainingPhase(phase: Phase, index: number): void {
    const isFinished = phase.status === 'done' || phase.status === 'cancelled';

    if (!isFinished) {
      this.#remainingPhases.push(phase);

      return;
    }

    if (!this.#remainingTasksByPhase.has(phase.id)) {
      return;
    }

    this.#issues.push({
      path: ['phases', index, 'status'],
      message: 'A done/cancelled phase cannot contain unfinished tasks',
    });
  }

  #checkActivePhase(phase: Phase, index: number): void {
    const isSelected = phase.id === this.#document.current.phaseId;
    const dependenciesDone = phase.dependsOn.every((id) => this.#phases.get(id)?.status === 'done');
    const targetsWithdrawnRequirement = phase.requirements.some(
      (id) => this.#requirements.get(id)?.status === 'withdrawn',
    );

    if (!isSelected) {
      this.#issues.push({
        path: ['current', 'phaseId'],
        message: 'Must select the active phase',
      });
    }

    if (!dependenciesDone) {
      this.#issues.push({
        path: ['phases', index, 'dependsOn'],
        message: 'Active phase dependencies must be done',
      });
    }

    if (targetsWithdrawnRequirement) {
      this.#issues.push({
        path: ['phases', index, 'requirements'],
        message: 'Active phase cannot target withdrawn requirements',
      });
    }
  }

  #checkCurrent(): void {
    const current = this.#document.current;
    const hasUnknownPhase = current.phaseId !== null && !this.currentPhase;
    const hasUnknownTask = current.taskId !== null && !this.currentTask;

    if (hasUnknownPhase) {
      this.#issues.push({
        path: ['current', 'phaseId'],
        message: 'Unknown current phase',
      });
    }

    if (hasUnknownTask) {
      this.#issues.push({
        path: ['current', 'taskId'],
        message: 'Unknown current task',
      });
    }

    this.#checkCurrentPhase();
    this.#checkCurrentTask();
  }

  #checkCurrentPhase(): void {
    const phase = this.currentPhase;

    if (!phase) {
      return;
    }

    const isFinished = phase.status === 'done' || phase.status === 'cancelled';

    if (isFinished) {
      this.#issues.push({
        path: ['current', 'phaseId'],
        message: 'Current phase must be unfinished',
      });
    }
  }

  #checkCurrentTask(): void {
    const task = this.currentTask;

    if (!task) {
      return;
    }

    const isFinished = task.status === 'done' || task.status === 'cancelled';
    const belongsToCurrentPhase = task.phaseId === this.#document.current.phaseId;

    if (isFinished) {
      this.#issues.push({
        path: ['current', 'taskId'],
        message: 'Current task must be unfinished',
      });
    }

    if (!belongsToCurrentPhase) {
      this.#issues.push({
        path: ['current', 'taskId'],
        message: 'Current task must belong to current phase',
      });
    }
  }
}
