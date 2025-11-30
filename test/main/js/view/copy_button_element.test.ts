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

import {afterEach, beforeEach, describe, expect, vi} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {CopyButtonElement} from "@main/view/copy_button_element";
import {$} from "@test/fixtures/dom";

const CLASS_COPY_SUCCESS = "_copy-success";
const SUCCESS_DURATION_MS = 500;

const COPY_BUTTON = `<button id="btn-copy">Copy</button>`;
const COPY_BUTTON_ID = '#btn-copy';


describe("Tests for CopyButtonElement", () => {
    let body: JQuery;

    beforeEach(() => {
        body = $("body");
        body.empty();

        // Ensure clipboard exists and is a mockable object
        (navigator as any).clipboard = {
            writeText: vi.fn().mockResolvedValue(undefined),
        };
    });

    afterEach(() => {
        vi.restoreAllMocks();
        // cleanup clipboard mock
        try {
            delete (navigator as any).clipboard;
        } catch (e) {
            // ignore
        }
    });

    test("CopyButtonElement can be instantiated", () => {
        body.append(COPY_BUTTON);

        const el = new CopyButtonElement(copyButtonSelector(), () => "text");

        expect(el).toBeDefined();
        expect(el.getElement().attr('id')).toBe('btn-copy');
    });

    test("init() binds click and copies text to clipboard", async () => {
        body.append(`<div id="parent"><button id="btn-copy">Copy</button></div>`);

        const writeSpy = vi.spyOn((navigator as any).clipboard, 'writeText');

        // Parent click handler to verify stopPropagation is called
        const parentClicked = vi.fn();
        $('#parent').on('click', parentClicked);

        const el = new CopyButtonElement(copyButtonSelector(), () => "hello");
        el.init();

        copyButtonSelector().trigger('click');

        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(writeSpy).toHaveBeenCalledWith('hello');

        // Parent should not have been invoked because stopPropagation was called
        expect(parentClicked).toHaveBeenCalledTimes(0);
    });

    test("does not copy when getText returns null", () => {
        body.append(COPY_BUTTON);

        const writeSpy = vi.spyOn((navigator as any).clipboard, 'writeText');

        const el = new CopyButtonElement(copyButtonSelector(), () => null);
        el.init();

        copyButtonSelector().trigger('click');

        expect(writeSpy).toHaveBeenCalledTimes(0);
    });

    test("shows success class briefly on successful copy", async () => {
        body.append(COPY_BUTTON);

        // Use fake timers to control the timeout
        vi.useFakeTimers();

        vi.spyOn((navigator as any).clipboard, 'writeText').mockResolvedValue(undefined);

        const el = new CopyButtonElement(copyButtonSelector(), () => 'ok');
        el.init();

        copyButtonSelector().trigger('click');

        // Allow promise microtasks to run
        await Promise.resolve();

        // Success class should be added
        expect(copyButtonSelector().hasClass(CLASS_COPY_SUCCESS)).toBe(true);

        // Advance timers to remove the class
        vi.advanceTimersByTime(SUCCESS_DURATION_MS + 1);

        expect(copyButtonSelector().hasClass(CLASS_COPY_SUCCESS)).toBe(false);

        vi.useRealTimers();
    });

    test("does not show success class on copy failure", async () => {
        body.append(COPY_BUTTON);

        const writeSpy = vi.spyOn((navigator as any).clipboard, 'writeText').mockRejectedValue(new Error('fail'));

        const el = new CopyButtonElement(copyButtonSelector(), () => 'fail-text');
        el.init();

        copyButtonSelector().trigger('click');

        // Wait for the rejection to be processed
        await new Promise((r) => setTimeout(r, 0));

        expect(writeSpy).toHaveBeenCalledTimes(1);
        expect(copyButtonSelector().hasClass(CLASS_COPY_SUCCESS)).toBe(false);
    });

    test("setVisible toggles visibility", () => {
        body.append(COPY_BUTTON);

        const el = new CopyButtonElement(copyButtonSelector(), () => 'x');

        // Hidden
        el.setVisible(false);
        expect(copyButtonDisplayAttribute()).toBe('none');

        // Visible
        el.setVisible(true);

        expect(copyButtonDisplayAttribute()).not.toBe('none');
    });

    function copyButtonDisplayAttribute() {
        return copyButtonSelector().css('display');
    }

    function copyButtonSelector() {
        return $(COPY_BUTTON_ID);
    }

});

