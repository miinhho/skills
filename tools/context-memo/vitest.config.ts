import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup.ts'],
    // CLI suites already spawn child processes; parallel files oversubscribe Windows.
    // Cross-process races remain explicit inside the CAS and lock tests.
    fileParallelism: false,
  },
});
