import {describe} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {FilterElement} from "@main/view/filter_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {OftStateController} from "@main/controller/oft_state_controller";
import {$} from "@test/fixtures/dom";
import {FILTER_MODELS_SAMPLE} from "@test/mocks/filter_mocks";
import {ExpandableElements} from "../../../../src/main/js/view/expandable_elements";

const HTML_MODEL = `
<div class="expandable" data-title="Type" data-tooltip="Type part of the Requirement ID">
    <select class="widget-filter" id="type"></select>
</div>
`;

describe("Tests  for FilterElement", () => {
    test("FilterElement can be instantiated correctly", () => {
        const body = $("body");
        body.append(HTML_MODEL);
        new ExpandableElements().init();
        const selectElement: HTMLElement = $(".widget-filter")[0];

        const oftStateBuilder: OftStateBuilder = new OftStateBuilder()
            .setSelectedFilters(new Map<string, number[]>([['type', [1, 2]]]));
        const oftState: OftStateController = new OftStateController(oftStateBuilder.build());
        const filterElement = new FilterElement("type", selectElement, FILTER_MODELS_SAMPLE["type"], oftState);
        filterElement.init();
        console.log(body.html());
    });
});