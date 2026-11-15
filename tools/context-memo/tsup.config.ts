import { readFileSync } from 'node:fs';
import type { Options } from 'tsup';

const notices = readFileSync('THIRD_PARTY_LICENSES.txt', 'utf8');

export default {
  entry: { 'context-memo': 'src/cli.ts' },
  outDir: '../../skills/context-memo/scripts',
  format: ['cjs'],
  platform: 'node',
  target: 'node22',
  bundle: true,
  splitting: false,
  clean: true,
  noExternal: [/.*/],
  banner: {
    js: `/* Third-party license notices\n${notices.replaceAll('*/', '* /')}\n*/`,
  },
} satisfies Options;
