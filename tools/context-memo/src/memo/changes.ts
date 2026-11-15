import { isDeepStrictEqual } from 'node:util';
import type { Document, Requirement } from './document.js';
import type { Work } from './work.js';

export interface ChangeSet {
  removedRequirements: string[];
  removedUnfinishedTasks: string[];
  contractChanged: boolean;
}

function isRequirementContractChanged(previous: Requirement, next: Requirement): boolean {
  const sameText = previous.text === next.text;
  const wasWithdrawn = previous.status === 'withdrawn';
  const isWithdrawn = next.status === 'withdrawn';
  const sameWithdrawalStatus = wasWithdrawn === isWithdrawn;

  return !sameText || !sameWithdrawalStatus;
}

function isContractChanged(
  previous: Document['spec'],
  next: Document['spec'],
  requirementContractChanged: boolean,
): boolean {
  const sameRequest = previous.request === next.request;
  if (!sameRequest) {
    return true;
  }

  const sameConstraints = isDeepStrictEqual(previous.constraints, next.constraints);
  const sameRequirementCount = previous.requirements.length === next.requirements.length;

  return !sameConstraints || !sameRequirementCount || requirementContractChanged;
}

export function compareDocuments(previous: Work, next: Work): ChangeSet {
  const previousSpec = previous.document.spec;
  const nextSpec = next.document.spec;
  const removedRequirements: string[] = [];
  const removedUnfinishedTasks: string[] = [];

  let requirementContractChanged = false;

  for (const requirement of previousSpec.requirements) {
    const replacement = next.plan.requirement(requirement.id);

    if (!replacement) {
      removedRequirements.push(requirement.id);
      requirementContractChanged = true;
      continue;
    }

    if (isRequirementContractChanged(requirement, replacement)) {
      requirementContractChanged = true;
    }
  }

  for (const task of previous.document.tasks) {
    const isFinished = task.status === 'done' || task.status === 'cancelled';

    if (isFinished) {
      continue;
    }

    if (next.plan.task(task.id)) {
      continue;
    }

    removedUnfinishedTasks.push(task.id);
  }

  return {
    removedRequirements,
    removedUnfinishedTasks,
    contractChanged: isContractChanged(previousSpec, nextSpec, requirementContractChanged),
  };
}
