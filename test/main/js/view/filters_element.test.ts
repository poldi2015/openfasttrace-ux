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
import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {FiltersElement} from "@main/view/filters_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {OftStateController} from "@main/controller/oft_state_controller";
import {FILTER_MODELS_SAMPLE, FilterElementFactoryMock, FilterElementSpy} from "@test/mocks/filter_mocks";
import {$} from "@test/fixtures/dom";

const HTML_MODEL = `
<div>
    <div class="filter" id="type"></div>
    <div class="filter" id="coverage"></div>
</div>
`;

describe("Tests  for FiltersElement", () => {
    test("filterElements.init() creates FilterElements for each filter class selector", () => {
        $("body").append(HTML_MODEL);

        const oftState: OftStateController = new OftStateController(new OftStateBuilder().build());
        const filterElementFactory = new FilterElementFactoryMock();
        new FiltersElement(FILTER_MODELS_SAMPLE, oftState, filterElementFactory).init();

        expect(filterElementFactory.instances.length).toBe(2);

        assertFilterElement(filterElementFactory, 0, "type");
        assertFilterElement(filterElementFactory, 1, "coverage");
    });

    function assertFilterElement(filterElements: FilterElementFactoryMock, index: number, id: string) {
        const filterElementSpy: FilterElementSpy = filterElements.instances[index];
        expect(filterElementSpy.filterElement.id).toBe(id);
        expect(filterElementSpy.initSpy).toHaveBeenCalled();
        expect(filterElementSpy.activateSpy).toHaveBeenCalled();
        expect(filterElementSpy.filterElement.isActive()).toBe(true);
        expect(filterElementSpy.filterElement.selectElement.id).toBe(id);
    }
});