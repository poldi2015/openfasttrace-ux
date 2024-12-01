/**
 *  FilterWidgets provide the filters in the left drawer.
 */
import {FilterModel} from "../../resources/js/meta_data";

//
// Public API

export class FilterElement {
    private constructor(
        public readonly id: string,
        widget: HTMLElement,
    ) {
        this.widget = $(widget);
    }

    private readonly widget: JQuery;

    /**
     * Initialize all filter widget marked with class .widget-filter.
     */
    public static init() {
        let filterElements: Array<FilterElement> = [];
        $(".widget-filter").each(function (_, element) {
            let id: string | undefined = element?.parentElement?.parentElement?.id
            const filterElement: FilterElement = new FilterElement(id ? id : "", this);
            filterElement.initFilter();
            filterElements.push(filterElement);
        });
        return filterElements;
    }

    //
    // Private members

    private initFilter() {
        this.widget.on('change', () => this.selectionChanged(this.widget));
        this.addAllNoneSelector(this.widget);
        this.appendFilterValues(this.id, this.widget);
        this.selectAll(this.widget);
        this.selectionChanged(this.widget);

        const filters: Array<FilterModel> = window.metadata[this.id] as Array<FilterModel>;
        if (filters) {
            const total = filters.reduce((sum: number, item: FilterModel) => item.item_count ? sum + item.item_count : 0, 0);
            if (total > 0) {
                this.widget.parent().parent().find("._expandable-widget-header span").append(`&nbsp;&nbsp;(${total})`);
            }
        }
    }

    /**
     * Imports option view for a filter widget from the global filter_config variable.
     *
     * @param {String} id of the expanded widget
     * @param {JQuery} selectElement the select element within the widget
     */
    private appendFilterValues(id: string, selectElement: JQuery): void {
        const filters: Array<FilterModel> = window.metadata[id] as Array<FilterModel>;
        selectElement.prop("size",filters.length);
        filters && filters.forEach((item: FilterModel, index: number) => {
            const color = item.color ? `style="color:${item.color}"` : '';
            const count = item.item_count ? `&nbsp;&nbsp;(${item.item_count})` : '';
            selectElement.append(`<option id="${id}_${index}" ${color}>${item.name}${count}</option>`);
        });
    }

    /**
     * Adds a listener to the select element that updates the list of selected entries.
     *
     * @param {JQuery} selectElement th select element
     */
    private selectionChanged(selectElement: JQuery): void {
        this.widget.find('option:selected').each(function (_, option) {
            //filterSelection.add(option.id);
        });
        this.widget.find('option:not(:selected)').each(function (_, option) {
            //filterSelection.delete(option.id);
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
                <a href="#"">None</a>
            </div>
        `);
        const buttons: JQuery = buttonBar.find('div.widget-filter-buttons > a');
        buttons.first().on("click", () => this.selectAllOrNone(true));
        buttons.eq(1).on("click", () => this.selectAllOrNone(false));
    }

    /**
     * Selects all options of a select element.
     *
     * @param {Object} selectElement The select element
     */
    private selectAll(selectElement: JQuery): void {
        selectElement.attr('multiple', "true");
        selectElement.children("option").each(function () {
            $(this).prop("selected", "true");
        });
    }

    /**
     * Select or deselect all options within a widget.
     *
     * @param {boolean} select true to select option false to deselect
     */
    private selectAllOrNone(select: boolean): void {
        this.widget.children("option").each(function () {
            $(this).prop("selected", select);
        });
        this.selectionChanged(this.widget);
    }

} // FilterElement