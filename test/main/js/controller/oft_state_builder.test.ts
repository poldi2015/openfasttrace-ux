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
import {SelectionFilter} from "@main/model/filter";
import {OftState} from "@main/model/oft_state";
import {SpecItem} from "@main/model/specitems";
import {IField} from "@main/model/project";

const SAMPLE_METADATA: Map<string, Array<IField>> = new Map(Object.entries({
    types: [
        {
            id:"feat",
            label: "feat",
            name: "Feature",
            tooltip: "A feature is a distinct functionality of the software.",
            item_count: 30,
        },
    ],
    coverages: [
        {
            id:"req",
            name: "Requirement",
            tooltip: "Missing requirements.",
            color: "red",
            item_count: 2,
        }
    ],
    status: [
        {
            id:"status",
            name: "Accepted",
            tooltip: "Item is an accepted traceable element.",
            color: "green",
            item_count: 50,
        }
    ],
    tags: [
        {
            id:"v0.1",
            name: "v0.1",
            tooltip: "Version 0.1",
            color: "green",
            item_count: 50,
        },
    ]
}));

const GOLDEN_MASTER_FILTER_WITHOUT_VALUES: Map<string, SelectionFilter> = new Map(
    Object
        .entries(SAMPLE_METADATA)
        .map(([key, _value]: [string, Array<IField>]): [string, SelectionFilter] => [key, new SelectionFilter(key, [])])
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
    },
];

describe("Tests of the Logger API", () => {

    test("create oft state initialized from metadata with a simple specitem", () => {
        const oftState: OftState = new OftStateBuilder().fromModel(SAMPLE_METADATA, SAMPLE_SPEC_ITEMS).build();
        expect(oftState.selectedIndex).toBe(0);
        expect(oftState.selectedFilters).toStrictEqual(GOLDEN_MASTER_FILTER_WITHOUT_VALUES);
    });

    test("create oft state initialized from metadata without a specitem", () => {
        const oftState: OftState = new OftStateBuilder().fromModel(SAMPLE_METADATA, []).build();
        expect(oftState.selectedIndex).toBeNull();
        expect(oftState.selectedFilters).toStrictEqual(GOLDEN_MASTER_FILTER_WITHOUT_VALUES);
    });

    test("create oft state initialized from metadata overridden by a filter value", () => {
        const changedFilters: Map<string, SelectionFilter> = GOLDEN_MASTER_FILTER_WITHOUT_VALUES;
        changedFilters.set("types", new SelectionFilter("types", [1]));
        const oftState: OftState = new OftStateBuilder()
            .fromModel(SAMPLE_METADATA, SAMPLE_SPEC_ITEMS)
            .setSelectedFilters(changedFilters)
            .build();
        expect(oftState.selectedIndex).toBe(0);
        expect(oftState.selectedFilters.get("types")).toBeInstanceOf(SelectionFilter);
    });
});