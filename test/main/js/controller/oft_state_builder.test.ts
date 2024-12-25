import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {FilterModel, FilterModels} from "@main/model/filter";
import {OftState} from "@main/model/oft_state";
import {SpecItem} from "@main/model/specitems";

const SAMPLE_METADATA: FilterModels = {
    types: [
        {
            label: "feat",
            name: "Feature",
            tooltip: "A feature is a distinct functionality of the software.",
            item_count: 30,
        },
    ],
    coverages: [
        {
            name: "Requirement",
            tooltip: "Missing requirements.",
            color: "red",
            item_count: 2,
        }
    ],
    status: [
        {
            name: "Accepted",
            tooltip: "Item is an accepted traceable element.",
            color: "green",
            item_count: 50,
        }
    ],
    tags: [
        {
            name: "v0.1",
            tooltip: "Version 0.1",
            color: "green",
            item_count: 50,
        },
    ]
};

const GOLDEN_MASTER_FILTER_WITHOUT_VALUES: Map<string, Array<number>> = new Map(
    Object
        .entries(SAMPLE_METADATA)
        .map(([key, _value]: [string, Array<FilterModel>]): [string, never[]] => [key, []])
);

const SAMPLE_SPEC_ITEMS: Array<SpecItem> = [
    {
        index: 0,
        type: 0,
        name: "culpa-fugiat-aute-amet-qui-occaecat",
        version: 3,
        content: "Eu amet et deserunt ad et consequat sunt et aliqua consequat nulla. Irure nulla ",
        covered: [0, 1, 1, 1, 1, 1, 1],
        uncovered: [0, 1, 2, 3, 4, 5],
        covering: [],
        coveredBy: [107, 108],
        status: 1,
        path: ["project", "spec", "content"],
    },
];

describe("Tests of the Logger API", () => {

    test("create oft state initialized from metadata with a simple specitem", () => {
        const oftState: OftState = new OftStateBuilder().fromModel(SAMPLE_METADATA, SAMPLE_SPEC_ITEMS).build();
        expect(oftState.selectedIndex).toBe(0);
        expect(oftState.selectedPath).toStrictEqual(["project", "spec", "content"]);
        expect(oftState.selectedFilters).toStrictEqual(GOLDEN_MASTER_FILTER_WITHOUT_VALUES);
    });

    test("create oft state initialized from metadata without a specitem", () => {
        const oftState: OftState = new OftStateBuilder().fromModel(SAMPLE_METADATA, []).build();
        expect(oftState.selectedIndex).toBeNull();
        expect(oftState.selectedPath).toStrictEqual([]);
        expect(oftState.selectedFilters).toStrictEqual(GOLDEN_MASTER_FILTER_WITHOUT_VALUES);
    });

    test("create oft state initialized from metadata overridden by a filter value", () => {
        const changedFilters: Map<string, Array<number>> = GOLDEN_MASTER_FILTER_WITHOUT_VALUES;
        changedFilters.set("types", [1]);
        const oftState: OftState = new OftStateBuilder()
            .fromModel(SAMPLE_METADATA, SAMPLE_SPEC_ITEMS)
            .setSelectedFilters(changedFilters)
            .build();
        expect(oftState.selectedIndex).toBe(0);
        expect(oftState.selectedPath).toStrictEqual(["project", "spec", "content"]);
        expect(oftState.selectedFilters.get("types")).toHaveLength(1);
    });
});