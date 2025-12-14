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
import {ISelectOption, SelectElement} from "@main/view/select_element";

describe("SelectElement - Initialization", () => {
    let container: JQuery;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
    });

    test("should create multi-select with container", () => {
        const multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();

        expect(container.hasClass('_custom-multiselect')).toBe(true);
        expect(container.find('._multiselect-options-container').length).toBe(1);
    });

    test("should accept jQuery element as container", () => {
        const multiSelect = new SelectElement(container, "test-id");
        multiSelect.init();

        expect(container.hasClass('_custom-multiselect')).toBe(true);
    });

    test("should initialize with empty options", () => {
        const multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();

        expect(multiSelect.getSelectedIndexes()).toEqual([]);
    });
});

describe("SelectElement - Options Management", () => {
    let container: JQuery;
    let multiSelect: SelectElement;
    let sampleOptions: ISelectOption[];

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();

        sampleOptions = [
            {id: "opt1", text: "Option 1", count: 5},
            {id: "opt2", text: "Option 2", count: 10},
            {id: "opt3", text: "Option 3"}
        ];
    });

    test("should render options correctly", () => {
        multiSelect.setOptions(sampleOptions);

        const options = container.find('._multiselect-option');
        expect(options.length).toBe(3);
    });

    test("should display option text", () => {
        multiSelect.setOptions(sampleOptions);

        const firstOption = container.find('._multiselect-option').first();
        expect(firstOption.find('._multiselect-text').text()).toBe("Option 1");
    });

    test("should display option count when provided", () => {
        multiSelect.setOptions(sampleOptions);

        const firstOption = container.find('._multiselect-option').first();
        expect(firstOption.find('._multiselect-count').text()).toBe("(5)");
    });

    test("should not display count when not provided", () => {
        multiSelect.setOptions(sampleOptions);

        const thirdOption = container.find('._multiselect-option').eq(2);
        expect(thirdOption.find('._multiselect-count').length).toBe(0);
    });

    test("should display icon when provided", () => {
        const optionsWithIcon: ISelectOption[] = [
            {id: "opt1", text: "Option 1", icon: "material-icons"}
        ];
        multiSelect.setOptions(optionsWithIcon);

        const option = container.find('._multiselect-option').first();
        expect(option.find('._multiselect-icon').hasClass('material-icons')).toBe(true);
    });

    test("should escape HTML in option text", () => {
        const maliciousOptions: ISelectOption[] = [
            {id: "opt1", text: "<script>alert('xss')</script>"}
        ];
        multiSelect.setOptions(maliciousOptions);

        const option = container.find('._multiselect-option').first();
        const html = option.find('._multiselect-text').html();
        expect(html).toContain("&lt;script&gt;");
        expect(option.find('._multiselect-text').text()).toContain("<script>");
    });

    test("should set pre-selected options", () => {
        const preSelectedOptions: ISelectOption[] = [
            {id: "opt1", text: "Option 1", selected: true},
            {id: "opt2", text: "Option 2", selected: false},
            {id: "opt3", text: "Option 3", selected: true}
        ];
        multiSelect.setOptions(preSelectedOptions);

        expect(multiSelect.getSelectedIndexes()).toEqual([0, 2]);
    });
});

