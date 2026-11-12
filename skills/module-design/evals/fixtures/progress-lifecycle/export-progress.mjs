// An offline export is allowed without a mounted UI. It must not initiate I/O.
export function exportProgress(store) {
  const value = store.snapshot();
  return value ? JSON.stringify(value) : 'null';
}
