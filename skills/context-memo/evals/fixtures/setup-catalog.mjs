// Setup only. Keep the grader and eval assertions out of executor inputs.
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [scenario, cliArg] = process.argv.slice(2);
if (!['phased', 'amend'].includes(scenario) || !cliArg || process.argv.length !== 4) {
  throw new Error('Usage: node setup-catalog.mjs phased|amend ABSOLUTE_CONTEXT_MEMO_BUNDLE');
}
const cli = resolve(cliArg);
const root = await mkdtemp(join(tmpdir(), `context-catalog-${scenario}-`));
const workspace = join(root, 'workspace');
const store = join(root, 'store');
await mkdir(workspace);
await mkdir(store);
const source = scenario === 'amend'
  ? `export function selectCatalog(items, { query = '', includeArchived = false } = {}) {
  const needle = query.trim().toLowerCase();
  return items.filter(item => item.name.toLowerCase().includes(needle));
}
`
  : `export function selectCatalog(items, { query = '', includeArchived = false } = {}) {
  return items.filter(item => item.name.includes(query));
}
`;
await writeFile(join(workspace, 'catalog.mjs'), source);
await writeFile(join(workspace, 'check-order.mjs'), `import assert from 'node:assert/strict';
import { selectCatalog } from './catalog.mjs';
const rows = Object.freeze([Object.freeze({id: 'b', name: 'beta', archived: false}), Object.freeze({id: 'a', name: 'alpha', archived: false})]);
assert.deepEqual(selectCatalog(rows).map(row => row.id), ['b', 'a']);
assert.deepEqual(selectCatalog(rows, {query: 'alpha'}).map(row => row.id), ['a']);
assert.deepEqual(rows.map(row => row.id), ['b', 'a']);
console.log('order, input preservation and ordinary matching passed');
`);
await writeFile(join(workspace, 'check-query.mjs'), `import assert from 'node:assert/strict';
import { selectCatalog } from './catalog.mjs';
const rows = [{id: 'b', name: 'Beta'}, {id: 'a', name: 'ALPHA'}, {id: 'c', name: 'Alpine'}];
assert.deepEqual(selectCatalog(rows, {query: ' ALP '}).map(row => row.id), ['a', 'c']);
assert.deepEqual(selectCatalog(rows, {query: '   '}).map(row => row.id), ['b', 'a', 'c']);
console.log('case and query whitespace checks passed');
`);
const run = file => execFileSync(process.execPath, [join(workspace, file)], { encoding: 'utf8', cwd: workspace }).trim();
const orderEvidence = `Observed setup command: node ${join(workspace, 'check-order.mjs')}; exit 0; ${run('check-order.mjs')}`;
const queryEvidence = scenario === 'amend'
  ? `Observed setup command: node ${join(workspace, 'check-query.mjs')}; exit 0; ${run('check-query.mjs')}` : null;
