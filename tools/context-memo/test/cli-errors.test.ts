import { describe, expect, test } from 'vitest';
import { PlanError, RevisionConflictError } from '../src/memo/errors.js';
import { reported } from './helpers/error-helpers.js';

// esbuild's disposal lowering uses this standard shape when no native constructor exists.
function suppressed(cleanup: Error, earlier: Error): Error {
  return Object.assign(new Error('An error was suppressed during disposal.'), {
    name: 'SuppressedError',
    error: cleanup,
    suppressed: earlier,
  });
}

describe('cleanup never replaces the primary failure contract', () => {
  test('nested cleanup failures preserve the conflict exit, both revisions and every cleanup cause', () => {
    const expected = 'a'.repeat(64);
    const actual = 'b'.repeat(64);
    const conflict = new RevisionConflictError(expected, actual);
    const inner = Object.assign(new Error('Inner lease release failed.'), { code: 'ERELEASED' });
    const filesystem = Object.assign(new Error('Filesystem refused release.'), {
      code: 'EACCES',
      path: '/private/work.lock',
    });
    const outer = new Error('Outer resource release failed.', { cause: filesystem });

    const output = reported(suppressed(outer, suppressed(inner, conflict)));

    expect(output.exit).toBe(3);
    expect(output.error.code).toBe('CONFLICT');
    expect(output.error.details).toMatchObject({
      expected,
      actual,
      releaseErrors: [
        { message: inner.message, code: 'ERELEASED' },
        {
          message: outer.message,
          cause: {
            message: filesystem.message,
            code: 'EACCES',
            path: '/private/work.lock',
          },
        },
      ],
    });
  });

  test('field-oriented state diagnostics survive a failed disposal', () => {
    const invalid = new PlanError([
      {
        path: ['tasks', 0, 'phaseId'],
        message: 'The task must belong to a recorded phase.',
      },
    ]);
    const cleanup = Object.assign(new Error('Lease release failed.'), { code: 'ERELEASED' });

    const output = reported(suppressed(cleanup, invalid));

    expect(output.exit).toBe(1);
    expect(output.error.code).toBe('INVALID_STATE');
    expect(output.error.details?.issues).toEqual([
      {
        path: 'tasks.0.phaseId',
        message: 'The task must belong to a recorded phase.',
      },
    ]);
    expect(output.error.details?.releaseErrors).toEqual([
      expect.objectContaining({ message: cleanup.message, code: 'ERELEASED' }),
    ]);
  });
});
