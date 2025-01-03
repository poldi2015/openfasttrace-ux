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
import {
    ChangeEvent,
    ChangeListener,
    FilterChangeEvent,
    FocusChangeEvent,
    OftStateController
} from "@main/controller/oft_state_controller";
import {sameArrayValues} from "@main/utils/collections";
import {FilterModel} from "@main/model/filter";

/**
 *  FilterElement provide one of the filter list in a side drawer.
 *
 *  The filter is configured by a {@link FilterModel} that is part of the global metadata.
 *
 *  State changes are communicated via the {@link OftStateController}. The FilterElement issues changes to the filter
 *  selection via {@link OftStateController.selectFilters}. By listening to {@link FilterChangeEvent} and {@link FocusChangeEvent}
 *  it reacts to changes to the filters issued by other components.
 */
export class FilterElement {
    public constructor(
        public readonly id: string,
        selectElement: HTMLElement,
        private readonly filterModel: Array<FilterModel>,
        private readonly oftState: OftStateController
    ) {
        this.selectElement = $(selectElement);
    }

    /**
     * selected options, gets updated when option is selected via the UI or via the oftState sending a filterChange event.
     */
    public selectionIndexes: Array<number> = [];

    /**
     * The select element of the filter widget.
     */
    private readonly selectElement: JQuery;

    private readonly log: Log = new Log("FilterElement");

    private filterChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener((event as FilterChangeEvent).selectedFilters);
    }

    private focusChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener((event as FocusChangeEvent).selectedFilters);
    }

    /**
     * Initialize the filter widget.
     *
     * @param selectedIndexes List of selectable filter indexes
     */
    public init(selectedIndexes: Array<number>): void {
        this.addAllNoneSelector();
        this.appendFilterValues();
        this.setSelections(selectedIndexes);
        this.deactivate();

        // TODO: Replace
        /*
        const filters: Array<FilterModel> = filterModel;
        if (filters) {
            const total = filters.reduce((sum: number, item: FilterModel) => item.item_count ? sum + item.item_count : 0, 0);
            if (total > 0) {
                this.selectElement.parent().parent().find("._expandable-widget-header span").append(`&nbsp;&nbsp;(${total})`);
            }
        }
         */
    }

    /**
     * Enable the filter widget, ready to be used in the UI.
     */
    public activate(): void {
        this.selectElement.removeAttr("disabled");
        this.selectElement.on('change', () => this.selectionChanged(this.selectElement));
        this.oftState.addChangeListener(FilterChangeEvent.TYPE, this.filterChangeListenerFacade);
        this.oftState.addChangeListener(FocusChangeEvent.TYPE, this.focusChangeListenerFacade);
        this.selectElement.trigger("change");
    }

    /**
     * Deactivates the filter widget, making it unavailable in the UI.
     */
    public deactivate(): void {
        this.selectElement.attr("disabled", "disabled");
        this.selectElement.off('change');
        this.oftState.removeChangeListener(this.filterChangeListenerFacade);
        this.oftState.removeChangeListener(this.focusChangeListenerFacade);
    }

    /**
     * Query of the UI is active.
     */
    public isDisabled(): boolean {
        return this.selectElement.attr("disabled") != undefined;
    }


    //
    // Private members

    /**
     * Imports option view for a filter widget from the global filter_config variable.
     */
    private appendFilterValues(): void {
        this.selectElement.prop("size", this.filterModel.length);
        this.filterModel.forEach((item: FilterModel, index: number) => {
            const color: string = item.color ? `style="color:${item.color}"` : '';
            const count: string = item.item_count ? `&nbsp;&nbsp;(${item.item_count})` : '';
            const id: string = FilterElement.toSelectionId(this.id, index);
            this.selectElement.append(`<option id="${id}" ${color}>${item.name}${count}</option>`);
        });
    }

    /**
     * Add a select all and a select off button above a select element.
     */
    private addAllNoneSelector(): void {
        const buttonBar: JQuery = this.selectElement.parent().parent().find("._expandable-widget-header");
        buttonBar.append(`
            <div class="widget-filter-buttons">
                <a href="#">All</a>
                <a href="#"">Off</a>
            </div>
        `);
        const buttons: JQuery = buttonBar.find('div.widget-filter-buttons > a');
        buttons.first().on("click", () => this.selectAll());
        buttons.eq(1).on("click", () => this.selectOff());
    }

    /**
     * Adapt the UI based on the selected indexes.
     *
     * Called when receiving a filterChangeEvent or a focusChangeEvent.
     *
     * @param {Array<number>} selectedIndexes List of selected entry indexes
     */
    private setSelections(selectedIndexes: Array<number>): void {
        this.selectionIndexes = selectedIndexes;
        this.selectElement.attr('multiple', "true");
        this.log.info("initSelection ", this.id, " ", selectedIndexes);
        this.selectElement.children("option").each((index: number, element: HTMLElement) => {
            $(element).prop("selected", selectedIndexes.includes(index));
        });
        this.toggleOff(selectedIndexes.length == 0);
        this.selectElement.trigger("change");
    }

    /**
     * Select or deselect all options within a widget.
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
     * Toggles of the items are shown as being off or not.
     *
     * @param off true to set the items off
     */
    private toggleOff(off: boolean): void {
        this.selectElement.children("option").each((_, element: HTMLElement) => {
            if (off) {
                $(element).addClass("filter-item-off");
            } else {
                $(element).removeClass("filter-item-off");
            }
        });
    }

    /**
     * Listener that reports changed selection to oftState.
     *
     * @param {JQuery} selectElement th select element
     */
    private selectionChanged(selectElement: JQuery): void {
        this.log.info("selectionChanged ", this.id, " ", this.selectionIndexes);
        this.selectionIndexes = this.toSelectionIndexes(selectElement);
        this.toggleOff(this.selectionIndexes.length == 0);
        const filters: Map<FilterName, SelectedFilterIndexes> = new Map([[this.id, this.selectionIndexes]]);
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

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param selectedFilters filters to be selected (includes the selection of all filters not only this one)
     */
    private filterChangeListener(selectedFilters: Map<FilterName, SelectedFilterIndexes>): void {
        this.log.info("filterChangeListener ", selectedFilters);
        const changedSelectionIndexes: SelectedFilterIndexes = selectedFilters.get(this.id) ?? [];
        if (sameArrayValues(this.selectionIndexes, changedSelectionIndexes)) return;
        this.log.info("changedSelectionIndexes ", changedSelectionIndexes);
        this.setSelections(changedSelectionIndexes);
    }

} // FilterElement