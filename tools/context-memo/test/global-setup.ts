import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'tsup';
import type { TestProject } from 'vitest/node';
import buildOptions from '../tsup.config.js';

declare module 'vitest' {
  interface ProvidedContext {
    bundle: string;
  }
}

export default async function setup(project: TestProject): Promise<() => Promise<void>> {
  const directory = await mkdtemp(join(tmpdir(), 'context-memo-tests-'));

  try {
    // Exercise the shipped CLI configuration without writing into an installed skill.
    await build({ ...buildOptions, config: false, outDir: directory, silent: true });
    project.provide('bundle', join(directory, 'context-memo.cjs'));
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    throw error;
  }

  return () => rm(directory, { recursive: true, force: true });
}
