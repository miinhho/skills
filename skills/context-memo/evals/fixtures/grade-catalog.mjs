// Grader only. Never supply this file, setup-manifest.json or grading output to executors.
import assert from 'node:assert/strict';
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const [rootArg, mode] = process.argv.slice(2);
if (!rootArg || !['phase1', 'phase2', 'pause', 'amend', 'resume'].includes(mode) || process.argv.length !== 4) {
  throw new Error('Usage: node grade-catalog.mjs ROOT phase1|phase2|pause|amend|resume');
}
const root = resolve(rootArg);
const manifest = JSON.parse(await readFile(join(root, 'setup-manifest.json'), 'utf8'));
assert.equal(manifest.root, root);
assert.equal(manifest.scenario, mode.startsWith('phase') ? 'phased' : 'amend');
const { workspace, store, cli, destination, initialState } = manifest;
const common = ['--work', 'catalog', '--workspace', workspace, '--store', store];
const envelope = JSON.parse(execFileSync(process.execPath, [cli, 'load', ...common, '--view', 'full'], { encoding: 'utf8' }));
const state = envelope.state;
const currentView = execFileSync(process.execPath, [cli, 'load', ...common, '--view', 'current'], { encoding: 'utf8' });
const sourceHash = createHash('sha256').update(await readFile(join(workspace, 'catalog.mjs'))).digest('hex');
const { selectCatalog } = await import(pathToFileURL(join(workspace, 'catalog.mjs')).href);
const expectations = [];
async function check(text, fn) {
  try { await fn(); expectations.push({ text, passed: true, evidence: 'Checked actual module behavior and/or CLI-loaded saved state at ' + envelope.path }); }
  catch (error) { expectations.push({ text, passed: false, evidence: error.message }); }
}
const get = (collection, id) => { const item = collection.find(entry => entry.id === id); assert.ok(item, `Missing ${id}`); return item; };
const requirement = id => get(state.spec.requirements, id);
const phase = id => get(state.phases, id);
const task = id => get(state.tasks, id);
const originalOrder = initialState.spec.requirements.find(entry => entry.id === 'order');

await check('State was actually saved through the CLI and matches the explicit user destination.', async () => {
  assert.notEqual(envelope.revision, manifest.initialRevision, 'seed is not an executor save');
  assert.deepEqual(state, JSON.parse(await readFile(destination, 'utf8')));
  assert.equal(state.workId, 'catalog');
  assert.equal(state.scope.id, initialState.scope.id);
});
await check('Input order, frozen data, public named export and ordinary matching remain correct.', () => {
  const rows = Object.freeze([Object.freeze({id: 'b', name: 'Beta', archived: false}), Object.freeze({id: 'a', name: 'Alpha', archived: false})]);
  const options = Object.freeze({ query: 'alpha' });
  assert.deepEqual(selectCatalog(rows).map(row => row.id), ['b', 'a']);
  assert.deepEqual(selectCatalog(rows, options).map(row => row.id), ['a']);
  assert.deepEqual(rows.map(row => row.id), ['b', 'a']);
});
await check('Case and surrounding query whitespace work in actual output.', () => {
  const rows = [{id: 'b', name: 'Beta'}, {id: 'a', name: 'ALPHA'}, {id: 'c', name: 'Alpine'}];
  assert.deepEqual(selectCatalog(rows, {query: ' aLp '}).map(row => row.id), ['a', 'c']);
  assert.deepEqual(selectCatalog(rows, {query: ' \t '}).map(row => row.id), ['b', 'a', 'c']);
});
await check('Unaffected completed proof and deferred obligations survive.', async () => {
  assert.equal(requirement('order').status, 'met');
  for (const evidence of originalOrder.evidence) assert.ok(requirement('order').evidence.includes(evidence));
  assert.equal(phase('baseline').status, 'done');
  assert.equal(task('baseline-proof').status, 'done');
  for (const evidence of initialState.tasks[0].evidence) assert.ok(task('baseline-proof').evidence.includes(evidence));
  assert.equal(requirement('report').status, 'open');
  assert.ok(['pending', 'paused', 'blocked'].includes(task('report-request').status));
  assert.ok(!state.spec.constraints.some(text => !text.trim()));
  for (const constraint of initialState.spec.constraints) assert.ok(state.spec.constraints.includes(constraint), `Lost constraint: ${constraint}`);
  assert.ok(!(await readdir(workspace)).some(name => name.endsWith('.csv')), 'Deferred CSV output was created');
});
await check('Selective current view keeps requirements and out-of-phase pending work without historical task detail.', () => {
  assert.ok(!currentView.includes('HISTORICAL_DETAIL_ONLY'));
  for (const id of ['order', 'query', 'archive', 'report', 'report-request']) assert.ok(currentView.includes(id), `Missing ${id} from current view`);
});

