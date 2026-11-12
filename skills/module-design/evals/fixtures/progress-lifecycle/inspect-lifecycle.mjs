import { createProgressStore } from './progress-store.mjs';
import { mountPanel, mountBadge } from './widgets.mjs';
import { exportProgress } from './export-progress.mjs';

// No real clocks, networking, packages, or files are used by this probe.
// Printed values come from executing the store and its real fixture callers.
const timers = new Map();
let nextTimer = 0;
const scheduler = {
  setInterval(callback) {
    const token = { id: ++nextTimer };
    timers.set(token, callback);
    return token;
  },
  clearInterval(token) { timers.delete(token); }
};
const pending = [];
let requestCount = 0;
const fetchProgress = runId => {
  requestCount++;
  return new Promise(resolve => { pending.push({ runId, resolve }); });
};
const observations = [];
const store = createProgressStore({ runId: 'run-17', fetchProgress, scheduler });
const record = label => observations.push({
  label, activeTimers: timers.size, requestCount, snapshot: store.snapshot()
});

exportProgress(store);
record('offline export');
const panelValues = [];
const badgeValues = [];
const closePanel = mountPanel(store, value => panelValues.push(value));
const closeBadge = mountBadge(store, value => badgeValues.push(value));
record('two subscribers');
store.acceptPush({ runId: 'run-17', revision: 5, percent: 50 });
pending.shift().resolve({ runId: 'run-17', revision: 4, percent: 40 });
await Promise.resolve();
record('older poll follows newer push');
closePanel();
record('panel closed, badge remains');
for (const callback of [...timers.values()]) callback();
closeBadge();
record('last subscriber closed with poll pending');
const reopenedValues = [];
const closeReopened = mountPanel(store, value => reopenedValues.push(value));
record('panel reopened');
pending.shift().resolve({ runId: 'run-17', revision: 6, percent: 60 });
await Promise.resolve();
record('previous session poll resolves after reopen');
closeReopened();
record('reopened panel closed');
console.log(JSON.stringify({ observations, panelValues, badgeValues, reopenedValues }, null, 2));
