// One store instance belongs to one run. fetchProgress is not cancelable.
// Scheduler tokens need not be numbers. A snapshot is not a subscription.
export function createProgressStore({ runId, fetchProgress, scheduler }) {
  const listeners = new Set();
  let latest = null;
  let timer = null;

  function ingest(candidate) {
    if (candidate.runId !== runId) throw new Error('wrong run');
    if (latest && candidate.revision <= latest.revision) return;
    latest = Object.freeze({ ...candidate });
    for (const listener of listeners) listener(latest);
  }

  async function poll() {
    const candidate = await fetchProgress(runId);
    ingest(candidate);
  }

  return {
    subscribe(listener) {
      listeners.add(listener);
      if (timer === null) {
        void poll();
        timer = scheduler.setInterval(() => { void poll(); }, 1000);
      }
      if (latest) listener(latest);
      return () => { listeners.delete(listener); };
    },
    // External push transport already owns its connection lifetime.
    acceptPush: ingest,
    snapshot() { return latest; }
  };
}
