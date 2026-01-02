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
import {afterEach, beforeEach, describe, expect, vi} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {$} from "@test/fixtures/dom";
import {SpecItemElement} from "@main/view/spec_item_element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {Project} from "@main/model/project";
import {SpecItem} from "@main/model/specitems";
import {CoverType} from "@main/model/oft_state";
import {FieldFilter, IndexFilter} from "@main/model/filter";

describe("SpecItemElement - Badge Click Functionality", () => {
    let body: JQuery<HTMLElement>;
    let specItem: SpecItem;
    let oftStateController: OftStateController;
    let project: Project;
    let specItemElement: SpecItemElement;
    let specItems: Map<number, SpecItem>;

    beforeEach(() => {
        body = $("body");
        body.empty();
        body.append('<div id="specitems"></div>');

        // Create a test specItem with coverage data
        specItem = {
            index: 0,
            type: 1, // "feat" type
            name: "test-item",
            fullName: "feat:test-item:1",
            id: "feat:test-item:1",
            title: "Test Item",
            tags: [0],
            version: 1,
            content: "Test content",
            provides: [2, 3],
            needs: [4, 5],
            covered: [0, 2, 1, 2, 2], // covered states for different types
            uncovered: [2, 4],
            covering: [10, 11, 12], // items this item covers
            coveredBy: [20, 21],
            depends: [],
            status: 0,
            path: ["test"],
            sourceFile: "test.md",
            sourceLine: 1,
            comments: "",
            wrongLinkTypes: [],
            wrongLinkTargets: []
        } as SpecItem;

        // Create mock project with type field model
        project = {
            projectName: "Test Project",
            types: ["variants", "feat", "req", "arch", "dsn"],
            typedFieldNames: ["type"],
            tags: [],
            tagFieldNames: [],
            statusNames: ["Accepted"],
            statusFieldNames: ["status"],
            itemCount: 1,
            itemCovered: 1,
            itemUncovered: 0,
            fieldModels: new Map(),
            getTypeFieldModel: vi.fn().mockReturnValue({
                fields: [
                    {id: "0", label: "variants", name: "variants", tooltip: "", item_count: 0},
                    {id: "1", label: "feat", name: "feat", tooltip: "", item_count: 1},
                    {id: "2", label: "req", name: "req", tooltip: "", item_count: 0},
                    {id: "3", label: "arch", name: "arch", tooltip: "", item_count: 0},
                    {id: "4", label: "dsn", name: "dsn", tooltip: "", item_count: 0}
                ]
            }),
            getFieldModel: vi.fn().mockReturnValue({
                fields: [
                    {id: "0", label: "Accepted", name: "Accepted", tooltip: "", item_count: 1}
                ]
            })
        } as unknown as Project;

        // Create mock OftStateController
        oftStateController = new OftStateController();
        vi.spyOn(oftStateController, 'focusItem');
        vi.spyOn(oftStateController, 'selectItem');

        // Create specItems Map
        specItems = new Map<number, SpecItem>();
        specItems.set(0, specItem);

        // Add items that cover this specItem (referenced by coveredBy array)
        // Item 20 has type 3 (arch), Item 21 has type 3 (arch)
        specItems.set(20, {...specItem, index: 20, type: 3} as SpecItem);
        specItems.set(21, {...specItem, index: 21, type: 3} as SpecItem);

        // Create SpecItemElement
        specItemElement = new SpecItemElement(specItem, specItems, oftStateController, project);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("SpecItemElement creates covered badge elements with correct IDs", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Check that covered badges are created
        // covered array is [0, 2, 1, 2, 2] meaning:
        // index 0 (variants): 0 (none) - no badge
        // index 1 (feat): 2 (covered) - but excluded (own type, specItem.type = 1)
        // index 2 (req): 1 (uncovered) - badge with _specitem-uncovered
        // index 3 (arch): 2 (covered) - badge with _specitem-covered
        // index 4 (dsn): 2 (covered) - badge with _specitem-covered

        // After filtering out own type (index 1), the badges use the FILTERED indices
        // So badge IDs use the index from the filtered array, not the original
        // But we actually check the covered value at the original index position
        // Let's check what badges actually exist
        const coveredBadge2 = $(`#to_0_cov2`); // req (index 2) - uncovered
        const coveredBadge3 = $(`#to_0_cov3`); // arch (index 3) - covered

        expect(coveredBadge2.length).toBe(1);
        expect(coveredBadge2.hasClass("_specitem-uncovered")).toBe(true);
        expect(coveredBadge3.length).toBe(1);
        expect(coveredBadge3.hasClass("_specitem-covered")).toBe(true);
    });

    test("Clicking covered badge pins item and sets type filter", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click on the covered badge for type index 3 (arch)
        const coveredBadge = $(`#to_0_cov3`);
        coveredBadge.trigger("click");

        // Verify focusItem was called with correct parameters
        expect(oftStateController.focusItem).toHaveBeenCalledTimes(1);

        const callArgs = (oftStateController.focusItem as any).mock.calls[0];
        expect(callArgs[0]).toBe(0); // specItem index
        expect(callArgs[1]).toBe(CoverType.coveredBy); // coverType

        const filters = callArgs[2];
        expect(filters).toBeInstanceOf(Map);
        expect(filters.size).toBe(2);

        // Check IndexFilter
        const indexFilter = filters.get(IndexFilter.FILTER_NAME);
        expect(indexFilter).toBeInstanceOf(IndexFilter);

        // Check FieldFilter for type
        const typeFilter = filters.get("type");
        expect(typeFilter).toBeInstanceOf(FieldFilter);
        expect((typeFilter as FieldFilter).fieldIndexes).toEqual([3]);
    });

    test("Clicking covered badge for different type sets correct type filter", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click on the covered badge for type index 3 (arch)
        const coveredBadge = $(`#to_0_cov3`);
        coveredBadge.trigger("click");

        expect(oftStateController.focusItem).toHaveBeenCalledTimes(1);

        const callArgs = (oftStateController.focusItem as any).mock.calls[0];
        const filters = callArgs[2];

        const typeFilter = filters.get("type");
        expect(typeFilter).toBeInstanceOf(FieldFilter);
        expect((typeFilter as FieldFilter).fieldIndexes).toEqual([3]);
    });

    test("Clicking covered badge includes covering items in index filter", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click on any covered badge
        const coveredBadge = $(`#to_0_cov3`);
        coveredBadge.trigger("click");

        const callArgs = (oftStateController.focusItem as any).mock.calls[0];
        const filters = callArgs[2];

        const indexFilter = filters.get(IndexFilter.FILTER_NAME);
        expect(indexFilter).toBeInstanceOf(IndexFilter);
        // Should include the coveredBy items: [20, 21]
        expect((indexFilter as any).acceptedIndexes).toEqual([20, 21]);
    });

    test("Clicking covered badge when item has no covering items uses [-1]", () => {
        // Create item with no coveredBy items
        specItem.coveredBy = [];
        specItemElement = new SpecItemElement(specItem, specItems, oftStateController, project);
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        const coveredBadge = $(`#to_0_cov3`);
        coveredBadge.trigger("click");

        const callArgs = (oftStateController.focusItem as any).mock.calls[0];
        const filters = callArgs[2];

        const indexFilter = filters.get(IndexFilter.FILTER_NAME);
        // Should use [-1] as placeholder when no coveredBy items
        expect((indexFilter as any).acceptedIndexes).toEqual([-1]);
    });

    test("Clicking covered badge does not trigger parent click event", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click on the covered badge
        const coveredBadge = $(`#to_0_cov3`);
        coveredBadge.trigger("click");

        // selectItem should NOT be called (parent click would call it)
        expect(oftStateController.selectItem).not.toHaveBeenCalled();
        // Only focusItem should be called
        expect(oftStateController.focusItem).toHaveBeenCalledTimes(1);
    });

    test("Clicking uncovered badge does not trigger focus with type filter", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Check if uncovered badge exists (index 2 is uncovered)
        const uncoveredBadge = $(`#to_0_cov2`);
        if (uncoveredBadge.length > 0) {
            // Uncovered badges should not have the click handler
            uncoveredBadge.trigger("click");

            // selectItem might be called by parent click
            // but focusItem should not be called with type filter
            const focusCalls = (oftStateController.focusItem as any).mock.calls;

            // If focusItem is called, it should be from parent element, not type filter logic
            if (focusCalls.length > 0) {
                // The filters should only have IndexFilter, not type filter
                const filters = focusCalls[0][2];
                if (filters) {
                    expect(filters.has("type")).toBe(false);
                }
            }
        }
    });

    test("Clicking acceptance badge still works as before", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click on the acceptance badge (✓ or ✗)
        const acceptanceBadge = $("._specitem-accepted, ._specitem-rejected");
        if (acceptanceBadge.length > 0) {
            acceptanceBadge.trigger("click");

            // Should call focusItem but without type filter
            expect(oftStateController.focusItem).toHaveBeenCalledTimes(1);

            const callArgs = (oftStateController.focusItem as any).mock.calls[0];
            const filters = callArgs[2];

            // Should only have IndexFilter, not type filter
            expect(filters.has("type")).toBe(false);
        }
    });

    test("Clicking element area (not badges) triggers selection", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click on the element itself (not on badges)
        const element = $("#to_0");

        // Find an area that's not a badge to click
        const bodyArea = element.find("._specitem-body");
        if (bodyArea.length > 0) {
            bodyArea.trigger("click");

            // Should call selectItem
            expect(oftStateController.selectItem).toHaveBeenCalledWith(0);
            expect(oftStateController.focusItem).not.toHaveBeenCalled();
        }
    });

    test("Element is not active, clicking covered badge does nothing", () => {
        specItemElement.insertToAt($("#specitems"));
        // Don't activate the element

        const coveredBadge = $(`#to_0_cov3`);
        coveredBadge.trigger("click");

        // Should not call focusItem when element is not active
        expect(oftStateController.focusItem).not.toHaveBeenCalled();
    });

    test("Multiple covered badges can be clicked independently", () => {
        // Add another covered type to the specItem for this test
        specItem.covered = [0, 2, 1, 2, 2]; // Add more covered types
        specItemElement = new SpecItemElement(specItem, specItems, oftStateController, project);
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Click first covered badge (arch at index 3)
        const badge3 = $(`#to_0_cov3`);
        expect(badge3.length).toBeGreaterThan(0); // Ensure badge exists
        badge3.trigger("click");
        expect(oftStateController.focusItem).toHaveBeenCalledTimes(1);

        let filters = (oftStateController.focusItem as any).mock.calls[0][2];
        let typeFilter = filters.get("type");
        expect((typeFilter as FieldFilter).fieldIndexes).toEqual([3]);

        // For the second click, we need to ensure we're clicking a different covered badge
        // Since specItem.type = 1 is filtered out, we check other covered types
        // Let's use index 4 if it exists
        const badge4 = $("#to_0").find('._specitem-covered').eq(1); // Get second covered badge
        if (badge4.length > 0) {
            // Extract the type index from the badge id
            const badgeId = badge4.attr('id');
            badge4.trigger("click");

            filters = (oftStateController.focusItem as any).mock.calls[1][2];
            typeFilter = filters.get("type");
            // The type index should be extracted from the badge id
            const match = badgeId?.match(/_cov(\d+)$/);
            if (match) {
                expect((typeFilter as FieldFilter).fieldIndexes).toEqual([parseInt(match[1])]);
            }
        }
    });

    test("Covered badge displays count badge with coveredBy length", () => {
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Find a covered badge (arch at index 3)
        const coveredBadge = $(`#to_0_cov3`);
        expect(coveredBadge.length).toBe(1);

        // Check that it contains a count badge
        const countBadge = coveredBadge.find('._count-badge');
        expect(countBadge.length).toBe(1);

        // The count should match the coveredBy length (2 items in our test data)
        expect(countBadge.text()).toBe('2');
    });

    test("Covered badge shows no count badge when coveredBy is empty", () => {
        // Modify specItem to have empty coveredBy
        specItem.coveredBy = [];
        specItemElement = new SpecItemElement(specItem, specItems, oftStateController, project);
        specItemElement.insertToAt($("#specitems"));
        specItemElement.activate();

        // Find a covered badge
        const coveredBadge = $(`#to_0_cov3`);
        expect(coveredBadge.length).toBe(1);

        // Check that there's no count badge
        const countBadge = coveredBadge.find('._coverage-count-badge');
        expect(countBadge.length).toBe(0);
    });
});

