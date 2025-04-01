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
import {FilterName, SelectedFilterIndexes} from "@main/model/oft_state";
import {OftStateController} from "@main/controller/oft_state_controller";
import {sameArrayValues} from "@main/utils/collections";
import {Filter, SelectionFilter} from "@main/model/filter";
import {NavbarElement} from "@main/view/navbar_element";
import {IElement} from "@main/view/element";
import {ChangeEvent, ChangeListener, EventType} from "@main/model/change_event";
import {IField} from "@main/model/project";

/**
 * A FilterElement represents one filter type element in the UI.
 *
 * FilterElements are instantiated by {@link FiltersElement} based on the HTML model.
 */
export interface IFilterElement extends IElement {
}

export class FilterElementFactory {
    public build(id: string, selectElement: HTMLElement, filterModel: Array<IField>, oftState: OftStateController): IFilterElement {
        return new FilterElement(id, selectElement, filterModel, oftState);
    }
}

/**
 * Maximum number of filter elements to be shown in the UI.
 */
const MAX_FILTER_ELEMENT = 8;

/**
 *  FilterElement provide one of the filter list in a side drawer.
 *
 *  The filter is configured by a {@link IField} that is part of the global metadata.
 *
 *  State changes are communicated via the {@link OftStateController}. The FilterElement issues changes to the filter
 *  selection via {@link OftStateController.selectFilters}. By listening to filter change events
 *  it reacts to changes to the filters issued by other components.
 */
export class FilterElement implements IFilterElement {
    public constructor(
        public readonly id: string,
        selectElement: HTMLElement,
        private readonly filterModel: Array<IField>,
        private readonly oftState: OftStateController
    ) {
        this.selectElement = $(selectElement);
    }

    /**
     * selected options, gets updated when option is selected via the UI or via the oftState sending a filterChange event.
     */
    private selectionIndexes: Array<number> = [];

    /**
     * The select element of the filter element.
     */
    private readonly selectElement: JQuery;

    private navbarElement: NavbarElement | undefined = undefined;

    private readonly log: Log = new Log("FilterElement");

    private filtersChangeListener: ChangeListener = (event: ChangeEvent): void => {
        event.handleFilterChange((filters, _) => this.filtersChanged(filters));
    }

    /**
     * Builds the filter UI.
     */
    public init(): IFilterElement {
        this.selectElement.attr('multiple', "true");
        this.addAllNoneSelector();
        this.appendFilterValues();
        this.deactivate();
        return this;
    }

    /**
     * Enable the filter element, ready to be used in the UI.
     */
    public activate(): void {
        this.selectElement.removeAttr("disabled");
        this.selectElement.on('change', () => this.notifySelectionChanged(this.selectElement));
        this.oftState.addChangeListener(this.filtersChangeListener, EventType.Filters);
        this.navbarElement?.activate();
    }

    /**
     * Deactivates the filter element, making it unavailable in the UI.
     */
    public deactivate(): void {
        this.navbarElement?.deactivate();
        this.selectElement.attr("disabled", "disabled");
        this.selectElement.off('change');
        this.oftState.removeChangeListener(this.filtersChangeListener);
    }

    /**
     * Query of the UI is active.
     */
    public isActive(): boolean {
        return this.selectElement.attr("disabled") != undefined;
    }


    //
    // Private members

    // Init UI

    /**
     * Imports option view for a filter element from the global filter_config variable.
     */
    private appendFilterValues(): void {
        this.selectElement.prop("size", Math.min(this.filterModel.length, MAX_FILTER_ELEMENT));
        this.filterModel.forEach((item: IField, index: number) => {
            const color: string = item.color ? `style="color:${item.color}"` : '';
            const count: string = item.item_count >= 0 ? `&nbsp;&nbsp;(${item.item_count})` : '';
            const id: string = FilterElement.toSelectionId(this.id, index);
            this.selectElement.append(`<option id="${id}" ${color}>${item.name}${count}</option>`);
        });
        this.toggleOff(true);
    }

