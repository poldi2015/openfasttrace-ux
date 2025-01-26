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
import {describe, expect} from "vitest";
import {hiddenLogTags, hideLogTags, knownLogTags, Log, log, showLogTags} from "@main/utils/log";
import {test} from "@test/fixtures/fixtures";

describe("Tests of the Logger API", () => {
    test("Write a single log message", ({logs}) => {
        log.info('test', "Hallo");
        expect(logs).toHaveBeenCalledWith('test', 'Hallo');
    });

    test("Use a tagged Logger, tag by default is shown", ({logs}) => {
        const log = new Log("Tag");
        expect(knownLogTags()).toEqual(["Tag"]);
        log.info('test', "Hallo");
        expect(logs).toHaveBeenCalled();
    });

    test("Use a tagged Logger, enable all tags", ({logs}) => {
        const log = new Log("Tag");
        showLogTags();
        log.info('test', "Hallo");
        expect(logs).toHaveBeenCalledWith("|", "Tag", "|", "test", "Hallo");
    });

    test("Use a tagged Logger, enable selected tags", ({logs}) => {
        const log1 = new Log("Tag1");
        const log2 = new Log("Tag2");
        hideLogTags();
        showLogTags("Tag1");
        log1.info('test', "Hallo1");
        log2.info('test', "Hallo2");
        expect(logs).toBeCalledTimes(1);
        expect(logs).toHaveBeenCalledWith("|", "Tag1", "|", "test", "Hallo1");
        expect(logs).not.toHaveBeenCalledWith("|", "Tag2", "|", "test", "Hallo2");
    });

    test("Two tagged loggers have applied two hidden logs", ({logs}) => {
        new Log("Tag1");
        new Log("Tag2");
        expect(hiddenLogTags()).toEqual([]);
    });

    test("Two tagged loggers part of all log Tags", ({logs}) => {
        new Log("Tag1");
        new Log("Tag2");
        expect(knownLogTags()).toEqual(["Tag1", "Tag2"]);
    });
});