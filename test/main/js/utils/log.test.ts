import {describe, expect} from "vitest";
import {hiddenLogTags, knownLogTags, Log, log, resetLogTags, showLogTags} from "@main/utils/log";
import {test} from "../fixtures/fixtures";

describe("Tests of the Logger API", () => {
    test("Write a single log message", ({logs}) => {
        log.info('test', "Hallo");
        expect(logs).toHaveReturnedWith('test Hallo')
    });

    test("Use a tagged Logger, tag by default is hidden", ({logs}) => {
        const log = new Log("Tag");
        expect(hiddenLogTags()).toEqual(["Tag"]);
        log.info('test', "Hallo");
        expect(logs).toHaveLength(0);
    });

    test("Use a tagged Logger, enable all tags", ({logs}) => {
        const log = new Log("Tag");
        showLogTags();
        log.info('test', "Hallo");
        expect(logs).toHaveReturnedWith("| Tag | test Hallo");
    });

    test("Use a tagged Logger, enable selected tags", ({logs}) => {
        const log1 = new Log("Tag1");
        const log2 = new Log("Tag2");
        showLogTags("Tag1");
        log1.info('test', "Hallo1");
        log2.info('test', "Hallo2");
        expect(logs).toBeCalledTimes(1);
        expect(logs).toHaveReturnedWith("| Tag1 | test Hallo1");
        expect(logs).not.toHaveReturnedWith("| Tag2 | test Hallo2");
    });

    test("Two tagged loggers have applied two hidden logs", ({logs}) => {
        new Log("Tag1");
        new Log("Tag2");
        expect(hiddenLogTags()).toEqual(["Tag1","Tag2"]);
    });

    test("Two tagged loggers part of all log Tags", ({logs}) => {
        new Log("Tag1");
        new Log("Tag2");
        expect(knownLogTags()).toEqual(["Tag1","Tag2"]);
    });
});