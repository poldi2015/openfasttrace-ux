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