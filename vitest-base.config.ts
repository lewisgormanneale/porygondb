// Learn more about Vitest configuration options at https://vitest.dev/config/

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['test-setup.ts'],
    fileParallelism: false,
    maxWorkers: 1,
    minWorkers: 1,
  },
});
