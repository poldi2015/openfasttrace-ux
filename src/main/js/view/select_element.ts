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

import {Log} from "@main/utils/log";
import {IElement} from "@main/view/element";
import {SpecItem} from "@main/model/specitems";
import {Project} from "@main/model/project";
import {OftStateController} from "@main/controller/oft_state_controller";
import {IFilterElement} from "@main/view/filter_element";
import {DetailsElement} from "@main/view/details_element";

/**
 * Maximum number of filter elements to be shown in the UI.
 */
const MAX_ENTRIES = 12;

/**
 * Interface for multi-select option items
 */
export interface IEntry {
    readonly text: string;
    readonly count?: number;
    readonly icon?: string;
    selected?: boolean;
}

export interface ISelectElement extends IElement {
} // IDetailsElement

export class SelectElementFactory {
    public build(specItems: Array<SpecItem>, project: Project, oftState: OftStateController): IFilterElement {
        return new DetailsElement(specItems, project, oftState);
    }
} // SelectElement


export class SelectElement implements ISelectElement {

    /**
     * @param id Unique identifier for this select element
     * @param model The entries within the selector list
     * @param size the size of the selector element
     * @param changeHandler Called on selection change
     * @param selectorElement The element to which the container will be added
     */
    constructor(public readonly id: string,
                private readonly model: Array<IEntry>,
                private readonly size: number,
                private readonly changeHandler: (selectedIndexes: number[]) => void,
                private readonly selectorElement: JQuery) {
        this.log.info("SelectElement initialized with id:", id);
    }

    private entriesElement: JQuery | null = null;

    private readonly log: Log = new Log("SelectElement");

    // Mouse drag selection state
    private isDragging: boolean = false;
    private dragStartSelection: boolean = false; // Track whether we're selecting or deselecting during drag

    //
    // Public interface

    public init(): ISelectElement {
        this.log.info("init", this.id);
        this.addEntries();
        this.deactivate();
        return this;
    }

    public activate(): void {
        this.log.info("activate", this.id);
        this.selectorElement.removeAttr("disabled");
        this.selectorElement.removeClass('select-disabled');
        this.updateDisplay();
    }

    public deactivate(): void {
        this.log.info("deactivate", this.id);
        this.selectorElement.attr("disabled", "disabled");
        this.selectorElement.addClass('select-disabled');
        this.isDragging = false;
    }

    /**
     * @returns true if the element is active.
     */
    public isActive(): boolean {
        return this.selectorElement.attr("disabled") == undefined;
    }

    /**
     * Get the indexed that are currently selected
     */
    public getSelectedIndexes(): number[] {
        return this.model.map((entry, index) => entry.selected ? index : -1).filter(index => index !== -1);
    }

    /**
     * Call when the selection within the model has been updated.
     */
    public updateSelection(): void {
        this.updateDisplay();
        this.notifyChange();
    }

    /**
     * Select all options
     */
    public selectAll(): void {
        this.log.info("selectAll", this.id);
        this.model.forEach((entry: IEntry) => entry.selected = true);
        this.updateDisplay();
        this.notifyChange();
    }

    /**
     * Deselect all options
     */
    public selectNone(): void {
        this.log.info("selectNone", this.id);
        this.model.forEach((entry: IEntry) => entry.selected = false);
        this.updateDisplay();
        this.notifyChange();
    }


    //
    // Private members


    // Render UI

    /**
     * Render the initial structure
     */
    private addEntries(): void {
        this.selectorElement.addClass('select-container');
        this.selectorElement.html(`
            <div class="select-entries"></div>
        `);
        this.entriesElement = this.selectorElement.find('> .select-entries');

        this.addHandleMouseLeave();

        this.model.forEach((entry, index) => {
            const itemElement = this.createEntryElement(entry, index);
            this.entriesElement!.append(itemElement);
        });

        this.setHeight();
    }

