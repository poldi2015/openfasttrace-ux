/**
 *  FilterWidgets provide the filters in the left drawer.
 */


//
// Public API

export let filterSelection = new Set();


/**
 * Initialize all filter widget marked with class .widget-filter.
 */
export function init() {
    $(".widget-filter").each(function () {
        const selectElement = $(this);
        const id = selectElement.parent().parent().attr('id');

        selectElement.on('change', () => selectionChanged(selectElement));
        addAllNoneSelector(selectElement);
        appendFilterValues(id, selectElement);
        selectAll(selectElement);
        selectionChanged(selectElement);

        if (filterModel[id]) {
            const total = filterModel[id].reduce((sum, item) => item.item_count ? sum + item.item_count : 0, 0);
            if (total > 0) {
                selectElement.parent().parent().find("._expandable-widget-header span").append(`&nbsp;&nbsp;(${total})`);
            }
        }
    });
}


//
// Private members

/**
 * Imports option elements for a filter widget from the global filter_config variable.
 *
 * @param {String} id of the expanded widget
 * @param {*} selectElement the select element within the widget
 */
function appendFilterValues(id, selectElement) {
    const items = filterModel[id];
    items && items.forEach((item, index) => {
        const color = item.color ? `style="color:${item.color}"` : '';
        const count = item.item_count ? `&nbsp;&nbsp;(${item.item_count})` : '';
        selectElement.append(`<option id="${id}_${index}" ${color}>${item.name}${count}</option>`);
    });
}

/**
 * Adds a listener to the select element that updates the list of selected entries.
 *
 * @param {*} selectElement th select element
 */
function selectionChanged(selectElement) {
    selectElement.find('option:selected').each(function () {
        filterSelection.add(this.id);
    });
    selectElement.find('option:not(:selected)').each(function () {
        filterSelection.delete(this.id);
    });
}

/**
 * Add a select all and a select none button above a select element.
 *
 * @param {*} selectElement The select element
 */
function addAllNoneSelector(selectElement) {
    $(selectElement).parent().parent().find("._expandable-widget-header").append(`
        <div class="widget-filter-buttons">
            <a href="#" onclick="FilterWidgets.selectAllOrNone(this.parentNode.parentNode.parentNode,true)">All</a>
            <a href="#" onclick="FilterWidgets.selectAllOrNone(this.parentNode.parentNode.parentNode,false)">None</a>
        </div>
    `);
}

/**
 * Selects all options of a select element.
 *
 * @param {Object} selectElement The select element
 */
function selectAll(selectElement) {
    $(selectElement).attr('multiple', "true");
    $(selectElement).children("option").each(function () {
        $(this).prop("selected", "true");
    });
}


//
// Event listeners

window.FilterWidgets = {
    selectAllOrNone : selectAllOrNone
}

/**
 * Select or deselect all options within a widget.
 *
 * @param {*} widget the widget toplevel element
 * @param {boolean} select true to select option false to deselect
 */
function selectAllOrNone(widget, select) {
    const selectElement = $(widget).find("select");
    selectElement.children("option").each(function () {
        $(this).prop("selected", select);
    });
    selectionChanged(selectElement);
}
