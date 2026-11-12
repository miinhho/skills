import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const [outputDir, fault] = process.argv.slice(2);
if (!outputDir || (fault !== undefined && fault !== '--fail-before-commit')) {
  throw new Error('Usage: node worker.mjs OUTPUT_DIR [--fail-before-commit]');
}

try {
  const input = JSON.parse(await readFile(new URL('./transactions.json', import.meta.url), 'utf8'));
  await mkdir(outputDir, { recursive: true });
  console.log(JSON.stringify({ state: 'accepted', accountId: input.accountId }));
  const receipt = {
    accountId: input.accountId,
    currency: input.currency,
    transactionCount: input.transactions.length,
    netAmount: input.transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
  };
  if (fault === '--fail-before-commit') {
    throw new Error('Injected storage failure before receipt commit');
  }
  await writeFile(join(outputDir, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ state: 'committed', accountId: input.accountId }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 7;
}
