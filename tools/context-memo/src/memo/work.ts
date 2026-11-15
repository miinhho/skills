import { compareDocuments } from './changes.js';
import { type Document, documentSchema } from './document.js';
import { PlanError, ReplacementError } from './errors.js';
import { Plan } from './plan.js';

export class Work {
  readonly #document: Document;
  readonly #plan: Plan;

  private constructor(document: Document) {
    this.#document = document;
    this.#plan = Plan.from(document);

    Object.freeze(this);
  }

  static parse(input: unknown, expectedWorkId?: string): Work {
    const document = documentSchema.parse(input);
    if (expectedWorkId !== undefined && document.workId !== expectedWorkId) {
      throw new PlanError([
        {
          path: ['workId'],
          message: `State workId must match requested work ${JSON.stringify(expectedWorkId)}; received ${JSON.stringify(document.workId)}.`,
        },
      ]);
    }

    return new Work(document);
  }

  get document(): Document {
    return this.#document;
  }

  get plan(): Plan {
    return this.#plan;
  }

  replace(next: Work): Work {
    const changes = compareDocuments(this, next);
    const isSameIdentity = this.#document.workId === next.#document.workId;
    const isObligationsRetained =
      changes.removedRequirements.length === 0 && changes.removedUnfinishedTasks.length === 0;
    const isRevisionChanged = this.#document.spec.revision !== next.#document.spec.revision;
    const isRevisionAppropriate = !changes.contractChanged || isRevisionChanged;

    if (isSameIdentity && isObligationsRetained && isRevisionAppropriate) {
      return next;
    }

    throw new ReplacementError({
      identityChanged: !isSameIdentity,
      removedRequirementIds: changes.removedRequirements,
      removedUnfinishedTaskIds: changes.removedUnfinishedTasks,
      revisionRequired: !isRevisionAppropriate,
    });
  }
}
