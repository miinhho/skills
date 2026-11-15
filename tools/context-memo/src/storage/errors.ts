export interface InputIssue {
  path: (string | number)[];
  message: string;
}

export class InvalidInputError extends Error {
  constructor(
    message: string,
    readonly issues?: readonly InputIssue[],
  ) {
    super(message);

    this.name = 'InvalidInputError';
  }
}

export class DocumentSyntaxError extends Error {
  constructor(
    readonly source: string,
    format: 'UTF-8' | 'JSON',
    options: ErrorOptions,
  ) {
    super(`${source} is not valid ${format}.`, options);

    this.name = 'DocumentSyntaxError';
  }
}

export class StoredStateError extends Error {
  constructor(
    readonly path: string,
    options: ErrorOptions,
  ) {
    super(`Stored state is corrupt: ${JSON.stringify(path)}.`, options);

    this.name = 'StoredStateError';
  }
}

export function hasCode(error: unknown, code: string): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if (!('code' in error)) {
    return false;
  }

  return error.code === code;
}
