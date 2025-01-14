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
import {CoverType} from "@main/model/oft_state";
import {Log} from "@main/utils/log";
import {FocusSpecItemElement} from "@main/view/focus_spec_item_element";
import {Filter, FilterModel} from "@main/model/filter";
import {OftStateController} from "@main/controller/oft_state_controller";
import {
    ChangeEvent,
    ChangeListener,
    FilterChangeEvent,
    FocusChangeEvent,
    SelectionChangeEvent
} from '@main/model/change_event';

const FOCUS_SPECITEM_ELEMENT_ID: string = "#focusitem";
const SPECITEMS_ELEMENT_ID: string = "#specitems";

export class SpecItemsController {
    constructor(private oftStateController: OftStateController,
                private typeFilterModel: Array<FilterModel>) {
        this.specItemsElement = $(SPECITEMS_ELEMENT_ID);
    }

    private log: Log = new Log("SpecItemsController");

    private readonly specItemsElement: JQuery<HTMLElement>;

    private focusSpecItemElement: SpecItemElement | null = null;
    private specItems: Map<number, SpecItem> = new Map<number, SpecItem>();
    private specItemElements: Array<SpecItemElement> = [];
    private specItemToElement: Array<[SpecItem, SpecItemElement]> = new Array<[SpecItem, SpecItemElement]>();

    private filterChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener(event as FilterChangeEvent);
    }

    private focusChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.focusChangeListener(event as FocusChangeEvent);
    }

    private selectionChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.showSpecItem((event as SelectionChangeEvent).index);
    }

    public init(specItems: Array<SpecItem>): void {
        this.log.info("init ", specItems.map((specItem: SpecItem) => specItem.index).join(", "));
        this.oftStateController.addChangeListener(FilterChangeEvent.TYPE, this.filterChangeListenerFacade);
        this.oftStateController.addChangeListener(FocusChangeEvent.TYPE, this.focusChangeListenerFacade);
        this.oftStateController.addChangeListener(SelectionChangeEvent.TYPE, this.selectionChangeListenerFacade);

        specItems.forEach((specItem: SpecItem) => {
            const specItemElement: SpecItemElement = this.createSpecItemElement(specItem);
            this.insertSpecItemAt(specItemElement);
            this.specItemToElement.push([specItem, specItemElement]);
            this.specItems.set(specItem.index, specItem);
            //if (this.specItemToElement.length === 1) specItemElement.select();
        });
    }

    // Initialize Elements

    private createSpecItemElement(specItem: SpecItem): SpecItemElement {
        return new SpecItemElement(
            specItem,
            this.oftStateController,
            this.typeFilterModel
        );
    }

    private createFocusSpecItemElement(specItem: SpecItem, coverType: CoverType): FocusSpecItemElement {
        if (specItem == null) this.log.info("SPECITEM MUST NOT BE NULL")
        return new FocusSpecItemElement(
            specItem,
            coverType,
            this.oftStateController,
            this.typeFilterModel
        );
    }

    private insertSpecItemAt(specItem: SpecItemElement, index: number = -1): void {
        specItem.insertToAt(this.specItemsElement, index);
        this.specItemElements.push(specItem);
    }

    private setFocusSpecItem(specItem: SpecItem | null, coverType: CoverType): void {
        this.log.info("setFocusSpecItem ", specItem);
        if (specItem == null) {
            $(FOCUS_SPECITEM_ELEMENT_ID).hide();
        } else if (this.focusSpecItemElement?.specItem.index != specItem?.index) {
            this.removeFocusSpecItem();
            $(FOCUS_SPECITEM_ELEMENT_ID).show();
            this.focusSpecItemElement = this.createFocusSpecItemElement(specItem, coverType);
            this.focusSpecItemElement.insertToAt($(FOCUS_SPECITEM_ELEMENT_ID), 0);
        }
    }

    private removeFocusSpecItem() {
        if (this.focusSpecItemElement != null) {
            this.focusSpecItemElement.remove();
            this.focusSpecItemElement = null;
        }
    }


    //
    // Change listener

    private focusChangeListener(focusChangeEvent: FocusChangeEvent): void {
        this.log.info("focusChangeListener ", focusChangeEvent);

        // Update focus element
        if (focusChangeEvent.index == null) {
            // Hide focus item

            this.removeFocusSpecItem();
        } else {
            // show Focus item

            const focusedSpecItem: SpecItem = this.specItems.get(focusChangeEvent.index) as SpecItem;
            this.setFocusSpecItem(focusedSpecItem, focusChangeEvent.coverType);
        }

        // Update filtered items
        const selectedFilters: Array<[string, Filter]> = Array.from(focusChangeEvent.selectedFilters);
        const filteredSpecItems: Array<SpecItemElement> =
            SpecItemsController.getSpecItemsMatchingFilters(this.specItemToElement, selectedFilters);

        this.showOnlySelectedSpecItemElements(filteredSpecItems, focusChangeEvent.index);
    }


    //
    // Show items based on filters

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param filterChangeEvent represents the current filter selections
     */
    private filterChangeListener(filterChangeEvent: FilterChangeEvent): void {
        this.log.info("filterChangeListener ", filterChangeEvent);
        const selectedFilters: Array<[string, Filter]> = Array.from(filterChangeEvent.selectedFilters);
        const filteredSpecItems: Array<SpecItemElement> =
            SpecItemsController.getSpecItemsMatchingFilters(this.specItemToElement, selectedFilters);

        this.showOnlySelectedSpecItemElements(filteredSpecItems, filterChangeEvent.selectedIndex);
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
                return SpecItemsController.isMatchingAllFilters(specItem, selectedFilters);
            })
            .map(([_, specItemElement]: [any, SpecItemElement]): SpecItemElement => specItemElement);
    }

    /**
     * @param specItem The SpecItem to validate
     * @param selectedFilters The filters
     * @return true if the specItem matches all filters
     * @private
     */
    private static isMatchingAllFilters(specItem: SpecItem, selectedFilters: Array<[string, Filter]>): boolean {
        return selectedFilters.every(([_, filter]: [string, Filter]): boolean => filter.matches(specItem));
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
                if (specItemElement.specItem.index == selectedIndex) this.oftStateController.unselectItem();
            }
        });
        this.showSpecItem(selectedIndex);
    }

    private showSpecItem(index: number | null): boolean {
        if (index == null || index < 0 || index >= this.specItemElements.length) return false;
        const specItemElement: SpecItemElement = this.specItemElements[index];
        if (!specItemElement.isActive()) return false;

        const scrollTop: number | undefined = this.specItemsElement.scrollTop();
        const visibleHeight: number | undefined = this.specItemsElement.outerHeight();
        if (scrollTop == undefined || visibleHeight == undefined) return false;
        const scrollBottom: number = scrollTop! + visibleHeight!;

        const elementScrollPosition: number = specItemElement.getScrollPosition()!;

        this.log.info("Scrolls", scrollTop, scrollBottom, elementScrollPosition);

        if (elementScrollPosition >= scrollTop && elementScrollPosition <= scrollBottom) return true;

        this.log.info("Scroll to", elementScrollPosition);
        this.specItemsElement.scrollTop(elementScrollPosition);
        return true;

    }

} // SpecItemsElement