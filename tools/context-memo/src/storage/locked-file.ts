import lockfile from 'proper-lockfile';
import writeFileAtomic from 'write-file-atomic';

export class LockedFile implements AsyncDisposable {
  private constructor(
    private readonly path: string,
    private readonly signal: AbortSignal,
    private readonly writeOptions: writeFileAtomic.Options,
    private readonly release: () => Promise<void>,
  ) {}

  static async acquire(directory: string, path: string): Promise<LockedFile> {
    const controller = new AbortController();
    const signal = controller.signal;
    const writeOptions: writeFileAtomic.Options = {
      mode: 0o600,
      tmpfileCreated: () => signal.throwIfAborted(),
    };
    const lockOptions: lockfile.LockOptions = {
      realpath: true,
      lockfilePath: `${path}.lock`,
      retries: 0,
      onCompromised: (error: Error) => controller.abort(error),
    };

    const release = await lockfile.lock(directory, lockOptions);

    return new LockedFile(path, signal, writeOptions, release);
  }

  async write(bytes: Uint8Array): Promise<void> {
    this.signal.throwIfAborted();

    let buffer: Buffer;
    if (Buffer.isBuffer(bytes)) {
      buffer = bytes;
    } else {
      buffer = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }

    await writeFileAtomic(this.path, buffer, this.writeOptions);

    // The library has no fencing token: compromise detected after publication cannot undo it.
    this.signal.throwIfAborted();
  }

  [Symbol.asyncDispose](): Promise<void> {
    // Only the library's returned release owns removal; disposal failures remain native.
    return this.release();
  }
}
