import { Command } from '@oclif/core';
import { locationFlags } from '../cli/flags.js';
import { listMemos } from '../memo/service.js';

export default class List extends Command {
  static override description = 'List saved work in this workspace.';

  static override flags = { ...locationFlags };

  async run(): Promise<void> {
    const { flags } = await this.parse(List);

    this.log(JSON.stringify(await listMemos(flags)));
  }
}
