import { DocumentSyntaxError } from './errors.js';

export function parseJsonBytes(bytes: Uint8Array, source: string): unknown {
  let text: string;

  try {
    // Fatal decoding rejects invalid UTF-8; TextDecoder consumes an optional UTF-8 BOM.
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch (cause) {
    throw new DocumentSyntaxError(source, 'UTF-8', { cause });
  }

  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new DocumentSyntaxError(source, 'JSON', { cause });
  }
}
