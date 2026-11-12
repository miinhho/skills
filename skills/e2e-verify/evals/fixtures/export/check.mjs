import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [outputDir, fault] = process.argv.slice(2);
if (!outputDir || (fault !== undefined && fault !== '--fail-before-commit')) {
  throw new Error('Usage: node check.mjs OUTPUT_DIR [--fail-before-commit]');
}
const worker = fileURLToPath(new URL('./worker.mjs', import.meta.url));
const child = spawnSync(process.execPath, [worker, outputDir, ...(fault ? [fault] : [])], { encoding: 'utf8' });
process.stdout.write(child.stdout ?? '');
process.stderr.write(child.stderr ?? '');
if (child.error) throw child.error;
if (child.status === 0) {
  const receipt = JSON.parse(readFileSync(join(outputDir, 'receipt.json'), 'utf8'));
  assert.deepEqual(receipt, {
    accountId: 'acct-kite',
    currency: 'USD',
    transactionCount: 3,
    netAmount: 42
  });
}
console.log('Export workflow verified');
