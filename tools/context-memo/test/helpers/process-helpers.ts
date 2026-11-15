import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, inject } from 'vitest';
import { z } from 'zod';
import type { FixtureDocument } from '../fixtures/state-fixtures.js';

export const bundle = inject('bundle');

export interface CaseFixture {
  root: string;
  workspace: string;
  store: string;
  cleanup(): Promise<void>;
}

export interface Result {
  code: number | null;
  stdout: string;
  stderr: string;
}

export interface Saved {
  workId: string;
  workspace: string;
  path: string;
  revision: string;
}

export interface Loaded extends Saved {
  state: FixtureDocument;
}

const errorSchema = z.strictObject({
  code: z.enum(['INVALID_INPUT', 'INVALID_STATE', 'IO_ERROR', 'NOT_FOUND', 'CONFLICT', 'BUSY']),
  message: z.string().regex(/\S/),
  details: z
    .looseObject({
      issues: z
        .array(
          z.strictObject({
            path: z.string(),
            message: z.string(),
          }),
        )
        .optional(),
      releaseErrors: z.array(z.record(z.string(), z.unknown())).optional(),
    })
    .optional(),
});

export const errorResponseSchema = z.strictObject({ error: errorSchema });
export type Diagnostic = z.infer<typeof errorSchema>;

export function digest(bytes: string | Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export async function temporaryCase(): Promise<CaseFixture> {
  const root = await mkdtemp(join(tmpdir(), 'context-memo-consumer-'));
  const workspace = join(root, 'workspace café 雪');
  const store = join(root, 'private store');

  await mkdir(workspace);

  return {
    root,
    workspace,
    store,
    cleanup: () => rm(root, { recursive: true, force: true }),
  };
}

export function run(
  executable: string,
  args: string[],
  options: {
    cwd: string;
    input?: string | Uint8Array | undefined;
    env?: NodeJS.ProcessEnv;
  },
): Promise<Result> {
  const { promise, resolve, reject } = Promise.withResolvers<Result>();
  const child = spawn(executable, args, {
    cwd: options.cwd,
    env: {
      ...process.env,
      ...options.env,
      NODE_PATH: '',
    },
    stdio: ['pipe', 'pipe', 'pipe'],
    windowsHide: true,
  });
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];

  child.on('error', reject);
  child.stdout.on('data', (chunk: Buffer) => stdout.push(chunk));
  child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
  child.stdin.on('error', (error: NodeJS.ErrnoException) => {
    // Native argument rejection may close stdin before consuming a document.
    if (error.code !== 'EPIPE' && error.code !== 'ERR_STREAM_DESTROYED') {
      reject(error);
    }
  });
  child.on('close', (code) => {
    resolve({
      code,
      stdout: Buffer.concat(stdout).toString('utf8'),
      stderr: Buffer.concat(stderr).toString('utf8'),
    });
  });
  child.stdin.end(options.input ?? '');

  return promise;
}

export function cli(
  fixture: CaseFixture,
  args: string[],
  input?: unknown,
  script = bundle,
): Promise<Result> {
  let bytes: string | Uint8Array | undefined;

  if (typeof input === 'string' || input instanceof Uint8Array) {
    bytes = input;
  } else if (input !== undefined) {
    bytes = JSON.stringify(input);
  }

  return run(
    process.execPath,
    [script, ...args, '--workspace', fixture.workspace, '--store', fixture.store],
    {
      cwd: fixture.workspace,
      input: bytes,
    },
  );
}

export function json<T>(result: Result): T {
  expect(result.code, result.stderr).toBe(0);
  expect(result.stderr).toBe('');

  return JSON.parse(result.stdout) as T;
}

export function failure(result: Result, exit: number, code: string): Diagnostic {
  expect(result.code, result.stderr).toBe(exit);
  expect(result.stdout).toBe('');

  const diagnostic = errorResponseSchema.parse(JSON.parse(result.stderr));
  expect(diagnostic.error.code).toBe(code);
  expect(diagnostic.error.message.trim().length).toBeGreaterThan(0);

  return diagnostic.error;
}

export async function absent(path: string): Promise<void> {
  await expect(stat(path)).rejects.toMatchObject({ code: 'ENOENT' });
}

export async function save(
  fixture: CaseFixture,
  document: FixtureDocument,
  expected = 'missing',
  script = bundle,
): Promise<Saved> {
  return json<Saved>(
    await cli(fixture, ['save', '--work', document.workId, '--expect', expected], document, script),
  );
}

export async function load(
  fixture: CaseFixture,
  workId = 'case-one',
  script = bundle,
): Promise<Loaded> {
  return json<Loaded>(
    await cli(fixture, ['load', '--work', workId, '--view', 'full'], undefined, script),
  );
}
