let search = "";
let modules = [];



//
// Expandable widget.


/**
 * 
 * Widget on the left side that can be collapsed.
 * 
 * The Widget itself needs to be a <div> with class "expandable-widget", The title of the widget
 * is set by the attribute "data-type", a tooltip by the attribute "data-tooltip".
 */

/**
 * onClick function that expands and collapses the widget content.
 * 
 * The function is automatically added to the header.
 * 
 * @param {*} header the header class element
 */
function expandable_widget_toggle(header) {
    header.classList.toggle("collapsed");
    const content = header.nextElementSibling;
    content.classList.toggle("visible");
}

/**
 * Adds title and tooltip and the expand collapse functionality to expandable widgets.
 */
function init_expandable_widgets() {
    $(".expandable-widget").each(function () {
        const title = $(this).data("title");
        $(this).wrapInner('<div class="_expandable-widget-content"></div>');
        $(this).prepend(`
            <div class="_expandable-widget-header collapsed">
                <span onclick="expandable_widget_toggle(this.parentNode)">${title}</span>
            </div>
        `);
        expandable_widget_toggle($(this).children('._expandable-widget-header')[0]);
    });
}



//
// Filters

let filter_selection = new Set();


/**
 * Initialize all filter widget marked with class .widget-filter.
 */
function init_widget_filters() {
    $(".widget-filter").each(function () {
        const selectElement = $(this);
        const id = selectElement.parent().parent().attr('id');

        selectElement.on('change', () => widget_filters_selection_changed(selectElement));
        widget_filters_add_all_none_selector(selectElement);
        widget_filters_append_options(id, selectElement);
        widget_filters_select_all(selectElement);
        widget_filters_selection_changed(selectElement);

        if (filter_config[id]) {
            const total = filter_config[id].reduce((sum, item) => item.item_count ? sum + item.item_count : 0, 0);
            if (total > 0) {
                selectElement.parent().parent().find("._expandable-widget-header span").append(`&nbsp;&nbsp;(${total})`);
            }
        }        
    });
}

/**
 * Imports option elements for a filter widget from the global filter_config variable.
 * 
 * @param {String} id of the expanded widget
 * @param {*} selectElement the select element within the widget
 */
function widget_filters_append_options(id, selectElement) {
    const items = filter_config[id];
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
function widget_filters_selection_changed(selectElement) {
    selectElement.find('option:selected').each(function () {
        filter_selection.add(this.id);
    });
    selectElement.find('option:not(:selected)').each(function () {
        filter_selection.delete(this.id);
    });
}

/**
 * Add a select all and a select none button above a select element.
 * 
 * @param {*} selectElement The select element
 */
function widget_filters_add_all_none_selector(selectElement) {
    $(selectElement).parent().parent().find("._expandable-widget-header").append(`
        <div class="widget-filter-buttons">
            <a href="#" onclick="widget_filters_all_none(this.parentNode.parentNode.parentNode,true)">All</a>
            <a href="#" onclick="widget_filters_all_none(this.parentNode.parentNode.parentNode,false)">None</a>
        </div>
    `);
}

/**
 * Selects all options of a select element.
 * 
 * @param {Object} selectElement The select element
 */
function widget_filters_select_all(selectElement) {
    $(selectElement).attr('multiple', "true");
    $(selectElement).children("option").each(function () {
        $(this).prop("selected", "true");
    });
}


/**
 * Select or deselect all options within a widget.
 * 
 * @param {*} widget the widget toplevel element
 * @param {boolean} select true to select option false to deselect
 */
function widget_filters_all_none(widget, select) {
    const selectElement = $(widget).find("select");
    selectElement.children("option").each(function () {
        $(this).prop("selected", select);
    });
    widget_filters_selection_changed(selectElement);
}



//
// search form

/**
 * initializes the search form
 */
function init_searchform() {
    $("#searchform").searchform(function (value) {
        search = value;
        filter_testcases();
    });
}


//
// tabs

/**
 * initializes the tabs
 */
function init_tabs() {
    $("#tabs").tabs({
        active: 0,
        disabled: [1],
        activate: function (event, ui) { activate_tab(event, ui) },
    });
}


function activate_tab(event, ui) {
    switch (ui.newPanel.attr('id')) {
        case "testcases":
            $("#tabs").tabs("disable", 1);
            $("#left").show();
            $("#searchform").show();
            break;
        case "details":
            $("#left").hide();
            $("#searchform").hide();
            break;
    }
}

function details(name, step, file) {
    let h = $("#details #details_header");
    h.empty();
    h.append("<h2>" + name + " (" + step + ")</h2>");

    let d = $("#details #details_log");
    let format = file.substring(file.indexOf(".") + 1);

    switch (format) {
        case "txt":
            d.empty();
            d.append("<pre></pre>");
            $("#details pre").load(file);
            break;
        case "html":
            d.empty();
            d.load(file);
            break;
    }

    // switch to details tab
    $("#tabs").tabs({
        disabled: [],
    });
    $("#tabs").tabs({
        active: 1,
    });
}

function filter_testcases() {
    $(".testcase").each(function () {
        let id = $(this).attr('id');
        let module = $(this).attr('tc-module');
        let stat = $(this).attr('tc-status');
        let show = true;

        if (search != "" && id.indexOf(search) == -1) {
            show = false;
        }
        if (modules.indexOf(module) == -1) {
            show = false;
        }
        if (stati.indexOf(stat) == -1) {
            show = false;
        }

        if (show) {
            $(this).show()
        } else {
            $(this).hide();
        }
    });
}

function _init() {
    init_expandable_widgets();
    init_widget_filters();

    init_searchform();
    init_tabs();

    console.log(filter_config);
}
$(document).ready(_init);