if (mode === 'phase1' || mode === 'phase2') {
  await check('Completed normalization is backed by saved evidence and the original Spec remains stable.', () => {
    assert.equal(state.spec.revision, initialState.spec.revision);
    for (const item of [requirement('query'), phase('normalize'), task('normalize-query')]) {
      assert.equal(item.status, item.id === 'query' ? 'met' : 'done');
      assert.ok(item.evidence.length > 0);
    }
  });
  await check(mode === 'phase1' ? 'Phase A leaves archive behavior pending and selects the next Phase.' : 'Fresh continuation implements archive behavior without losing earlier work.', () => {
    const rows = [{id: 'a', name: 'Alpha', archived: true}, {id: 'b', name: 'ALPINE', archived: false}, {id: 'c', name: 'Alpaca'}];
    assert.deepEqual(selectCatalog(rows, {query: ' ALP ', includeArchived: true}).map(row => row.id), ['a', 'b', 'c']);
    if (mode === 'phase1') {
      assert.deepEqual(selectCatalog(rows, {query: 'alp'}).map(row => row.id), ['a', 'b', 'c']);
      assert.notEqual(task('archive-filter').status, 'done');
      assert.equal(requirement('archive').status, 'open');
      assert.equal(state.current.phaseId, 'archive');
    } else {
      assert.deepEqual(selectCatalog(rows, {query: 'alp'}).map(row => row.id), ['b', 'c']);
      assert.equal(task('archive-filter').status, 'done');
      assert.equal(phase('archive').status, 'done');
      assert.equal(requirement('archive').status, 'met');
      assert.ok(task('archive-filter').evidence.length > 0);
    }
  });
  if (mode === 'phase2') await check('Continuation preserved the prior executor snapshot and its evidence.', async () => {
    const previous = JSON.parse(await readFile(join(root, 'snapshot-phase1.json'), 'utf8'));
    assert.notEqual(envelope.revision, previous.revision);
    for (const evidence of get(previous.state.tasks, 'normalize-query').evidence) assert.ok(task('normalize-query').evidence.includes(evidence));
  });
} else {
  await check('Archive execution stays paused rather than completed or silently discarded.', () => {
    assert.equal(phase('archive').status, 'paused');
    assert.equal(task('archive-filter').status, 'paused');
    assert.equal(requirement('archive').status, 'open');
    const rows = [{id: 'a', name: 'Alpha', archived: true}, {id: 'b', name: 'Alpha', archived: false}];
    assert.deepEqual(selectCatalog(rows).map(row => row.id), ['a', 'b']);
  });
  if (mode === 'pause') await check('Pause persists without edits or a false completion/spec change.', () => {
    assert.equal(sourceHash, manifest.initialSourceHash);
    assert.deepEqual(state.spec, initialState.spec);
    assert.equal(task('normalize-query').status, 'done');
    assert.ok(state.memo.nextAction.trim());
  });
  else {
    await check('Amended Spec changes revision and retains all original requirement identities.', () => {
      assert.notEqual(state.spec.revision, initialState.spec.revision);
      assert.match(requirement('query').text, /accent|diacritic/i);
      for (const original of initialState.spec.requirements) requirement(original.id);
    });
    const previousMode = mode === 'amend' ? 'pause' : 'amend';
    await check('Each interruption/continuation creates a new saved snapshot.', async () => {
      const previous = JSON.parse(await readFile(join(root, `snapshot-${previousMode}.json`), 'utf8'));
      assert.notEqual(envelope.revision, previous.revision);
    });
    if (mode === 'amend') await check('Only affected normalization work becomes needs-review; amendment does not execute it.', () => {
      assert.equal(sourceHash, manifest.initialSourceHash);
      assert.equal(requirement('query').status, 'needs-review');
      assert.equal(task('normalize-query').status, 'needs-review');
      assert.equal(phase('normalize').status, 'needs-review');
    });
    else await check('Fresh executor implements the amended query behavior with evidence while archive remains paused.', () => {
      const rows = [{id: 'a', name: 'Café'}, {id: 'b', name: 'CAFE\u0301'}, {id: 'c', name: 'cafeteria'}, {id: 'd', name: 'tea'}];
      assert.deepEqual(selectCatalog(rows, {query: ' CAFÉ '}).map(row => row.id), ['a', 'b', 'c']);
      assert.deepEqual(selectCatalog(rows, {query: 'cafe'}).map(row => row.id), ['a', 'b', 'c']);
      assert.equal(requirement('query').status, 'met');
      assert.equal(task('normalize-query').status, 'done');
      assert.equal(phase('normalize').status, 'done');
      assert.ok(task('normalize-query').evidence.length > 0);
    });
  }
}
const passed = expectations.filter(item => item.passed).length;
const result = { expectations, summary: { passed, failed: expectations.length - passed, total: expectations.length, pass_rate: passed / expectations.length } };
await writeFile(join(root, `grading-${mode}.json`), JSON.stringify(result, null, 2) + '\n');
await writeFile(join(root, `snapshot-${mode}.json`), JSON.stringify({ revision: envelope.revision, state, sourceHash }, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
if (passed !== expectations.length) process.exitCode = 1;
