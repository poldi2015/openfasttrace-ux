import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {FiltersElement} from "@main/view/filters_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {OftStateController} from "@main/controller/oft_state_controller";
import {FILTER_MODELS_SAMPLE, FilterElementFactoryMock, FilterElementSpy} from "@test/mocks/filter_mocks";
import {$} from "@test/fixtures/dom";

const HTML_MODEL = `
<div>
    <select class="filter" id="type"></select>
    <select class="filter" id="coverage"></select>
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
        expect(filterElementSpy.filterElement.isActive).toBe(true);
        expect(filterElementSpy.filterElement.selectElement.id).toBe(id);
    }
});