    private createEntryElement(entry: IEntry, index: number): JQuery {
        const entryElement = $(`<div class="select-entry" data-index="${index}"></div>`);

        if (entry.selected) {
            entryElement.addClass('selected');
        }

        // Add icon if provided
        if (entry.icon) {
            entryElement.append(`<span class="select-icon ${entry.icon}"></span>`);
        }

        // Add text
        const textElement = $(`<span class="select-text">${this.escapeHtml(entry.text)}</span>`);
        entryElement.append(textElement);

        // Add count if provided
        if (entry.count !== undefined && entry.count >= 0) {
            entryElement.append(`<span class="select-count">(${entry.count})</span>`);
        }

        // Event listeners
        entryElement.on('mousedown', (event) => {
            this.log.info("Entry mousedown", index, entry.text);
            event.preventDefault();
            this.handleMouseDown(entry, index);
        });

        entryElement.on('mouseenter', () => {
            if (this.isDragging) {
                this.log.info("Entry mouseenter during drag", index, entry.text);
                this.handleMouseOver(entry, index);
            }
        });

        return entryElement;
    }

    /**
     * Update the container height based on number of visible items
     */
    private setHeight(): void {
        if (!this.entriesElement) return;

        const itemHeight = 22; // Height of each option item (padding + content)
        const visibleCount = Math.min(this.size, MAX_ENTRIES);
        const calculatedHeight = visibleCount * itemHeight;

        this.entriesElement.css('height', `${calculatedHeight}px`);
    }


    /**
     * Update the visual display of selected items
     */
    private updateDisplay(): void {
        if (!this.entriesElement) return;

        this.log.info("updateDisplay", this.id);
        let hasSelection = false;

        this.entriesElement.find('.select-entry').each((_, element) => {
            const $element = $(element);
            const index = parseInt($element.attr('data-index') || '0');

            this.log.info("updateDisplay", index, $element.find(".select-text").text(), this.model[index].selected);
            if (this.model[index].selected) {
                $element.addClass('selected');
                hasSelection = true;
            } else {
                $element.removeClass('selected');
            }
        });

        // Toggle no-selection class based on whether any entry is selected
        if (hasSelection) {
            this.selectorElement.removeClass('no-selection');
        } else {
            this.selectorElement.addClass('no-selection');
        }
    }


    // Change handling

    private toggleSelection(entry: IEntry): void {
        if (!this.isActive()) return;
        entry.selected = !entry.selected;
        this.updateDisplay();
        this.notifyChange();
    }

    /**
     * Notify change listeners
     */
    private notifyChange(): void {
        this.changeHandler(this.getSelectedIndexes());
    }

    //
    // Mouse drag selection handlers

    /**
     * Handle mousedown on an entry - start drag selection
     */
    private handleMouseDown(entry: IEntry, index: number): void {
        if (!this.isActive()) return;

        this.isDragging = true;
        // Determine if we're selecting or deselecting based on current state
        this.dragStartSelection = !entry.selected;

        // Toggle the clicked entry
        entry.selected = this.dragStartSelection;
        this.updateDisplay();

        this.log.info("handleMouseDown", index, "selecting:", this.dragStartSelection);
    }

    /**
     * Handle mouse entering an entry during drag
     */
    private handleMouseOver(entry: IEntry, index: number): void {
        if (!this.isActive()) return;

        // Apply the same selection state as the drag start
        entry.selected = this.dragStartSelection;
        this.updateDisplay();

        this.log.info("handleDragOver", index, "selecting:", this.dragStartSelection);
    }


    /**
     * Setup global mouse event handlers for drag selection
     */
    private addHandleMouseLeave(): void {
        // Remove any existing handlers first
        $(document).off(`mouseup.select-${this.id}`);
        $(document).off(`mouseleave.select-${this.id}`);

        // Global mouseup to end dragging
        $(document).on(`mouseup.select-${this.id}`, () => {
            if (this.isDragging) {
                this.log.info("Drag ended");
                this.isDragging = false;
                this.notifyChange();
            }
        });

        // Global mouseleave to end dragging if mouse leaves window
        $(document).on(`mouseleave.select-${this.id}`, () => {
            if (this.isDragging) {
                this.log.info("Drag ended (mouse left window)");
                this.isDragging = false;
                this.notifyChange();
            }
        });
    }


    //
    // Private members - Display Updates

    /**
     * Escape HTML to prevent XSS
     */
    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

} // SelectElement
