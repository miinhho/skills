#!/usr/bin/env node
import { dirname } from 'node:path';
import { flush, run } from '@oclif/core';
import metadata from '../package.json' with { type: 'json' };
import { reportError } from './cli/errors.js';
import List from './commands/list.js';
import Load from './commands/load.js';
import Save from './commands/save.js';
import { InvalidInputError } from './storage/errors.js';

export const commands = {
  list: List,
  load: Load,
  save: Save,
};

async function main(): Promise<void> {
  try {
    const argv = process.argv.slice(2);

    if (argv.length === 0) {
      throw new InvalidInputError('A command is required: list, load, or save.');
    }

    await run(argv, {
      root: dirname(__filename),
      ignoreManifest: true,
      userPlugins: false,
      devPlugins: false,
      pjson: {
        name: metadata.name,
        version: metadata.version,
        description: metadata.description,
        type: 'commonjs',
        oclif: {
          bin: metadata.name,
          dirname: metadata.name,
          commands: {
            strategy: 'explicit',
            target: __filename,
            identifier: 'commands',
          },
        },
      },
    });
  } finally {
    await flush();
  }
}

void main().catch(reportError);
