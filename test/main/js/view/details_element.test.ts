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
import {describe, test, expect, vi, beforeEach} from "vitest";
import {$} from "@test/fixtures/dom";
import {DetailsElement} from "@main/view/details_element";
import {SpecItem} from "@main/model/specitems";
import {Project, FieldModel} from "@main/model/project";
import {OftStateController} from "@main/controller/oft_state_controller";

describe("DetailsElement - Wrong Links Copy Buttons", () => {
    let detailsElement: DetailsElement;
    let mockSpecItems: Array<SpecItem>;
    let mockProject: Project;
    let mockOftState: OftStateController;

    beforeEach(() => {
        // Setup DOM structure
        document.body.innerHTML = `
            <div id="details">
                <div class="nav-header">
                    <span class="specitem-id"></span>
                    <button id="details-copy-btn">Copy</button>
                </div>
                <table id="details-table">
                    <tr><td id="details-status" class="details-table-value"></td></tr>
                    <tr><td id="details-needs" class="details-table-value"></td></tr>
                    <tr><td id="details-covers" class="details-table-value"></td></tr>
                    <tr><td id="details-tags" class="details-table-value"></td></tr>
                    <tr><td id="details-wrong-version" class="details-table-value"></td></tr>
                    <tr><td id="details-wrong-orphan" class="details-table-value"></td></tr>
                    <tr><td id="details-wrong-unwanted" class="details-table-value"></td></tr>
                    <tr><td id="details-source" class="details-table-value"></td></tr>
                    <tr><td id="details-comments" class="details-table-value"></td></tr>
                    <tr><td id="details-dependencies" class="details-table-value"></td></tr>
                </table>
            </div>
        `;

        // Create mock spec item with wrong links
        mockSpecItems = [
            {
                index: 0,
                id: "req~test~1",
                title: "Test Item",
                name: "Test Item",
                type: 0,
                version: 1,
                content: "Test content",
                status: 0,
                needs: [],
                provides: [],
                tags: [],
                covered: [],
                uncovered: [],
                covering: [],
                coveredBy: [],
                depends: [],
                path: ["test"],
                sourceFile: "/test/file.md",
                sourceLine: 10,
                comments: "Test comments",
                wrongLinkTypes: [],
                wrongLinkTargets: [
                    "target1[version]",
                    "target2[version]",
                    "orphan1[orphaned]",
                    "unwanted1[unwanted]"
                ]
            } as SpecItem
        ];

        // Create minimal mock project
        const wrongLinkFields = [
            { id: "version", name: "Version Mismatch", label: "Ver", tooltip: "Version mismatch", item_count: 2 },
            { id: "orphaned", name: "Orphaned", label: "Orph", tooltip: "Orphaned link", item_count: 1 },
            { id: "unwanted", name: "Unwanted", label: "Unw", tooltip: "Unwanted link", item_count: 1 }
        ];
        const wrongLinkFieldModel = new FieldModel("wronglink", wrongLinkFields, () => true);
        const fieldModels = new Map();
        fieldModels.set("wronglink", wrongLinkFieldModel);
        
        mockProject = {
            fieldModels: fieldModels,
            getFieldModel: vi.fn().mockReturnValue({
                fields: [{ name: "approved" }]
            }),
            getTypeFieldModel: vi.fn().mockReturnValue({
                fields: []
            })
        } as any;

        // Create minimal mock OftStateController
        mockOftState = {
            addChangeListener: vi.fn(),
            removeChangeListener: vi.fn(),
            selectAndShowItem: vi.fn()
        } as any;

        // Mock clipboard API
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined)
            }
        });

        detailsElement = new DetailsElement(mockSpecItems, mockProject, mockOftState);
        detailsElement.init();
    });

    test("should render copy buttons for wrong link entries", () => {
        // Activate and trigger selection to populate the table
        detailsElement.activate();
        
        // Simulate selection change by directly calling the private method
        (detailsElement as any).selectionChangeListener(0);

        // Check that wrong link version entries have copy buttons
        const versionCell = $("#details-wrong-version");
        const versionButtons = versionCell.find('.wrong-link-copy-btn');
        expect(versionButtons.length).toBe(2); // target1 and target2
    });

    test("should render correct number of copy buttons for each wrong link type", () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        // Version: 2 entries
        expect($("#details-wrong-version").find('.wrong-link-copy-btn').length).toBe(2);
        
        // Orphan: 1 entry
        expect($("#details-wrong-orphan").find('.wrong-link-copy-btn').length).toBe(1);
        
        // Unwanted: 1 entry
        expect($("#details-wrong-unwanted").find('.wrong-link-copy-btn').length).toBe(1);
    });

    test("should have correct data-value attribute on copy buttons", () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const versionButtons = $("#details-wrong-version").find('.wrong-link-copy-btn');
        expect(versionButtons.eq(0).data('value')).toBe('target1');
        expect(versionButtons.eq(1).data('value')).toBe('target2');
        
        const orphanButton = $("#details-wrong-orphan").find('.wrong-link-copy-btn');
        expect(orphanButton.eq(0).data('value')).toBe('orphan1');
        
        const unwantedButton = $("#details-wrong-unwanted").find('.wrong-link-copy-btn');
        expect(unwantedButton.eq(0).data('value')).toBe('unwanted1');
    });

    test("should copy value to clipboard when copy button is clicked", async () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const copyButton = $("#details-wrong-version").find('.wrong-link-copy-btn').first();
        copyButton.trigger('click');

        // Wait for async clipboard operation
        await new Promise(resolve => setTimeout(resolve, 10));

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('target1');
    });

    test("should add success class after successful copy", async () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const copyButton = $("#details-wrong-version").find('.wrong-link-copy-btn').first();
        
        // Initially no success class
        expect(copyButton.hasClass('_copy-success')).toBe(false);
        
        // Click button
        copyButton.trigger('click');
        
        // Wait for clipboard operation to complete
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Success class should be added after async operation
        expect(copyButton.hasClass('_copy-success')).toBe(true);
    });

    test("should handle empty wrong links array", () => {
        const emptySpecItem = {
            ...mockSpecItems[0],
            wrongLinkTargets: []
        } as SpecItem;
        
        mockSpecItems[0] = emptySpecItem;
        
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        // No buttons should be rendered
        expect($("#details-wrong-version").find('.wrong-link-copy-btn').length).toBe(0);
        expect($("#details-wrong-orphan").find('.wrong-link-copy-btn').length).toBe(0);
        expect($("#details-wrong-unwanted").find('.wrong-link-copy-btn').length).toBe(0);
    });

    test("should handle spec item with only one type of wrong links", () => {
        const singleTypeSpecItem = {
            ...mockSpecItems[0],
            wrongLinkTargets: [
                "orphan1[orphaned]",
                "orphan2[orphaned]",
                "orphan3[orphaned]"
            ]
        } as SpecItem;
        
        mockSpecItems[0] = singleTypeSpecItem;
        
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        // Only orphan should have buttons
        expect($("#details-wrong-version").find('.wrong-link-copy-btn').length).toBe(0);
        expect($("#details-wrong-orphan").find('.wrong-link-copy-btn').length).toBe(3);
        expect($("#details-wrong-unwanted").find('.wrong-link-copy-btn').length).toBe(0);
    });

    test("should include material icon in copy button", () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const copyButton = $("#details-wrong-version").find('.wrong-link-copy-btn').first();
        const icon = copyButton.find('._img-content-copy');
        
        expect(icon.length).toBe(1);
    });

    test("should wrap each entry in a span with wrong-link-entry class", () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const versionCell = $("#details-wrong-version");
        const entrySpans = versionCell.find('.wrong-link-entry');
        
        expect(entrySpans.length).toBe(2);
    });

    test("should separate multiple entries with line breaks", () => {
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const versionHtml = $("#details-wrong-version").html();
        
        // Should contain <br> tags between entries
        expect(versionHtml).toContain('<br>');
    });

    test("should handle clipboard write failure gracefully", async () => {
        // Mock clipboard to reject
        const clipboardError = new Error("Clipboard write failed");
        const writeTextMock = vi.fn().mockRejectedValue(clipboardError);
        Object.assign(navigator, {
            clipboard: {
                writeText: writeTextMock
            }
        });

        // Re-initialize with new clipboard mock
        detailsElement = new DetailsElement(mockSpecItems, mockProject, mockOftState);
        detailsElement.init();
        
        detailsElement.activate();
        (detailsElement as any).selectionChangeListener(0);

        const copyButton = $("#details-wrong-version").find('.wrong-link-copy-btn').first();
        
        // Trigger click - should not throw
        copyButton.trigger('click');
        
        // Wait briefly for promise to reject
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Verify writeText was called
        expect(writeTextMock).toHaveBeenCalled();
        
        // Button should not have success class after error
        expect(copyButton.hasClass('_copy-success')).toBe(false);
    });
});
