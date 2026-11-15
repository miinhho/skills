import { Flags } from '@oclif/core';
import { z } from 'zod';
import { idSchema, revisionSchema } from '../memo/document.js';
import { InvalidInputError } from '../storage/errors.js';
import { requirePath } from '../storage/paths.js';

function schemaFlag(schema: z.ZodType<string>) {
  return Flags.custom<string>({
    parse: async (input, _context, options) => {
      const parsed = schema.safeParse(input);

      if (!parsed.success) {
        const issues = parsed.error.issues.map((issue) => ({
          path: [options.name, ...issue.path.map(String)],
          message: issue.message,
        }));

        throw new InvalidInputError('Invalid flag value.', issues);
      }

      return parsed.data;
    },
  });
}

export const workFlag = schemaFlag(idSchema);
export const expectationFlag = schemaFlag(z.union([z.literal('missing'), revisionSchema]));

export const pathFlag = Flags.custom<string>({
  parse: async (input, _context, options) => requirePath(input, options.name ?? 'path'),
});

export const locationFlags = {
  help: Flags.help({ char: 'h' }),
  version: Flags.version(),
  workspace: pathFlag({
    description: 'Workspace directory (defaults to the current directory)',
    helpValue: 'path',
  }),
  store: pathFlag({
    description: 'Store directory (overrides CONTEXT_MEMO_HOME and the OS default)',
    helpValue: 'path',
  }),
};