describe("SelectElement - Selection Behavior", () => {
    let container: JQuery;
    let multiSelect: SelectElement;
    let sampleOptions: ISelectOption[];

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();
        multiSelect.activate(); // Activate so selection works

        sampleOptions = [
            {id: "opt1", text: "Option 1"},
            {id: "opt2", text: "Option 2"},
            {id: "opt3", text: "Option 3"}
        ];
        multiSelect.setOptions(sampleOptions);
    });

    test("should select option on click", () => {
        const firstOption = container.find('._multiselect-option').first();
        firstOption.trigger('click');

        expect(multiSelect.getSelectedIndexes()).toEqual([0]);
        expect(firstOption.hasClass('_selected')).toBe(true);
    });

    test("should deselect option on second click", () => {
        const firstOption = container.find('._multiselect-option').first();
        firstOption.trigger('click');
        firstOption.trigger('click');

        expect(multiSelect.getSelectedIndexes()).toEqual([]);
        expect(firstOption.hasClass('_selected')).toBe(false);
    });

    test("should allow multiple selections", () => {
        const options = container.find('._multiselect-option');
        options.eq(0).trigger('click');
        options.eq(2).trigger('click');

        expect(multiSelect.getSelectedIndexes()).toEqual([0, 2]);
    });

    test("should update checkbox visual state", () => {
        const firstOption = container.find('._multiselect-option').first();
        const checkbox = firstOption.find('._multiselect-checkbox');

        firstOption.trigger('click');
        expect(checkbox.hasClass('_checked')).toBe(true);

        firstOption.trigger('click');
        expect(checkbox.hasClass('_checked')).toBe(false);
    });

    test("should call onChange callback when selection changes", () => {
        const onChange = vi.fn();
        multiSelect.onChange(onChange);

        const firstOption = container.find('._multiselect-option').first();
        firstOption.trigger('click');

        expect(onChange).toHaveBeenCalledWith([0]);
    });

    test("should call onChange with correct indexes for multiple selections", () => {
        const onChange = vi.fn();
        multiSelect.onChange(onChange);

        const options = container.find('._multiselect-option');
        options.eq(0).trigger('click');
        options.eq(2).trigger('click');

        expect(onChange).toHaveBeenLastCalledWith([0, 2]);
    });
});

describe("SelectElement - Programmatic Selection", () => {
    let container: JQuery;
    let multiSelect: SelectElement;
    let sampleOptions: ISelectOption[];

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();

        sampleOptions = [
            {id: "opt1", text: "Option 1"},
            {id: "opt2", text: "Option 2"},
            {id: "opt3", text: "Option 3"},
            {id: "opt4", text: "Option 4"}
        ];
        multiSelect.setOptions(sampleOptions);
    });

    test("should set selected indexes programmatically", () => {
        multiSelect.setSelectedIndexes([0, 2]);

        expect(multiSelect.getSelectedIndexes()).toEqual([0, 2]);
    });

    test("should update UI when setting indexes programmatically", () => {
        multiSelect.setSelectedIndexes([1, 3]);

        const options = container.find('._multiselect-option');
        expect(options.eq(0).hasClass('_selected')).toBe(false);
        expect(options.eq(1).hasClass('_selected')).toBe(true);
        expect(options.eq(2).hasClass('_selected')).toBe(false);
        expect(options.eq(3).hasClass('_selected')).toBe(true);
    });

    test("should ignore invalid indexes", () => {
        multiSelect.setSelectedIndexes([0, 10, -1, 2]);

        expect(multiSelect.getSelectedIndexes()).toEqual([0, 2]);
    });

    test("should select all options", () => {
        multiSelect.selectAll();

        expect(multiSelect.getSelectedIndexes()).toEqual([0, 1, 2, 3]);
    });

    test("should deselect all options", () => {
        multiSelect.setSelectedIndexes([0, 1, 2]);
        multiSelect.selectNone();

        expect(multiSelect.getSelectedIndexes()).toEqual([]);
    });

    test("should call onChange when using selectAll", () => {
        const onChange = vi.fn();
        multiSelect.onChange(onChange);

        multiSelect.selectAll();

        expect(onChange).toHaveBeenCalledWith([0, 1, 2, 3]);
    });

    test("should call onChange when using selectNone", () => {
        const onChange = vi.fn();
        multiSelect.onChange(onChange);
        multiSelect.setSelectedIndexes([0, 1]);

        onChange.mockClear();
        multiSelect.selectNone();

        expect(onChange).toHaveBeenCalledWith([]);
    });
});