const req = (id, text, status = 'open', evidence = []) => ({ id, text, status, evidence });
const phase = (id, goal, requirements, dependsOn, status, doneWhen, evidence = []) => ({ id, goal, requirements, dependsOn, status, doneWhen: [doneWhen], evidence });
const task = (id, phaseId, title, requirements, status, doneWhen, evidence = []) => ({ id, phaseId, title, requirements, dependsOn: [], status, doneWhen: [doneWhen], evidence });
const state = {
  schemaVersion: 1,
  workId: 'catalog',
  spec: {
    revision: '1',
    request: 'Correct catalog filtering in phases: first trim query whitespace and ignore case, then exclude archived items unless includeArchived is true. Keep a CSV report enhancement pending until separately authorized.',
    constraints: ['Keep selectCatalog(items, options) and its named export.', 'Preserve input order and do not mutate items or options.', 'No dependencies, network, deployment, or changes outside the disposable evaluation root.', 'CSV reporting is pending; do not implement it.'],
    requirements: [
      req('order', 'Preserve input data and original matching-item order.', 'met', [orderEvidence]),
      req('query', 'Trim query whitespace and match names without case sensitivity.', scenario === 'amend' ? 'met' : 'open', queryEvidence ? [queryEvidence] : []),
      req('archive', 'Exclude archived items unless includeArchived is true.'),
      req('report', 'Add a CSV report only after separate user authorization.')
    ],
    sources: []
  },
  scope: { id: 'catalog-filter', goal: 'Correct catalog filtering while retaining the deferred report obligation.' },
  phases: [
    phase('baseline', 'Establish ordinary matching and preservation proof.', ['order'], [], 'done', 'Ordinary matching, order and frozen inputs pass.', [orderEvidence]),
    phase('normalize', 'Normalize query matching.', ['query', 'order'], ['baseline'], scenario === 'amend' ? 'done' : 'active', 'Focused checks prove query normalization and preserved order.', queryEvidence ? [queryEvidence, orderEvidence] : []),
    phase('archive', 'Apply archive visibility.', ['archive', 'order'], ['normalize'], scenario === 'amend' ? 'active' : 'planned', 'Focused checks prove default exclusion and explicit inclusion.'),
    phase('report', 'Implement separately authorized CSV reporting.', ['report'], ['archive'], 'planned', 'User authorizes reporting and its behavior is verified.')
  ],
  tasks: [
    task('baseline-proof', 'baseline', 'HISTORICAL_DETAIL_ONLY: check ordinary matching and frozen inputs.', ['order'], 'done', 'Order check exits zero.', [orderEvidence]),
    task('normalize-query', 'normalize', 'Implement and check query normalization.', ['query', 'order'], scenario === 'amend' ? 'done' : 'active', 'Case, whitespace, order and input-preservation checks pass.', queryEvidence ? [queryEvidence, orderEvidence] : []),
    task('archive-filter', 'archive', 'Implement and check archive visibility.', ['archive', 'order'], scenario === 'amend' ? 'active' : 'pending', 'Archived rows are hidden by default and included on explicit request.'),
    task('report-request', 'report', 'Retain the deferred CSV report request; await authorization.', ['report'], 'pending', 'Separate authorization received before implementation; report checks pass.')
  ],
  current: { phaseId: scenario === 'amend' ? 'archive' : 'normalize', taskId: scenario === 'amend' ? 'archive-filter' : 'normalize-query' },
  memo: {
    currentWork: scenario === 'amend' ? 'Query normalization is checked; archive implementation has not started.' : 'Baseline behavior is checked; query normalization is the current work.',
    nextAction: scenario === 'amend' ? 'Inspect catalog.mjs before implementing archive visibility.' : 'Read catalog.mjs and check-query.mjs; implement only query normalization first.',
    decisions: ['Existing future tasks came from an earlier plan; retain them, but elaborate new tasks only for the current Phase.'],
    blockers: [], retrieval: ['catalog.mjs', 'check-order.mjs', 'check-query.mjs'], deadEnds: []
  }
};
const destination = join(root, 'state.json');
await writeFile(destination, JSON.stringify(state, null, 2) + '\n');
const common = ['--work', 'catalog', '--workspace', workspace, '--store', store];
const acknowledgement = JSON.parse(execFileSync(process.execPath, [cli, 'save', ...common, '--expect', 'missing', '--file', destination], { encoding: 'utf8' }));
const manifest = {
  scenario, root, workspace, store, cli, destination, workId: 'catalog',
  initialRevision: acknowledgement.revision,
  initialSourceHash: createHash('sha256').update(source).digest('hex'),
  initialState: state
};
await writeFile(join(root, 'setup-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const quote = value => JSON.stringify(value);
const input = {
  root, workspace, store, cli, destination, workId: 'catalog',
  loadCurrent: `node ${quote(cli)} load --work catalog --view current --workspace ${quote(workspace)} --store ${quote(store)}`,
  loadFull: `node ${quote(cli)} load --work catalog --view full --workspace ${quote(workspace)} --store ${quote(store)}`,
  save: `node ${quote(cli)} save --work catalog --expect REVISION_FROM_LATEST_LOAD --file ${quote(destination)} --workspace ${quote(workspace)} --store ${quote(store)}`
};
await writeFile(join(root, 'executor-input.json'), JSON.stringify(input, null, 2) + '\n');
console.log(JSON.stringify({ ...input, executorInput: join(root, 'executor-input.json'), graderManifest: join(root, 'setup-manifest.json') }, null, 2));
