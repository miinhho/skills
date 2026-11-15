import { Errors } from '@oclif/core';
import { ZodError } from 'zod';
import { PlanError, RevisionConflictError, WorkNotFoundError } from '../memo/errors.js';
import {
  DocumentSyntaxError,
  hasCode,
  InvalidInputError,
  StoredStateError,
} from '../storage/errors.js';

type ErrorCode = 'INVALID_INPUT' | 'INVALID_STATE' | 'IO_ERROR' | 'NOT_FOUND' | 'CONFLICT' | 'BUSY';

interface FailureDetails extends Record<string, unknown> {
  releaseErrors?: Record<string, unknown>[];
}

interface Failure {
  code: ErrorCode;
  message: string;
  details?: FailureDetails;
}

type DisposalFailure = Error & {
  error: unknown;
  suppressed: unknown;
};

const exitCodes: Record<ErrorCode, number> = {
  INVALID_INPUT: 1,
  INVALID_STATE: 1,
  IO_ERROR: 1,
  NOT_FOUND: 2,
  CONFLICT: 3,
  BUSY: 4,
};

function isDisposalFailure(error: unknown): error is DisposalFailure {
  return (
    error instanceof Error &&
    error.name === 'SuppressedError' &&
    'error' in error &&
    'suppressed' in error
  );
}

function issues(error: ZodError | PlanError | InvalidInputError): FailureDetails {
  return {
    issues: (error.issues ?? []).map((issue) => ({
      path: issue.path.map(String).join('.') || '$',
      message: issue.message,
    })),
  };
}

function diagnostic(error: unknown): Record<string, unknown> {
  const result: Record<string, unknown> = {
    message: error instanceof Error ? error.message : String(error),
  };

  if (!(error instanceof Error)) {
    return result;
  }

  result.name = error.name;

  for (const field of ['code', 'path', 'syscall', 'errno'] as const) {
    if (field in error) {
      result[field] = Reflect.get(error, field);
    }
  }

  if (error instanceof DocumentSyntaxError) {
    result.source = error.source;
  }

  if (
    error instanceof ZodError ||
    error instanceof PlanError ||
    error instanceof InvalidInputError
  ) {
    Object.assign(result, issues(error));
  }

  if (isDisposalFailure(error)) {
    result.error = diagnostic(error.error);
    result.suppressed = diagnostic(error.suppressed);
  }

  if (error.cause !== undefined) {
    result.cause = diagnostic(error.cause);
  }

  return result;
}

function classify(error: unknown): Failure {
  if (isDisposalFailure(error)) {
    const primary = classify(error.suppressed);
    const releaseErrors = primary.details?.releaseErrors ?? [];

    return {
      ...primary,
      details: {
        ...primary.details,
        releaseErrors: [...releaseErrors, diagnostic(error.error)],
      },
    };
  }

  const message = error instanceof Error ? error.message : String(error);

  if (error instanceof InvalidInputError) {
    return {
      code: 'INVALID_INPUT',
      message,
      ...(error.issues ? { details: issues(error) } : {}),
    };
  }

  if (error instanceof DocumentSyntaxError) {
    return {
      code: 'INVALID_INPUT',
      message,
      details: {
        source: error.source,
        cause: diagnostic(error.cause),
      },
    };
  }

  if (error instanceof StoredStateError) {
    const cause = error.cause;

    return {
      code: 'INVALID_STATE',
      message,
      details: {
        path: error.path,
        cause: diagnostic(cause),
        ...(cause instanceof ZodError || cause instanceof PlanError ? issues(cause) : {}),
      },
    };
  }

  if (error instanceof ZodError || error instanceof PlanError) {
    return {
      code: 'INVALID_STATE',
      message: 'State validation failed.',
      details: issues(error),
    };
  }

  if (error instanceof WorkNotFoundError) {
    return { code: 'NOT_FOUND', message };
  }

  if (error instanceof RevisionConflictError) {
    return {
      code: 'CONFLICT',
      message,
      details: {
        expected: error.expected,
        actual: error.actual,
      },
    };
  }

  if (hasCode(error, 'ELOCKED') || hasCode(error, 'ECOMPROMISED') || hasCode(error, 'ERELEASED')) {
    return {
      code: 'BUSY',
      message,
      details: diagnostic(error),
    };
  }

  if (error instanceof Errors.CLIError) {
    return { code: 'INVALID_INPUT', message };
  }

  return {
    code: 'IO_ERROR',
    message,
    details: diagnostic(error),
  };
}

export function reportError(error: unknown): void {
  if (error instanceof Errors.CLIError && error.oclif.exit === 0) {
    return;
  }

  const failure = classify(error);

  process.exitCode = exitCodes[failure.code];
  process.stderr.write(`${JSON.stringify({ error: failure })}\n`);
}
