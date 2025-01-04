import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {FilterElement} from "@main/view/filter_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {OftStateController} from "@main/controller/oft_state_controller";
import {$} from "@test/fixtures/dom";
import {FILTER_MODELS_SAMPLE} from "@test/mocks/filter_mocks";
import {ExpandableElements} from "@main/view/expandable_elements";
import {SelectionFilter} from "@main/model/filter";

const HTML_MODEL = `
<div class="expandable" data-title="Type" data-tooltip="Type part of the Requirement ID">
    <select class="filter" id="type"></select>
</div>
`;

const GOLDEN_SAMPLE_FILTER_MODEL = `
<div class="expandable" data-title="Type" data-tooltip="Type part of the Requirement ID">
    <div class="_expandable-header">
        <span>Type</span>
        <div class="nav-bar _filter-nav-bar">
            <a class="nav-btn _img-filter-all" href="#"></a>
            <a class="nav-btn _img-filter-off" href="#"></a>
        </div>
    </div>
        <div class="_expandable-content visible">
        <select class="filter" id="type" multiple="multiple" size="1" disabled="disabled">
            <option id="type_0" style="color:red">Feature&nbsp;&nbsp;(5)</option>
        </select>
    </div>
</div>    
`;

describe("Tests  for FilterElement", () => {
    test("FilterElement can be instantiated correctly", () => {
        const body = $("body");
        body.append(HTML_MODEL);
        new ExpandableElements().init();
        const selectElement: HTMLElement = $(".filter")[0];

        const oftStateBuilder: OftStateBuilder = new OftStateBuilder()
            .setSelectedFilters(new Map<string, SelectionFilter>([['type', new SelectionFilter('type', [1])]]));
        const oftState: OftStateController = new OftStateController(oftStateBuilder.build());
        const filterElement = new FilterElement("type", selectElement, FILTER_MODELS_SAMPLE["type"], oftState);
        filterElement.init();
        expect(body).toMatchHTML(GOLDEN_SAMPLE_FILTER_MODEL);
    });
});