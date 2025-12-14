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

import {beforeEach, describe, expect, test, vi} from "vitest";
import {$} from "@test/fixtures/dom";
import {IEntry, SelectElement} from "@main/view/select_element";

describe("SelectElement - Initialization", () => {
    let container: JQuery;
    let model: IEntry[];
    let changeHandler: (selectedIndexes: number[]) => void;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        model = [
            {text: "Option 1", count: 5},
            {text: "Option 2", count: 10},
            {text: "Option 3"}
        ];
        changeHandler = vi.fn();
    });

    test("should create select element with container", () => {
        const selectElement = new SelectElement("test-id", model, 3, changeHandler, container);
        selectElement.init();

        expect(container.hasClass('select-container')).toBe(true);
        expect(container.find('.select-entries').length).toBe(1);
    });

    test("should initialize with correct number of entries", () => {
        const selectElement = new SelectElement("test-id", model, 3, changeHandler, container);
        selectElement.init();

        const entries = container.find('.select-entry');
        expect(entries.length).toBe(3);
    });

    test("should initialize with empty model", () => {
        const emptyModel: IEntry[] = [];
        const selectElement = new SelectElement("test-id", emptyModel, 3, changeHandler, container);
        selectElement.init();

        expect(selectElement.getSelectedIndexes()).toEqual([]);
    });
});

describe("SelectElement - Display", () => {
    let container: JQuery;
    let model: IEntry[];
    let selectElement: SelectElement;
    let changeHandler: (selectedIndexes: number[]) => void;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        changeHandler = vi.fn();

        model = [
            {text: "Option 1", count: 5},
            {text: "Option 2", count: 10},
            {text: "Option 3"}
        ];

        selectElement = new SelectElement("test-id", model, 3, changeHandler, container);
        selectElement.init();
    });

    test("should display option text", () => {
        const firstOption = container.find('.select-entry').first();
        expect(firstOption.find('.select-text').text()).toBe("Option 1");
    });

    test("should display option count when provided", () => {
        const firstOption = container.find('.select-entry').first();
        expect(firstOption.find('.select-count').text()).toBe("(5)");
    });

    test("should not display count when not provided", () => {
        const thirdOption = container.find('.select-entry').eq(2);
        expect(thirdOption.find('.select-count').length).toBe(0);
    });

    test("should escape HTML in option text", () => {
        const htmlModel: IEntry[] = [
            {text: "<script>alert('xss')</script>"}
        ];
        const htmlContainer = $('<div></div>');
        $('body').append(htmlContainer);
        const ms = new SelectElement("test-id", htmlModel, 1, changeHandler, htmlContainer);
        ms.init();

        const option = htmlContainer.find('.select-entry').first();
        const html = option.find('.select-text').html();
        expect(html).toContain("&lt;script&gt;");
    });
});

describe("SelectElement - Selection", () => {
    let container: JQuery;
    let model: IEntry[];
    let selectElement: SelectElement;
    let changeHandler: any;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        changeHandler = vi.fn();

        model = [
            {text: "Option 1"},
            {text: "Option 2"},
            {text: "Option 3"}
        ];

        selectElement = new SelectElement("test-id", model, 3, changeHandler, container);
        selectElement.init();
        selectElement.activate();
    });

    test("should select option on mousedown", () => {
        const firstOption = container.find('.select-entry').first();
        firstOption.trigger('mousedown');

        expect(selectElement.getSelectedIndexes()).toEqual([0]);
        expect(firstOption.hasClass('selected')).toBe(true);
    });

    test("should deselect option on second mousedown", () => {
        const firstOption = container.find('.select-entry').first();
        firstOption.trigger('mousedown');
        $(document).trigger('mouseup');
        firstOption.trigger('mousedown');

        expect(selectElement.getSelectedIndexes()).toEqual([]);
        expect(firstOption.hasClass('selected')).toBe(false);
    });

    test("should call change handler when selection changes", () => {
        const firstOption = container.find('.select-entry').first();
        firstOption.trigger('mousedown');
        $(document).trigger('mouseup');

        expect(changeHandler).toHaveBeenCalledWith([0]);
    });
});

describe("SelectElement - Programmatic Selection", () => {
    let container: JQuery;
    let model: IEntry[];
    let selectElement: SelectElement;
    let changeHandler: any;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        changeHandler = vi.fn();

        model = [
            {text: "Option 1"},
            {text: "Option 2"},
            {text: "Option 3"},
            {text: "Option 4"}
        ];

        selectElement = new SelectElement("test-id", model, 4, changeHandler, container);
        selectElement.init();
    });

    test("should select all options", () => {
        selectElement.selectAll();

        expect(selectElement.getSelectedIndexes()).toEqual([0, 1, 2, 3]);
    });

    test("should deselect all options", () => {
        model[0].selected = true;
        model[2].selected = true;
        selectElement.selectNone();

        expect(selectElement.getSelectedIndexes()).toEqual([]);
    });

    test("should call change handler when using selectAll", () => {
        selectElement.selectAll();

        expect(changeHandler).toHaveBeenCalledWith([0, 1, 2, 3]);
    });

    test("should call change handler when using selectNone", () => {
        selectElement.selectNone();

        expect(changeHandler).toHaveBeenCalledWith([]);
    });
});

describe("SelectElement - Disabled State", () => {
    let container: JQuery;
    let model: IEntry[];
    let selectElement: SelectElement;
    let changeHandler: any;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        changeHandler = vi.fn();

        model = [
            {text: "Option 1"},
            {text: "Option 2"}
        ];

        selectElement = new SelectElement("test-id", model, 2, changeHandler, container);
        selectElement.init();
    });

    test("should be disabled after init", () => {
        expect(container.hasClass('select-disabled')).toBe(true);
    });

    test("should enable when activated", () => {
        selectElement.activate();
        expect(container.hasClass('select-disabled')).toBe(false);
    });

    test("should disable when deactivated", () => {
        selectElement.activate();
        selectElement.deactivate();
        expect(container.hasClass('select-disabled')).toBe(true);
    });

    test("should not allow selection when disabled", () => {
        const firstOption = container.find('.select-entry').first();
        firstOption.trigger('mousedown');

        expect(selectElement.getSelectedIndexes()).toEqual([]);
    });
});

describe("SelectElement - Drag Selection", () => {
    let container: JQuery;
    let model: IEntry[];
    let selectElement: SelectElement;
    let changeHandler: any;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        changeHandler = vi.fn();

        model = [
            {text: "Option 1"},
            {text: "Option 2"},
            {text: "Option 3"}
        ];

        selectElement = new SelectElement("test-id", model, 3, changeHandler, container);
        selectElement.init();
        selectElement.activate();
    });

    test("should select multiple entries by dragging", () => {
        const entries = container.find('.select-entry');

        // Start drag on first entry
        entries.eq(0).trigger('mousedown');

        // Drag over second entry
        entries.eq(1).trigger('mouseenter');

        // End drag
        $(document).trigger('mouseup');

        expect(selectElement.getSelectedIndexes()).toEqual([0, 1]);
    });

    test("should deselect entries when dragging from selected entry", () => {
        // Pre-select all entries
        model[0].selected = true;
        model[1].selected = true;
        model[2].selected = true;
        selectElement.updateSelection();

        const entries = container.find('.select-entry');

        // Start drag on first entry (deselecting)
        entries.eq(0).trigger('mousedown');

        // Drag over second entry
        entries.eq(1).trigger('mouseenter');

        // End drag
        $(document).trigger('mouseup');

        expect(selectElement.getSelectedIndexes()).toEqual([2]);
    });
});
