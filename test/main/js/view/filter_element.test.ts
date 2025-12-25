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
import {FilterElement} from "@main/view/filter_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {OftStateController} from "@main/controller/oft_state_controller";
import {$} from "@test/fixtures/dom";
import {FILTER_MODELS_SAMPLE} from "@test/mocks/filter_mocks";
import {ExpandableElements} from "@main/view/expandable_elements";
import {createFieldFilter} from "@test/samples/events";
import {FieldFilter} from "@main/model/filter";

const HTML_MODEL = `
<div class="expandable" data-title="Type" data-tooltip="Type part of the Requirement ID">
    <div class="filter" id="type"></div>
</div>
`;

const GOLDEN_SAMPLE_FILTER_MODEL = `
<div class="expandable" data-title="Type" data-tooltip="Type part of the Requirement ID">
    <div class="_expandable-header">
        <span>Type</span>
        <div class="nav-bar _filter-nav-bar">
            <a id="type-btn-all" class="nav-btn _img-filter-all" href="#" tabindex="-1"></a>
            <a id="type-btn-off" class="nav-btn nav-btn-activator _img-filter-off nav-btn-on" href="#" tabindex="-1"></a>
        </div>
    </div>
        <div class="_expandable-content visible">
        <div class="filter select-container no-selection select-disabled" id="type" disabled="disabled">
            <div id="select-type" class="select-entries" tabindex="0" style="height: 23px;">
                <div class="select-entry" data-index="0">
                    <span class="select-text">Feature</span>
                    <span class="select-count">(5)</span>
                </div>
            </div>
        </div>
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
            .setSelectedFilters(new Map<string, FieldFilter>([['type', createFieldFilter('type', [1])]]));
        const oftState: OftStateController = new OftStateController(oftStateBuilder.build());
        const filterElement = new FilterElement("type", selectElement, FILTER_MODELS_SAMPLE.get("type")!!, oftState);
        filterElement.init();
        expect(body).toMatchHTML(GOLDEN_SAMPLE_FILTER_MODEL);
    });
});