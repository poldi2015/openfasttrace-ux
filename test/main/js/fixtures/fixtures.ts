/*
  OpenFastTrace UX

 Copyright (C) 2024-2025 itsallcode.org, Bernd Haberstumpf

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
import {test as base, vi} from 'vitest'
import {resetLogTags} from "@main/utils/log";

/**
 * Fixture collecting logged messages into capture logs available via the logs fixture.
 */
async function captureLogs({}: any, use: (arg0: any) => any) {
    const originalLog: any = console.log;

    // Enable logging
    process.env.NODE_ENV = "development";
    // Reset logging system
    resetLogTags();

    const capturedLogs = vi
        .spyOn(console, 'log')
        .mockImplementation((msg: any, ...messages: any[]): string => {
            originalLog(msg, ...messages);
            return [msg].concat(messages).join(" ");
        });

    await use(capturedLogs);
    capturedLogs.mockReset();
}

export const test = base.extend({
    logs: captureLogs,
});