/*
  OpenFastTrace UX

 Copyright (C) 2016 - 2024 itsallcode.org

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as
 published by the Free Software Foundation, either version 3 of the
 License, or (at your option) any later version.
 
 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 
 You should have received a copy of the GNU General Public
 License along with this program.  If not, see
 <http://www.gnu.org/licenses/gpl-3.0.html>.
*/
import {defineConfig} from 'vitest/config';
import path = require("path");

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true, // Enables global variables like describe, test, etc.
        include: ['test/main/js/**/*.test.ts'],
        exclude: ['node_modules', 'build'],
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
