// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',                         // Use jsdom to simulate the DOM
    globals: true,                                // Enables global variables like describe, test, etc.
    include: ['test/tools/js/**/*.test.ts'],      // Path for tests
    exclude: ['node_modules', 'build'],
    setupFiles: 'vitest/setup/jquery.setup.js',   // Path to the setup file
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@tools': path.resolve(__dirname, './src/tools/js'),
    },
  },
});
