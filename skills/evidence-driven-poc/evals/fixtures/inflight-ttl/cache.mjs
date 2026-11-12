export function createCachedLoader({ load, ttlMs, now = Date.now }) {
  const entries = new Map();

  return function get(key) {
    const time = now();
    const existing = entries.get(key);
    if (existing && existing.expiresAt > time) {
      return existing.promise;
    }

    const promise = Promise.resolve().then(() => load(key));
    const entry = { promise, expiresAt: time + ttlMs };
    entries.set(key, entry);
    promise.catch(() => {
      if (entries.get(key) === entry) {
        entries.delete(key);
      }
    });
    return promise;
  };
}
