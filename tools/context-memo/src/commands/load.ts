import { Command, Flags } from '@oclif/core';
import { locationFlags, workFlag } from '../cli/flags.js';
import { renderCurrent } from '../memo/current-view.js';
import { loadMemo } from '../memo/service.js';

export default class Load extends Command {
  static override description = 'Load a saved snapshot or current-work view.';

  static override flags = {
    ...locationFlags,
    work: workFlag({
      required: true,
      description: 'Work identifier',
      helpValue: 'id',
    }),
    view: Flags.option({ options: ['full', 'current'] as const })({
      default: 'full',
      description: 'Output full JSON or current Markdown',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Load);
    const snapshot = await loadMemo(flags);

    if (flags.view === 'current') {
      process.stdout.write(renderCurrent(snapshot.work, snapshot));
      return;
    }

    const { work, ...location } = snapshot;

    this.log(JSON.stringify({ ...location, state: work.document }));
  }
}
