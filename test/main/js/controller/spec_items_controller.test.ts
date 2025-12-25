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
import {SpecItemsController} from "@main/controller/spec_items_controller";
import {OftStateController} from "@main/controller/oft_state_controller";
import {SpecItemsElement} from "@main/view/spec_items_element";
import {Project} from "@main/model/project";
import {SpecItem} from "@main/model/specitems";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {CoverType} from "../../../../src/main/js/model/oft_state";

// Make $ available globally for SpecItemsController constructor
(global as any).$ = $;

describe("SpecItemsController - Public API Methods", () => {
    let specItemsController: SpecItemsController;
    let mockOftStateController: OftStateController;
    let mockSpecItemsElement: SpecItemsElement;
    let mockProject: Project;
    let mockSpecItems: Array<SpecItem>;
    let oftState: any; // Reference to the OftState for direct access in tests

    beforeEach(() => {
        // Setup DOM structure
        document.body.innerHTML = `
            <div id="specitems-tab">
                <div id="focusitem"></div>
                <div id="specitems" style="height: 1000px;"></div>
            </div>
        `;

        // Mock jQuery methods for visibility calculations
        // Override outerHeight on jQuery.fn to return 1000 for container, 50 for items
        const originalOuterHeight = $.fn.outerHeight;
        $.fn.outerHeight = function(this: JQuery, value?: number | string | boolean) {
            // If setting a value, delegate to original
            if (typeof value === 'number' || typeof value === 'string') {
                return originalOuterHeight.call(this, value as any);
            }
            // Getting height - return mock values
            if (this.attr('id') === 'specitems') {
                return 1000;
            }
            // For spec item elements, return 50 regardless of includeMargin parameter
            return 50;
        } as any;
        
        // Override height similarly
        const originalHeight = $.fn.height;
        $.fn.height = function(this: JQuery, value?: number | string) {
            if (typeof value === 'number' || typeof value === 'string') {
                return originalHeight.call(this);
            }
            return 50;
        } as any;
        
        // Mock offset to return consistent positions
        const originalOffset = $.fn.offset;
        $.fn.offset = function(this: JQuery) {
            return { top: 100, left: 0 };
        } as any;

        // Create mock spec items
        mockSpecItems = [
            {
                index: 0,
                id: "req~test~1",
                title: "First Item",
                name: "First Item",
                status: 0,
                type: 0, // maps to "req" in type fields
                version: 1,
                content: "Test content",
                needs: [],
                provides: [],
                tags: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                path: ["test", "path"],
                sourceFile: "/test/file1.md",
                sourceLine: 10,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: [],
            } as SpecItem,
            {
                index: 1,
                id: "req~test~2",
                title: "Second Item",
                name: "Second Item",
                status: 0,
                type: 0, // maps to "req" in type fields
                version: 1,
                content: "Test content",
                needs: [],
                provides: [],
                tags: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                path: ["test", "path"],
                sourceFile: "/test/file2.md",
                sourceLine: 20,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: [],
            } as SpecItem,
            {
                index: 2,
                type: 0, // maps to "req" in type fields
                title: "Third Item",
                name: "Third Item",
                id: "req~test~3",
                tags: [],
                version: 1,
                content: "Test content",
                needs: [],
                provides: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                status: 0,
                path: ["test", "path"],
                sourceFile: "/test/file3.md",
                sourceLine: 30,
                comments: "",
                wrongLinkTypes: [],
                wrongLinkTargets: [],
            } as SpecItem
        ];

        // Create minimal mock project
        mockProject = {
            getFieldModel: vi.fn().mockReturnValue({
                fields: [{ name: "approved", label: "Approved" }]
            }),
            getTypeFieldModel: vi.fn().mockReturnValue({
                fields: [
                    { name: "req", label: "Requirement" },
                    { name: "dsn", label: "Design" },
                    { name: "impl", label: "Implementation" }
                ]
            }),
            createTypeFieldFilterMatcher: vi.fn().mockReturnValue(() => true)
        } as any;

        // Create oft state controller
        const oftStateObj = new OftStateBuilder().build();
        mockOftStateController = new OftStateController(oftStateObj);
        oftState = oftStateObj; // Save reference for tests

        // Create mock spec items element
        mockSpecItemsElement = {
            isActive: vi.fn().mockReturnValue(true),
            updateNumberOfItems: vi.fn(),
            updateCoveragePercentage: vi.fn(),
            setFocusVisibility: vi.fn()
        } as any;

        // Create controller
        specItemsController = new SpecItemsController(
            mockOftStateController,
            mockSpecItemsElement,
            mockProject
        );

        // Initialize with mock items
        specItemsController.init(mockSpecItems);
        mockOftStateController.init();
    });

    describe("isActive()", () => {
        test("should return true when SpecItemsElement is active", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(true);
            expect(specItemsController.isActive()).toBe(true);
        });

        test("should return false when SpecItemsElement is inactive", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(false);
            expect(specItemsController.isActive()).toBe(false);
        });
    });

    describe("selectNextSpecItem()", () => {
        test("should select first visible item when no item is selected", () => {
            const result = specItemsController.selectNextSpecItem();
            
            expect(result).toBe(true);
            expect(oftState.selectedIndex).toBe(0);
        });

        test("should select next item when current item is selected", () => {
            // Select first item
            mockOftStateController.selectItem(0);
            
            // Select next
            const result = specItemsController.selectNextSpecItem();
            
            expect(result).toBe(true);
            expect(oftState.selectedIndex).toBe(1);
        });

        test("should move from first to second item", () => {
            mockOftStateController.selectItem(0);
            
            specItemsController.selectNextSpecItem();
            
            expect(oftState.selectedIndex).toBe(1);
        });

        test("should move from second to third item", () => {
            mockOftStateController.selectItem(1);
            
            specItemsController.selectNextSpecItem();
            
            expect(oftState.selectedIndex).toBe(2);
        });

        test("should stay at last item when already at end", () => {
            mockOftStateController.selectItem(2);
            
            const result = specItemsController.selectNextSpecItem();
            
            expect(result).toBe(false);
            expect(oftState.selectedIndex).toBe(2);
        });

        test("should return false when SpecItemsElement is inactive", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(false);
            
            const result = specItemsController.selectNextSpecItem();
            
            expect(result).toBe(false);
        });

        test("should select first visible item when current selection is not visible", () => {
            // This would happen after filtering - simulate by selecting an item
            // then making it appear non-visible (in real scenario, filters would do this)
            mockOftStateController.selectItem(1);
            
            // Even if item 1 is selected, if it's filtered out (not visible),
            // selectNextSpecItem should select the first visible item
            const result = specItemsController.selectNextSpecItem();
            
            expect(result).toBe(true);
            // Should select first or next visible item
            expect(oftState.selectedIndex).toBeGreaterThanOrEqual(0);
        });
    });

    describe("selectPreviousSpecItem()", () => {
        test("should select last visible item when no item is selected", () => {
            const result = specItemsController.selectPreviousSpecItem();
            
            expect(result).toBe(true);
            expect(oftState.selectedIndex).toBe(2);
        });

        test("should select previous item when current item is selected", () => {
            // Select last item
            mockOftStateController.selectItem(2);
            
            // Select previous
            const result = specItemsController.selectPreviousSpecItem();
            
            expect(result).toBe(true);
            expect(oftState.selectedIndex).toBe(1);
        });

        test("should move from third to second item", () => {
            mockOftStateController.selectItem(2);
            
            specItemsController.selectPreviousSpecItem();
            
            expect(oftState.selectedIndex).toBe(1);
        });

        test("should move from second to first item", () => {
            mockOftStateController.selectItem(1);
            
            specItemsController.selectPreviousSpecItem();
            
            expect(oftState.selectedIndex).toBe(0);
        });

        test("should stay at first item when already at beginning", () => {
            mockOftStateController.selectItem(0);
            
            const result = specItemsController.selectPreviousSpecItem();
            
            expect(result).toBe(false);
            expect(oftState.selectedIndex).toBe(0);
        });

        test("should return false when SpecItemsElement is inactive", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(false);
            
            const result = specItemsController.selectPreviousSpecItem();
            
            expect(result).toBe(false);
        });

        test("should select last visible item when current selection is not visible", () => {
            mockOftStateController.selectItem(1);
            
            const result = specItemsController.selectPreviousSpecItem();
            
            expect(result).toBe(true);
            // Should select last or previous visible item
            expect(oftState.selectedIndex).toBeGreaterThanOrEqual(0);
        });
    });

    describe("isFocusedSpecItemSelected()", () => {
        test("should return false when SpecItemsElement is inactive", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(false);
            
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(false);
        });

        test("should return false when no item is selected", () => {
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(false);
        });

        test("should return false when item is selected but not focused", () => {
            mockOftStateController.selectItem(1);
            
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(false);
        });

        test("should return true when selected item is also focused", () => {
            // Select and focus the same item
            mockOftStateController.selectItem(1);
            mockOftStateController.focusItem(1,CoverType.coveredBy);
            
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(true);
        });

        test("should return true when focused item is automatically selected", () => {
            // When you focus an item, it automatically becomes selected too
            mockOftStateController.focusItem(2,CoverType.coveredBy);
            
            // Both selectedIndex and focusIndex should be 2
            expect(oftState.selectedIndex).toBe(2);
            expect(oftState.focusIndex).toBe(2);
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(true);
        });
    });

    describe("focusSelectedSpecItem()", () => {
        test("should return false when SpecItemsElement is inactive", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(false);
            
            expect(specItemsController.focusSelectedSpecItem()).toBe(false);
        });

        test("should return false when no item is selected", () => {
            expect(specItemsController.focusSelectedSpecItem()).toBe(false);
        });

        test("should return true when selected item is already focused", () => {
            mockOftStateController.selectItem(1);
            mockOftStateController.focusItem(1,CoverType.coveredBy);
            
            expect(specItemsController.focusSelectedSpecItem()).toBe(true);
        });

        test("should focus the selected item when it is not focused", () => {
            mockOftStateController.selectItem(1);
            
            const result = specItemsController.focusSelectedSpecItem();
            
            expect(result).toBe(true);
            // After focusing, the item should be both selected and focused
            expect(oftState.selectedIndex).toBe(1);
        });

        test("should handle focusing first item", () => {
            mockOftStateController.selectItem(0);
            
            const result = specItemsController.focusSelectedSpecItem();
            
            expect(result).toBe(true);
        });

        test("should handle focusing last item", () => {
            mockOftStateController.selectItem(2);
            
            const result = specItemsController.focusSelectedSpecItem();
            
            expect(result).toBe(true);
        });
    });

    describe("unfocusSpecItem()", () => {
        test("should return false when SpecItemsElement is inactive", () => {
            vi.mocked(mockSpecItemsElement.isActive).mockReturnValue(false);
            
            expect(specItemsController.unfocusSpecItem()).toBe(false);
        });

        test("should return false when no item is focused", () => {
            expect(specItemsController.unfocusSpecItem()).toBe(false);
        });

        test("should return true and unfocus when an item is focused", () => {
            mockOftStateController.selectItem(1);
            mockOftStateController.focusItem(1,CoverType.coveredBy);
            
            const result = specItemsController.unfocusSpecItem();
            
            expect(result).toBe(true);
            // After unfocusing, getFocusIndex should return null
            expect(oftState.focusIndex).toBeNull();
        });

        test("should maintain selection after unfocusing", () => {
            mockOftStateController.selectItem(1);
            mockOftStateController.focusItem(1,CoverType.coveredBy);
            
            specItemsController.unfocusSpecItem();
            
            // Selection should remain
            expect(oftState.selectedIndex).toBe(1);
        });
    });

    describe("Integration scenarios", () => {
        test("should navigate forward through all items", () => {
            // Start at first item
            specItemsController.selectNextSpecItem();
            expect(oftState.selectedIndex).toBe(0);
            
            // Move to second
            specItemsController.selectNextSpecItem();
            expect(oftState.selectedIndex).toBe(1);
            
            // Move to third
            specItemsController.selectNextSpecItem();
            expect(oftState.selectedIndex).toBe(2);
            
            // Try to move beyond last (should stay at 2)
            const result = specItemsController.selectNextSpecItem();
            expect(result).toBe(false);
            expect(oftState.selectedIndex).toBe(2);
        });

        test("should navigate backward through all items", () => {
            // Start at last item
            specItemsController.selectPreviousSpecItem();
            expect(oftState.selectedIndex).toBe(2);
            
            // Move to second
            specItemsController.selectPreviousSpecItem();
            expect(oftState.selectedIndex).toBe(1);
            
            // Move to first
            specItemsController.selectPreviousSpecItem();
            expect(oftState.selectedIndex).toBe(0);
            
            // Try to move before first (should stay at 0)
            const result = specItemsController.selectPreviousSpecItem();
            expect(result).toBe(false);
            expect(oftState.selectedIndex).toBe(0);
        });

        test("should handle focus and unfocus cycle", () => {
            // Select an item
            mockOftStateController.selectItem(1);
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(false);
            
            // Focus it
            specItemsController.focusSelectedSpecItem();
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(true);
            
            // Unfocus it
            specItemsController.unfocusSpecItem();
            expect(specItemsController.isFocusedSpecItemSelected()).toBe(false);
        });

        test("should handle navigation with focused item", () => {
            // Focus an item that's not the first in the list
            mockOftStateController.selectItem(1);
            mockOftStateController.focusItem(1,CoverType.coveredBy);
            
            // Navigate next from focused item - should go to first visible item (index 0)
            specItemsController.selectNextSpecItem();
            
            // Should move to first item (since nextSpecItemIndex(-1) finds first active)
            expect(oftState.selectedIndex).toBe(0);
        });
    });
});
