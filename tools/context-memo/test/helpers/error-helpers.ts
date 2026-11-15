import { vi } from 'vitest';
import { reportError } from '../../src/cli/errors.js';
import type { Diagnostic } from './process-helpers.js';
import { errorResponseSchema } from './process-helpers.js';

interface ReportedFailure {
  exit: NodeJS.Process['exitCode'];
  error: Diagnostic;
}

export function reported(error: unknown): ReportedFailure {
  const previousExit = process.exitCode;
  let stderr = '';
  const output = vi.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
    stderr += String(chunk);
    return true;
  });

  try {
    reportError(error);
    const diagnostic = errorResponseSchema.parse(JSON.parse(stderr));

    return {
      exit: process.exitCode,
      error: diagnostic.error,
    };
  } finally {
    output.mockRestore();
    process.exitCode = previousExit;
  }
}
