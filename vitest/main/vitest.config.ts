// vitest.config.ts
import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom', // Use jsdom to simulate the DOM
        globals: true, // Enables global variables like describe, test, etc.
        include: ['test/main/js/**/*.test.ts'], // Specify the path where test files are located
        exclude: ['node_modules', 'build'],
        coverage: {
            exclude: ['node_modules/**', 'build/**'],
        }
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@main': path.resolve(__dirname, '../../src/main/js'),
            '@fixtures': path.resolve(__dirname, '../../src/fixtures'),
        },
    },
});