    /**
     * Add a select all and a select off button above a select element.
     */
    private addAllNoneSelector(): void {
        const buttonBar: JQuery = this.selectElement.parent().parent().find("._expandable-header");
        buttonBar.append(`
            <div class="nav-bar _filter-nav-bar">
                <a id="${this.id}-btn-all" class="nav-btn _img-filter-all" href="#" ></a>
                <a id="${this.id}-btn-off" class="nav-btn nav-btn-activator _img-filter-off nav-btn-on" href="#"></a>
            </div>
        `);
        this.navbarElement = new NavbarElement(buttonBar);
        this.navbarElement.setChangeListener(`${this.id}-btn-all`, () => this.selectAll());
        this.navbarElement.setChangeListener(`${this.id}-btn-off`, () => this.selectOff());
        this.navbarElement.init();
    }


    // UI Event Handler

    /**
     * Select or deselect all options within a element.
     */
    private selectAll(): void {
        this.selectElement.children("option").each((_, element: HTMLElement) => {
            $(element).prop("selected", true);
        });
        this.selectElement.trigger("change");
    }

    /**
     * Sets all items unselected and shows the items of disabled.
     */
    private selectOff(): void {
        this.selectElement.children("option").each((_, element: HTMLElement) => {
            $(element).prop("selected", false);
        });
        this.selectElement.trigger("change");
    }


    /**
     * Listener that reports changed selection to oftState.
     *
     * @param {JQuery} selectElement th select element
     */
    private notifySelectionChanged(selectElement: JQuery): void {
        this.log.info("selectionChanged", this.id, " ", this.toSelectionIndexes(selectElement));
        const filters: Map<FilterName, Filter> = new Map([[this.id, new SelectionFilter(this.id, this.toSelectionIndexes(selectElement))]]);
        this.oftState.selectFilters(filters);
    }

    /**
     * Extracts the selected indexes from a select option elements.
     *
     * @param {JQuery} selectElement th select element of the options
     */
    private toSelectionIndexes(selectElement: JQuery): Array<number> {
        return selectElement
            .find('option:selected')
            .map((_, option: HTMLElement): number => FilterElement.toSelectionIndex(option)
            ).toArray();
    }

    /**
     * Generates an element id for on option based in the id (index) of the filter entry.
     *
     * @param id of the filter
     * @param index index of the filter entry
     */
    private static toSelectionId(id: string, index: number): string {
        return `${id}_${index}`;
    }

    /**
     * Extracts the index out of the id of an option element
     *
     * @param element the option element
     */
    private static toSelectionIndex(element: HTMLElement): number {
        return parseInt(element.id.replace(/^[A-Za-z0-9]+_/, ''));
    }


    // State change handling

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param selectedFilters filters to be selected (includes the selection of all filters not only this one)
     */
    private filtersChanged(selectedFilters: Map<FilterName, Filter>): void {
        this.log.info("filtersChanged index=", this.id, "filters", selectedFilters);
        const changedSelectionIndexes: SelectedFilterIndexes = this.getSelectionIndexes(selectedFilters.get(this.id));
        this.setSelections(changedSelectionIndexes);
    }

    /**
     * Adapt the UI based on the selected indexes.
     *
     * Called when receiving a filterChangeEvent or a focusChangeEvent.
     *
     * @param {Array<number>} changedIndexed List of selected entry indexes
     */
    private setSelections(changedIndexed: Array<number>): void {
        this.log.info("setSelections for", this.id, "changedIndexes", changedIndexed, "hasChanges", sameArrayValues(this.selectionIndexes, changedIndexed));
        // Prevent OftState events received by change to the UI
        if (sameArrayValues(this.selectionIndexes, changedIndexed)) return;
        this.selectionIndexes = changedIndexed;
        this.selectElement.children("option").each((index: number, element: HTMLElement) => {
            $(element).prop("selected", changedIndexed.includes(index));
        });
        this.toggleOff(changedIndexed.length == 0);
    }

    /**
     * Toggles of the items are shown as being off or not.
     *
     * @param off true to set the items off
     */
    private toggleOff(off: boolean): void {
        this.selectElement.children("option").each((_, element: HTMLElement) => {
            if (off) {
                $(element).addClass("_filter-item-off");
            } else {
                $(element).removeClass("_filter-item-off");
            }
        });
        this.navbarElement?.getButton(`${this.id}-btn-off`)?.toggle(off);
    }

    private getSelectionIndexes(filter: Filter | undefined): SelectedFilterIndexes {
        if (filter == undefined || !(filter instanceof SelectionFilter)) return [];
        return (filter as SelectionFilter).filterIndexes;
    }

} // FilterElement