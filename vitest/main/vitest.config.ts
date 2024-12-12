// vitest.config.ts
import {defineConfig} from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true, // Enables global variables like describe, test, etc.
        include: ['test/main/js/**/*.test.ts'],
        exclude: ['node_modules', 'build'],
        coverage: {
            exclude: ['node_modules/**', 'build/**'],
        }
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            "@main": path.resolve(__dirname, '../../src/main/js'),
            "@html": path.resolve(__dirname, '../../src/main/html'),
            "@css": path.resolve(__dirname, '../../src/main/css'),
            "@libs": path.resolve(__dirname, '../../src/main/libs'),
            "@resources": path.resolve(__dirname, '../../src/main/resources'),
            "@test": path.resolve(__dirname, '../../test/main/js'),
        },
    },
});