describe("SelectElement - Disabled State", () => {
    let container: JQuery;
    let multiSelect: SelectElement;
    let sampleOptions: ISelectOption[];

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();

        sampleOptions = [
            {id: "opt1", text: "Option 1"},
            {id: "opt2", text: "Option 2"}
        ];
        multiSelect.setOptions(sampleOptions);
    });

    test("should disable multi-select", () => {
        multiSelect.deactivate();

        expect(multiSelect.isActive()).toBe(false);
        expect(container.hasClass('_multiselect-disabled')).toBe(true);
    });

    test("should enable multi-select", () => {
        multiSelect.deactivate();
        multiSelect.activate();

        expect(multiSelect.isActive()).toBe(true);
        expect(container.hasClass('_multiselect-disabled')).toBe(false);
    });

    test("should not allow selection when disabled", () => {
        multiSelect.deactivate();

        const firstOption = container.find('._multiselect-option').first();
        firstOption.trigger('click');

        expect(multiSelect.getSelectedIndexes()).toEqual([]);
    });

    test("should allow selection when enabled", () => {
        multiSelect.activate();

        const firstOption = container.find('._multiselect-option').first();
        firstOption.trigger('click');

        expect(multiSelect.getSelectedIndexes()).toEqual([0]);
    });
});

describe("SelectElement - Cleanup", () => {
    let container: JQuery;
    let multiSelect: SelectElement;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        multiSelect = new SelectElement(container[0], "test-id");
    });

    test("should clean up on destroy", () => {
        const sampleOptions: ISelectOption[] = [
            {id: "opt1", text: "Option 1"}
        ];
        multiSelect.setOptions(sampleOptions);

        multiSelect.destroy();

        expect(container.children().length).toBe(0);
    });

    test("should remove event listeners on destroy", () => {
        const onChange = vi.fn();
        multiSelect.onChange(onChange);

        const sampleOptions: ISelectOption[] = [
            {id: "opt1", text: "Option 1"}
        ];
        multiSelect.setOptions(sampleOptions);

        multiSelect.destroy();

        // Try to trigger click after destroy - should not call onChange
        const firstOption = container.find('._multiselect-option').first();
        firstOption.trigger('click');

        expect(onChange).not.toHaveBeenCalled();
    });
});

describe("SelectElement - Edge Cases", () => {
    let container: JQuery;
    let multiSelect: SelectElement;

    beforeEach(() => {
        container = $('<div id="test-container"></div>');
        $('body').append(container);
        multiSelect = new SelectElement(container[0], "test-id");
        multiSelect.init();
    });

    test("should handle empty options array", () => {
        multiSelect.setOptions([]);

        expect(container.find('._multiselect-option').length).toBe(0);
        expect(multiSelect.getSelectedIndexes()).toEqual([]);
    });

    test("should handle options with count of 0", () => {
        const options: ISelectOption[] = [
            {id: "opt1", text: "Option 1", count: 0}
        ];
        multiSelect.setOptions(options);

        const option = container.find('._multiselect-option').first();
        expect(option.find('._multiselect-count').text()).toBe("(0)");
    });

    test("should handle options with negative count", () => {
        const options: ISelectOption[] = [
            {id: "opt1", text: "Option 1", count: -1}
        ];
        multiSelect.setOptions(options);

        const option = container.find('._multiselect-option').first();
        expect(option.find('._multiselect-count').length).toBe(0);
    });

    test("should return sorted indexes", () => {
        const options: ISelectOption[] = [
            {id: "opt1", text: "Option 1"},
            {id: "opt2", text: "Option 2"},
            {id: "opt3", text: "Option 3"}
        ];
        multiSelect.setOptions(options);

        // Select in reverse order
        multiSelect.setSelectedIndexes([2, 0, 1]);

        expect(multiSelect.getSelectedIndexes()).toEqual([0, 1, 2]);
    });

    test("should handle special characters in text", () => {
        const options: ISelectOption[] = [
            {id: "opt1", text: "Option & Special <> Characters \"'/"}
        ];
        multiSelect.setOptions(options);

        const option = container.find('._multiselect-option').first();
        expect(option.find('._multiselect-text').text()).toContain("&");
        expect(option.find('._multiselect-text').text()).toContain("<>");
    });
});
