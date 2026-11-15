import { readFile } from 'node:fs/promises';
import { buffer } from 'node:stream/consumers';
import { parseJsonBytes } from '../storage/json.js';
import { createStore } from '../storage/paths.js';
import type { SaveResult, Snapshot, SnapshotInfo } from '../storage/repository.js';
import { Repository } from '../storage/repository.js';
import { discoverWorkspace } from '../storage/workspace.js';
import { Work } from './work.js';

export interface LocationOptions {
  workspace?: string | undefined;
  store?: string | undefined;
}

export interface LoadOptions extends LocationOptions {
  work: string;
}

export interface SaveOptions extends LoadOptions {
  expect: string;
  file?: string | undefined;
}

async function openRepository(options: LocationOptions): Promise<Repository> {
  const workspace = await discoverWorkspace(options.workspace ?? process.cwd());
  const store = createStore(workspace, options.store);

  return new Repository(store);
}

export async function listMemos(options: LocationOptions): Promise<SnapshotInfo[]> {
  const repository = await openRepository(options);
  return repository.list();
}

export async function loadMemo(options: LoadOptions): Promise<Snapshot> {
  const repository = await openRepository(options);
  return repository.load(options.work);
}

export async function saveMemo(options: SaveOptions): Promise<SaveResult> {
  const bytes =
    options.file === undefined ? await buffer(process.stdin) : await readFile(options.file);

  const input = parseJsonBytes(bytes, options.file ?? 'Standard input');
  const work = Work.parse(input, options.work);
  const repository = await openRepository(options);

  return repository.save(work, options.expect);
}
