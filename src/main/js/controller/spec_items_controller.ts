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
import {SpecItemElement} from '@main/view/spec_item_element';
import {SpecItem} from "@main/model/specitems";
import {CoverType, OftState} from "@main/model/oft_state";
import {Log} from "@main/utils/log";
import {FocusSpecItemElement} from "@main/view/focus_spec_item_element";
import {Filter, isMatchingAllFilters} from "@main/model/filter";
import {OftStateController} from "@main/controller/oft_state_controller";
import {ChangeEvent, ChangeListener, EventType,} from '@main/model/change_event';
import {SpecItemsElement} from "@main/view/spec_items_element";
import {Project} from "@main/model/project";

const FOCUS_SPECITEM_ELEMENT_ID: string = "#focusitem";
const SPECITEMS_ELEMENT_ID: string = "#specitems";

export class SpecItemsController {
    constructor(private oftStateController: OftStateController,
                private specItemsElement: SpecItemsElement,
                private project: Project) {
        this._specItemsElement = $(SPECITEMS_ELEMENT_ID);
    }

    private log: Log = new Log("SpecItemsController");

    private readonly _specItemsElement: JQuery<HTMLElement>;

    private focusSpecItemElement: FocusSpecItemElement | null = null;
    private selectedIndex: number | null = null;
    private focusIndex: number | null = null;
    private specItems: Map<number, SpecItem> = new Map<number, SpecItem>();
    private specItemElements: Array<SpecItemElement> = [];
    private specItemToElement: Array<[SpecItem, SpecItemElement]> = new Array<[SpecItem, SpecItemElement]>();

    private stateChangeListener: ChangeListener = (event: ChangeEvent): void => {
        event.handleFocusChange((focusIndex, coverType, _) => this.focusChange(focusIndex, coverType));
        event.handleSelectionChange((selectedIndex) => this.selectSpecItem(selectedIndex));
        event.handleFilterChange((filters, oftState) => this.filterChange(filters, oftState));
        event.handleSelectionChange((selectedIndex) => this.scrollToSpecItem(selectedIndex));
    }

    public init(specItems: Array<SpecItem>): void {
        this.log.info("init specitemCount", specItems.length);
        this.oftStateController.addChangeListener(this.stateChangeListener, EventType.Focus, EventType.Filters, EventType.Selection);

        specItems.forEach((specItem: SpecItem) => {
            const specItemElement: SpecItemElement = this.createSpecItemElement(specItem);
            this.insertSpecItemAt(specItemElement);
            this.specItemToElement.push([specItem, specItemElement]);
            this.specItems.set(specItem.index, specItem);
        });
    }

    // Initialize Elements

    private createSpecItemElement(specItem: SpecItem): SpecItemElement {
        return new SpecItemElement(
            specItem,
            this.oftStateController,
            this.project
        );
    }

    private createFocusSpecItemElement(specItem: SpecItem, coverType: CoverType): FocusSpecItemElement {
        if (specItem == null) this.log.info("SPECITEM MUST NOT BE NULL")
        this.log.info("createFocusSpecItemElement index", specItem.index, "coverType", coverType);
        return new FocusSpecItemElement(
            specItem,
            coverType,
            this.oftStateController,
            this.project
        );
    }

    private insertSpecItemAt(specItem: SpecItemElement, index: number = -1): void {
        specItem.insertToAt(this._specItemsElement, index);
        specItem.activate();
        this.specItemElements.push(specItem);
    }


    //
    // Change listeners

    /**
     * Adapt the focused item.
     *
     * @param focusIndex focused item index or null for disabling
     * @param coverType the coverType of the focused element
     */
    private focusChange(focusIndex: number | null, coverType: CoverType): void {
        this.log.info("focusChange index", focusIndex, "coverType", coverType);

        if (focusIndex == null) {
            this.removeFocusSpecItem();
        } else if (this.focusIndex == null) {
            this.activateFocusSpecItem(focusIndex, coverType);
        } else if (this.focusIndex != focusIndex) {
            this.changeFocusedSpecItem(focusIndex, coverType);
        } else if (this.focusIndex == focusIndex) {
            this.switchFocusedCoverageType(focusIndex, coverType);
        }
    }

    private removeFocusSpecItem(): void {
        this.log.info("removeFocusSpecItem");
        if (this.focusSpecItemElement != null) {
            this.focusSpecItemElement.remove();
            this.focusSpecItemElement = null;
        }
        this.focusIndex = null;
        $(FOCUS_SPECITEM_ELEMENT_ID).hide();
    }

    /**
     * Makes a focused item visible of no item is focused yet.
     *
     * @param focusIndex The index of the new item
     * @param coverType The type to activate
     */
    private activateFocusSpecItem(focusIndex: number, coverType: CoverType): void {
        if (this.focusSpecItemElement != null) return;
        this.log.info("activateFocusSpecItem index", focusIndex, "coverType", coverType);
        this.focusIndex = focusIndex;
        const specItem: SpecItem = this.specItems.get(focusIndex) as SpecItem;
        this.focusSpecItemElement = this.createFocusSpecItemElement(specItem, coverType);
        this.focusSpecItemElement.insertToAt($(FOCUS_SPECITEM_ELEMENT_ID), 0);
        this.focusSpecItemElement.activate();
        $(FOCUS_SPECITEM_ELEMENT_ID).show();
    }

