
let search = "";
let modules = new Array();
let stati = new Array();

/**
 * Expandable widget.
 */


/**
 * 
 * Widget on the left side that can be collapsed.
 * 
 * The Widget itself needs to be a <div> with classs "expandable-widget", The title of the widget
 * is set by the attribute "data-type", a tooltip by the attribute "data-tooltip".
 */

/**
 * onCliick function that expands and collapses the widget content.
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
        var title = $(this).data("title");
        $(this).wrapInner('<div class="_expandable-widget-content"></div>');
        $(this).prepend(`
            <div class="_expandable-widget-header collapsed" onclick="expandable_widget_toggle(this)">
                <span>${title}</span>
            </div>
        `);
        expandable_widget_toggle($(this).children('._expandable-widget-header')[0]);
    });
}




/**
 * Filters.
 */

let filters = new Set();


/**
 * Initialize all filter widget marked with class .widget-filter.
 */
function init_widget_filters() {
    $(".widget-filter").each(function () {
        const selectElement = $(this);
        const id = selectElement.parent().parent().attr('id');

        selectElement.on('change', () => widget_filters_selection_changed(selectElement));
        widget_filters_add_all_none_selector(selectElement);
        widget_filters_add_ids(selectElement, id);
        widget_filters_select_all(selectElement);
        widget_filters_selection_changed(selectElement);
    });
}

/**
 * Adds a listener to the select element that updates the list of selected entries.
 * 
 * @param {jquewry object} selectElement th select element
 */
function widget_filters_selection_changed(selectElement) {
    selectElement.find('option:selected').each(function () {
        filters.add(this.id);
    });
    selectElement.find('option:not(:selected)').each(function () {
        filters.delete(this.id);
    });
    console.log("XX", filters);
}

/**
 * Add a select all and a s<elect none button above a select element.
 * 
 * @param {jquery object} selectElement The select element
 */
function widget_filters_add_all_none_selector(selectElement) {
    $(selectElement).parent().prepend(`
        <p style="padding-left:5px">
            <a href="#" onclick="widget_filters_select_entries(this,true)">All</a>&nbsp;&nbsp;
            <a href="#" onclick="widget_filters_select_entries(this,false)">None</a>
        </p>
    `);
}

/**
 * Selects all options of a select element.
 * 
 * @param {jquery object} selectElement The select element
 */
function widget_filters_select_all(selectElement) {
    $(selectElement).attr('multiple', "true");
    $(selectElement).children("option").each(function () {
        $(this).prop("selected", "true");
    });
}

/**
 * Add IDs to all options of a select of the form <select id>_<index>.
 * 
 * @param {jquery object} selectElement The select element
 */
function widget_filters_add_ids(selectElement, id) {
    $(selectElement).children("option").each(function (index, option) {
        $(option).prop("id", `${id}_${index}`);
    });
}

/**
 * Select or deselect an options within a widget.
 * 
 * @param {jquery object} option the option element
 * @param {boolean} select true to select option false to deselect
 */
function widget_filters_select_entries(option, select) {
    const selectElement = $(option).parent().parent().find("select");
    selectElement.children("option").each(function () {
        $(this).prop("selected", select);
    });
    widget_filters_selection_changed(selectElement);
}








/**
 * Initialze a specific filter.
 * 
 * @param {*} id id  of the <p> element. id of the selector with id #<id>_list
 * @param {*} title Title for the expandable box
 * @param {*} tooltip Tooltip for the title
 */
function init_filter(id) {
    $("#{id}_list option:selected").each(function () {
        filters.add("stat-${id}");
    });

    $("#{id}_list").on("change", function (event) {
        if ($(this).selected) {
            filter.add("stat-${id}");
        } else {
            filter.delete("stat-${id}");
        }
        console.log("Filters ${filter.toString()}");
    });
}


/**
 * Initialized the status selector box
 */
function init_status() {
    $("#status").expandable({
        title: "Status",
        startopen: true,
        tooltip: "Select which categories (failed,suceeded...) of tests to show",
        uiIconClosed: "ui-icon-circle-triangle-e",
        uiIconOpen: "ui-icon-circle-triangle-s",
        duration: 100,
    });

    stati = ["generate", "compile", "test"];
    for (let i in stati) {
        $("#status_list option[id=" + stati[i] + "]").prop("selected", true);
    }
    $("#status_list").on("change", function (event) {
        $("#status_list option:selected").each(function () {
            update_status();
            filter_testcases();
        });
    });

}

function set_status(selected) {
    $("#status_list option").prop("selected", selected);
    update_status();
    filter_testcases();
}

function update_status() {
    let v = new Array();
    $("#status_list option:selected").each(function () {
        v.push($(this).attr('id'));
    });
    stati = v;
}

function init_filter(id, title, tooltip) {
    $("#" + id).expandable({
        title: title,
        startopen: true,
        tooltip: tooltip,
        uiIconClosed: "ui-icon-circle-triangle-e",
        uiIconOpen: "ui-icon-circle-triangle-s",
        duration: 100,
    });
}

/**
 * Initialized the module selector box
 */
function init_modules() {
    $("#modules").expandable({
        title: "Modules",
        startopen: true,
        tooltip: "Select which modules to show testcases for",
        uiIconClosed: "ui-icon-circle-triangle-e",
        uiIconOpen: "ui-icon-circle-triangle-s",
        duration: 100,
    });

    $("#module_list option").each(function () {
        modules.push($(this).text());
        $(this).prop("selected", true);
    });
    $("#module_list").on("change", function (event) {
        $("#module_list option:selected").each(function () {
            update_modules();
            filter_testcases();
        });
    });
}

function set_modules(selected) {
    $("#module_list option").prop("selected", selected);
    update_modules();
    filter_testcases();
}

function update_modules() {
    let v = new Array();
    $("#module_list option:selected").each(function () {
        v.push($(this).text());
    });
    modules = v;
}

/**
 * initializes the search form
 */
function init_searchform() {
    $("#searchform").searchform(function (value) {
        search = value;
        filter_testcases();
    });
}

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
    /*
    init_filter("type", "Type", "Specobject type");
    init_filter("coverage", "Coverage", "Select missing covered.");
    init_status();
    init_modules();
    init_searchform();
    init_tabs();
    filter_testcases();
    */
}
$(document).ready(_init);
