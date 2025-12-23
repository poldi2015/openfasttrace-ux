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
import {FieldFilter, Filter} from "@main/model/filter";
import {NavbarElement} from "@main/view/navbar_element";
import {IElement} from "@main/view/element";
import {ChangeEvent, ChangeListener, EventType} from "@main/model/change_event";
import {FieldModel, IField} from "@main/model/project";
import {IEntry, SelectElement} from "@main/view/select_element";

/**
 * A FilterElement represents one filter type element in the UI.
 *
 * FilterElements are instantiated by {@link FiltersElement} based on the HTML model.
 */
export interface IFilterElement extends IElement {
}

export class FilterElementFactory {
    public build(id: string, containerElement: HTMLElement, filterModel: FieldModel, oftState: OftStateController): IFilterElement {
        return new FilterElement(id, containerElement, filterModel, oftState);
    }
}

/**
 * Maximum number of filter elements to be shown in the UI.
 */
const MAX_FILTER_ELEMENT = 12;

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
        containerElement: HTMLElement,
        private readonly filterModel: FieldModel,
        private readonly oftState: OftStateController
    ) {
        this.containerElement = $(containerElement);
        // Create model from filterModel
        this.elementModel = this.filterModel.fields.map((field: IField): IEntry => ({
            text: field.name ?? field.id,
            count: field.item_count,
            selected: false
        }));
        // Create SelectElement with model
        this.selectElement = new SelectElement(
            this.id,
            this.elementModel,
            Math.min(this.filterModel.fields.length, MAX_FILTER_ELEMENT),
            (selectedIndexes: number[]) => this.handleSelectionChange(selectedIndexes),
            this.containerElement
        );
    }

    /**
     * selected options, gets updated when option is selected via the UI or via the oftState sending a filterChange event.
     */
    private selectionIndexes: Array<number> = [];

    /**
     * The container element for the filter.
     */
    private readonly containerElement: JQuery;

    /**
     * The SelectElement instance
     */
    public readonly selectElement: SelectElement;

    /**
     * The model for the select element
     */
    private readonly elementModel: Array<IEntry>;

    private navbarElement: NavbarElement | undefined = undefined;

    private readonly log: Log = new Log("FilterElement");

    private filtersChangeListener: ChangeListener = (event: ChangeEvent): void => {
        event.handleFilterChange((filters, _) => this.filtersChanged(filters));
    }

    /**
     * Builds the filter UI.
     */
    public init(): IFilterElement {
        this.selectElement.init();
        this.addAllNoneSelector();
        this.deactivate();
        return this;
    }

    /**
     * Enable the filter element, ready to be used in the UI.
     */
    public activate(): void {
        this.selectElement.activate();
        this.oftState.addChangeListener(this.filtersChangeListener, EventType.Filters);
        this.navbarElement?.activate();
    }

    /**
     * Deactivates the filter element, making it unavailable in the UI.
     */
    public deactivate(): void {
        this.navbarElement?.deactivate();
        this.selectElement.deactivate();
        this.oftState.removeChangeListener(this.filtersChangeListener);
    }

    /**
     * Query of the UI is active.
     */
    public isActive(): boolean {
        return this.selectElement.isActive();
    }


    //
    // Private members

    // Init UI

    /**
     * Add a select all and a select off button above a select element.
     */
    private addAllNoneSelector(): void {
        const buttonBar: JQuery = this.containerElement.parent().parent().find("._expandable-header");
        buttonBar.append(`
            <div class="nav-bar _filter-nav-bar">
                <a id="${this.id}-btn-all" class="nav-btn _img-filter-all" href="#" tabindex="-1"></a>
                <a id="${this.id}-btn-off" class="nav-btn nav-btn-activator _img-filter-off nav-btn-on" href="#" tabindex="-1"></a>
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
        this.selectElement.selectAll();
    }

    /**
     * Sets all items unselected and shows the items of disabled.
     */
    private selectOff(): void {
        this.log.info("selectOff", this.id);
        this.selectElement.selectNone();
    }

    /**
     * Handler for selection changes from SelectElement
     */
    private handleSelectionChange(selectedIndexes: number[]): void {
        this.log.info("handleSelectionChange", this.id, " ", selectedIndexes);
        const filters: Map<FilterName, Filter> = new Map([[this.id, this.filterModel.createFilter(selectedIndexes)]]);
        this.oftState.selectFilters(filters);
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
        const changedSelectionIndexes: SelectedFilterIndexes | undefined = this.getSelectionIndexes(selectedFilters.get(this.id));
        this.setSelections(changedSelectionIndexes != undefined ? changedSelectionIndexes : []);
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

        // Update model selection state
        this.elementModel.forEach((entry: IEntry, index: number) => {
            entry.selected = changedIndexed.includes(index);
        });

        // Update SelectElement display
        this.selectElement.updateSelection();
        this.toggleOff(changedIndexed.length == 0);
    }

    /**
     * Toggles of the items are shown as being off or not.
     *
     * @param off true to set the items off
     */
    private toggleOff(off: boolean): void {
        this.navbarElement?.getButton(`${this.id}-btn-off`)?.toggle(off);
    }

    private getSelectionIndexes(filter: Filter | undefined): SelectedFilterIndexes | undefined {
        if (filter == undefined || !(filter instanceof FieldFilter)) return undefined;
        return (filter as FieldFilter).fieldIndexes;
    }

} // FilterElement