    /**
     * If already a focused specItem is active replace it with this one.
     *
     * @param focusIndex the new item
     * @param coverType the coverageType to apply
     */
    private changeFocusedSpecItem(focusIndex: number, coverType: CoverType): void {
        if (focusIndex == this.focusIndex || this.focusSpecItemElement == null) return;
        this.log.info("changeFocusedSpecItem index", focusIndex, "coverType", coverType);
        this.focusIndex = focusIndex;
        const specItem: SpecItem = this.specItems.get(focusIndex) as SpecItem;
        this.focusSpecItemElement.remove();
        this.focusSpecItemElement = this.createFocusSpecItemElement(specItem, coverType);
        this.focusSpecItemElement.insertToAt($(FOCUS_SPECITEM_ELEMENT_ID), 0);
        this.focusSpecItemElement.activate();
        $(FOCUS_SPECITEM_ELEMENT_ID).show();
    }

    private switchFocusedCoverageType(focusIndex: number, coverType: CoverType): void {
        if (focusIndex != this.focusIndex) return;
        this.log.info("switchFocusedCoverageType", coverType);
        this.focusSpecItemElement?.cover(coverType);
    }


    //
    // Show items based on filters

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param filterChanged the currently active filters
     * @param oftState changed [{@}link ]OftState}
     */
    private filterChange(filterChanged: Map<string, Filter>, oftState: OftState): void {
        this.log.info("filterChange", filterChanged);
        const selectedFilters: Array<[string, Filter]> = Array.from(filterChanged);
        const filteredSpecItems: Array<SpecItemElement> =
            SpecItemsController.getSpecItemsMatchingFilters(this.specItemToElement, selectedFilters);

        this.showOnlySelectedSpecItemElements(filteredSpecItems, oftState.selectedIndex);
    }


    /**
     * Filters SpecItem from the list of all SpecItems that match all filters.
     *
     * @param specItemToElement 1:1 mapping of SpecItem to SpecItemElement
     * @param selectedFilters active filters
     */
    private static getSpecItemsMatchingFilters(specItemToElement: Array<[SpecItem, SpecItemElement]>,
                                               selectedFilters: Array<[string, Filter]>): Array<SpecItemElement> {

        return specItemToElement
            .filter(([specItem, _]: [SpecItem, any]) => {
                return isMatchingAllFilters(specItem, selectedFilters);
            })
            .map(([_, specItemElement]: [any, SpecItemElement]): SpecItemElement => specItemElement);
    }

    /**
     * Shows selected SpecItemElements and hides the others.
     *
     * IF the selected specItem is hidden then an {@link unselectItem} is sent.
     *
     * @param specItemElements The specItems to show
     * @param selectedIndex Index of the SpecItem that currently has the selection or null if none has the sepecItem
     */
    private showOnlySelectedSpecItemElements(specItemElements: Array<SpecItemElement>, selectedIndex: number | null): void {
        this.specItemElements.forEach((specItemElement: SpecItemElement) => {

            if (specItemElements.includes(specItemElement)) {
                specItemElement.activate();
            } else {
                specItemElement.deactivate();
                if (specItemElement.specItem.index == selectedIndex && specItemElement.specItem.index != this.focusIndex) {
                    this.oftStateController.unselectItem();
                }
            }
        });
        this.specItemsElement.updateNumberOfItems(specItemElements.length);
        this.specItemsElement.updateCoveragePercentage(this.calculateCoveragePercentage(specItemElements));
        this.specItemsElement.setFocusVisibility(this.focusSpecItemElement != null);
    }

    /**
     * Calculate the coverage percentage of the given spec items.
     *
     * @param specItemElements The items
     * @return coverage percentage 0-100
     * @private
     */
    private calculateCoveragePercentage(specItemElements: Array<SpecItemElement>): number {
        const coveredNumberOfSpecItems = specItemElements.filter((specItemElement: SpecItemElement) =>
            specItemElement.specItem.uncovered.length === 0
        ).length;
        return specItemElements.length > 0
            ? Math.round((coveredNumberOfSpecItems / specItemElements.length) * 100)
            : 0;
    }

    /**
     * Changes the selection to the given index or unselect if index = null.
     *
     * notify an unselect if new indexed item is deactivated (by filter).
     *
     * @param index the new index or null
     * @private
     */
    private selectSpecItem(index: number | null) {
        this.log.info("selectItem", index, "replaces", this.selectedIndex, "focus", this.focusIndex);

        // unselect current selection
        if (index != this.selectedIndex) this.getSpecItemElementByIndex(this.selectedIndex)?.unselect();

        // select requested selection
        this.selectedIndex = index;
        if (this.focusIndex != null) this.specItemElements[this.focusIndex].unselect();
        this.getSpecItemElementByIndex(index)?.activate();
        this.getSpecItemElementByIndex(index)?.select();
    }

    private getSpecItemElementByIndex(index: number | null): SpecItemElement | null {
        if (index == null) return null;
        if (index == this.focusIndex) return this.focusSpecItemElement;
        return this.specItemElements[index];
    }

    private scrollToSpecItem(index: number | null): boolean {
        this.log.info("scrollToSpecItem", index);
        if (index == null || index < 0 || index >= this.specItemElements.length) return false;
        const specItemElement: SpecItemElement = this.specItemElements[index];
        if (!specItemElement.isActive()) return false;

        const scrollTop: number | undefined = this._specItemsElement.scrollTop();
        const visibleHeight: number | undefined = this._specItemsElement.outerHeight();
        if (scrollTop == undefined || visibleHeight == undefined) return false;
        const scrollBottom: number = scrollTop! + visibleHeight!;

        const elementScrollPosition: number = specItemElement.getScrollPosition()!;

        this.log.info("Scrolls", scrollTop, scrollBottom, elementScrollPosition);

        if (elementScrollPosition >= scrollTop && elementScrollPosition <= scrollBottom) return true;

        this.log.info("Scroll to", elementScrollPosition);
        this._specItemsElement.scrollTop(elementScrollPosition);
        return true;
    }

} // SpecItemsElement
