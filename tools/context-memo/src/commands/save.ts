import { Command } from '@oclif/core';
import { expectationFlag, locationFlags, pathFlag, workFlag } from '../cli/flags.js';
import { saveMemo } from '../memo/service.js';

export default class Save extends Command {
  static override description = 'Atomically compare and save a complete state.';

  static override flags = {
    ...locationFlags,
    work: workFlag({
      required: true,
      description: 'Work identifier',
      helpValue: 'id',
    }),
    expect: expectationFlag({
      required: true,
      description: 'Expected snapshot SHA256, or missing for new work',
      helpValue: 'revision',
    }),
    file: pathFlag({
      description: 'Read UTF-8 JSON from this file instead of standard input',
      helpValue: 'path',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Save);

    this.log(JSON.stringify(await saveMemo(flags)));
  }
}
