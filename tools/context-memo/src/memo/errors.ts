export type PlanIssue = {
  readonly path: readonly (string | number)[];
  readonly message: string;
};

export class PlanError extends Error {
  constructor(
    readonly issues: readonly PlanIssue[],
    options?: ErrorOptions,
  ) {
    super('The working plan is invalid.', options);
    this.name = 'PlanError';
  }
}

export type ReplacementRejection = {
  readonly identityChanged: boolean;
  readonly removedRequirementIds: readonly string[];
  readonly removedUnfinishedTaskIds: readonly string[];
  readonly revisionRequired: boolean;
};

export class ReplacementError extends PlanError {
  constructor(readonly rejection: ReplacementRejection) {
    const identityIssues: readonly PlanIssue[] = rejection.identityChanged
      ? [
          {
            path: ['workId'],
            message: 'Cannot change work identity',
          },
        ]
      : [];
    const revisionIssues: readonly PlanIssue[] = rejection.revisionRequired
      ? [
          {
            path: ['spec', 'revision'],
            message:
              'Change the specification revision when the request, constraints, or requirement contract changes',
          },
        ]
      : [];

    super([
      ...identityIssues,
      ...rejection.removedRequirementIds.map((id) => ({
        path: ['spec', 'requirements'],
        message: `Keep requirement ${id}; mark withdrawn instead of removing it`,
      })),
      ...rejection.removedUnfinishedTaskIds.map((id) => ({
        path: ['tasks'],
        message: `Keep unfinished task ${id}; mark cancelled instead of removing it`,
      })),
      ...revisionIssues,
    ]);
  }
}

export class WorkNotFoundError extends Error {
  constructor(
    readonly workId: string,
    options?: ErrorOptions,
  ) {
    super(`No state exists for work ${JSON.stringify(workId)}.`, options);
    this.name = 'WorkNotFoundError';
  }
}

export class RevisionConflictError extends Error {
  constructor(
    readonly expected: string,
    readonly actual: string,
    options?: ErrorOptions,
  ) {
    super('The saved snapshot does not match --expect.', options);
    this.name = 'RevisionConflictError';
  }
}
