/**
 *  FilterWidgets provide the filters in the left drawer.
 */
import {FilterModel} from "../../resources/js/meta_data";
import {Log} from "../utils/log";
import {FilterName, SelectedFilterIndexes} from "../model/oft_state";
import {OftStateController} from "../controller/oft_state_controller";

//
// Public API

export class FilterElement {
    public constructor(
        public readonly id: string,
        selectElement: HTMLElement,
        private oftState: OftStateController,
    ) {
        this.selectElement = $(selectElement);
    }

    public selectionIndexes: Array<number> = [];

    private readonly selectElement: JQuery;
    private readonly log:Log = new Log("FilterElement");


    public init(selectedIndexes: Array<number>): void {
        this.addAllNoneSelector(this.selectElement);
        this.appendFilterValues(this.id, this.selectElement);
        this.initSelections(selectedIndexes, this.selectElement);
        this.deactivate();

        // TODO: Replace
        const filters: Array<FilterModel> = window.metadata[this.id] as Array<FilterModel>;
        if (filters) {
            const total = filters.reduce((sum: number, item: FilterModel) => item.item_count ? sum + item.item_count : 0, 0);
            if (total > 0) {
                this.selectElement.parent().parent().find("._expandable-widget-header span").append(`&nbsp;&nbsp;(${total})`);
            }
        }
    }

    /**
     * Activates the
     */
    public activate(): void {
        this.selectElement.removeAttr("disabled");
        this.selectElement.on('change', () => this.selectionChanged(this.selectElement));
        this.selectElement.trigger("change");
    }

    public deactivate(): void {
        this.selectElement.attr("disabled", "disabled");
        this.selectElement.off('change');
    }

    public isDisabled(): boolean {
        return this.selectElement.attr("disabled") != undefined;
    }


    //
    // Private members

    /**
     * Imports option view for a filter widget from the global filter_config variable.
     *
     * @param {String} id of the expanded widget
     * @param {JQuery} selectElement the select element within the widget
     */
    private appendFilterValues(id: string, selectElement: JQuery): void {
        const filters: Array<FilterModel> = window.metadata[id] ? window.metadata[id] as Array<FilterModel> : [];
        selectElement.prop("size", filters.length);
        filters && filters.forEach((item: FilterModel, index: number) => {
            const color: string = item.color ? `style="color:${item.color}"` : '';
            const count: string = item.item_count ? `&nbsp;&nbsp;(${item.item_count})` : '';
            const id: string = FilterElement.toSelectionId(this.id, index);
            selectElement.append(`<option id="${id}" ${color}>${item.name}${count}</option>`);
        });
    }

    /**
     * Add a select all and a select none button above a select element.
     *
     * @param {JQuery} selectElement The select element
     */
    private addAllNoneSelector(selectElement: JQuery): void {
        const buttonBar: JQuery = selectElement.parent().parent().find("._expandable-widget-header");
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
     * Selects all options of a select element.
     *
     * @param {Array<number>} selectedIndexes List of selected entry indexes
     * @param {JQuery} selectElement The select element
     */
    private initSelections(selectedIndexes: Array<number>, selectElement: JQuery): void {
        selectElement.attr('multiple', "true");
        this.log.info("initSlection ", this.id, " ", selectedIndexes);
        selectElement.children("option").each((index: number, element: HTMLElement) => {
            $(element).prop("selected", selectedIndexes.includes(index));
        });
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

    private toSelectionIndexes(selectElement: JQuery): Array<number> {
        return selectElement
            .find('option:selected')
            .map((_, option: HTMLElement): number => FilterElement.toSelectionIndex(option)
            ).toArray();
    }

    private static toSelectionId(id: string, index: number): string {
        return `${id}_${index}`;
    }

    private static toSelectionIndex(element: HTMLElement): number {
        return parseInt(element.id.replace(/^[A-Za-z0-9]+_/, ''));
    }

} // FilterElement