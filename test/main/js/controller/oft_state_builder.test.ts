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
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {createFieldFilter} from "@test/samples/events";
import {OftState} from "@main/model/oft_state";
import {SpecItem} from "@main/model/specitems";
import {FieldMetaData, IField, IProjectMetaData, Project} from "@main/model/project";
import {FieldFilter} from "@main/model/filter";

const SAMPLE_METADATA: FieldMetaData = {
    type: [
        {
            id: "feat",
            name: "Feature",
            tooltip: "A feature is a distinct functionality of the software.",
            item_count: 0,
        },
    ],
    coverage: [
        {
            id: "covered",
            tooltip: "Item is fully covered.",
            item_count: 0,
        },
        {
            id: "uncovered",
            tooltip: "Item has missing coverage.",
            item_count: 0,
        }
    ],
    wronglink: [
        {
            id: "orphaned",
            name: "Orphaned",
            tooltip: "Wrong link target.",
            item_count: 0,
        },
    ],
    status: [
        {
            id: "approved",
            name: "Accepted",
            tooltip: "Item is an accepted traceable element.",
            item_count: 0,
        }
    ],
    tags: [
        {
            id: "v0.1",
            tooltip: "Version 0.1",
            item_count: 0,
        },
    ]
};

const PROJECT_META_DATA: IProjectMetaData = {
    projectName: 'UX Reporter Example (2025-11-18T15.46.04.287572051)',
    types: ["reg", "req", "info", "itest", "test"],
    tags: ["vus", "vcs", "tms", "udm"],
    status: ["approved", "proposed", "draft", "rejected"],
    wronglinkNames: ["version", "orphaned", "unwanted"],
    item_count: 1740,
    item_covered: 1403,
    item_uncovered: 337,
    type_count: [1, 695, 3, 520, 521],
    uncovered_count: [1, 333, 3, 0, 0],
    status_count: [1740, 0, 0, 0],
    tag_count: [1418, 70, 98, 184],
    wronglink_count: [103, 116, 114],
};

// Create a mock Project with fieldModels
const mockMatcher = () => true;
const MOCK_PROJECT: Project = new Project(
    PROJECT_META_DATA,
    {
        project: {maxcovering: 3},
        fields: SAMPLE_METADATA
    },
);

const GOLDEN_MASTER_FILTER_WITHOUT_VALUES: Map<string, FieldFilter> = new Map(
    Object
        .entries(SAMPLE_METADATA)
        .map(([key, _value]: [string, Array<IField>]): [string, FieldFilter] => [key, createFieldFilter(key, [])])
);

const SAMPLE_SPEC_ITEMS: Array<SpecItem> = [
    {
        index: 0,
        type: 0,
        title: "culpa-fugiat-aute-amet-qui-occaecat",
        name: "culpa-fugiat-aute-amet-qui-occaecat",
        id: "feat:culpa-fugiat-aute-amet-qui-occaecat:3",
        tags: [],
        version: 3,
        content: "Eu amet et deserunt ad et consequat sunt et aliqua consequat nulla. Irure nulla ",
        provides: [],
        needs: [],
        covered: [0, 1, 1, 1, 1, 1, 1],
        uncovered: [0, 1, 2, 3, 4, 5],
        covering: [],
        coveredBy: [107, 108],
        depends: [],
        status: 1,
        path: ["project", "spec", "content"],
        sourceFile: "",
        sourceLine: 5,
        comments: "",
        wrongLinkTypes: [],
        wrongLinkTargets: [],
    },
];

describe("Tests of the Logger API", () => {

    test("create oft state initialized from metadata with a simple specitem", () => {
        const oftState: OftState = new OftStateBuilder().fromModel(MOCK_PROJECT, SAMPLE_SPEC_ITEMS).build();
        expect(oftState.selectedIndex).toBe(0);

        // Check that all expected filters are present
        expect(oftState.selectedFilters.size).toBe(GOLDEN_MASTER_FILTER_WITHOUT_VALUES.size);
        for (const [key, expectedFilter] of GOLDEN_MASTER_FILTER_WITHOUT_VALUES) {
            expect(oftState.selectedFilters.has(key)).toBe(true);
            const actualFilter = oftState.selectedFilters.get(key);
            expect(actualFilter).toBeInstanceOf(FieldFilter);
            expect(actualFilter!.filterName).toBe(expectedFilter.filterName);
        }
    });

    test("create oft state initialized from metadata without a specitem", () => {
        const oftState: OftState = new OftStateBuilder().fromModel(MOCK_PROJECT, []).build();
        expect(oftState.selectedIndex).toBeNull();

        // Check that all expected filters are present
        expect(oftState.selectedFilters.size).toBe(GOLDEN_MASTER_FILTER_WITHOUT_VALUES.size);
        for (const [key, expectedFilter] of GOLDEN_MASTER_FILTER_WITHOUT_VALUES) {
            expect(oftState.selectedFilters.has(key)).toBe(true);
            const actualFilter = oftState.selectedFilters.get(key);
            expect(actualFilter).toBeInstanceOf(FieldFilter);
            expect(actualFilter!.filterName).toBe(expectedFilter.filterName);
        }
    });

    test("create oft state initialized from metadata overridden by a filter value", () => {
        const changedFilters: Map<string, FieldFilter> = GOLDEN_MASTER_FILTER_WITHOUT_VALUES;
        changedFilters.set("types", createFieldFilter("types", [1]));
        const oftState: OftState = new OftStateBuilder()
            .fromModel(MOCK_PROJECT, SAMPLE_SPEC_ITEMS)
            .setSelectedFilters(changedFilters)
            .build();
        expect(oftState.selectedIndex).toBe(0);
        expect(oftState.selectedFilters.get("types")).toBeInstanceOf(FieldFilter);
    });
});