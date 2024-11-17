let search = "";
let modules = [];


/**
 * initializes the search form
 */
export function init_searchform() {
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
export function init_tabs() {
    $("#tabs").tabs({
        active: 0,
        disabled: [1],
        activate: function (event, ui) {
            activate_tab(event, ui)
        },
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

        if (search !== "" && id.indexOf(search) === -1) {
            show = false;
        }
        if (modules.indexOf(module) === -1) {
            show = false;
        }
        if (stati.indexOf(stat) === -1) {
            show = false;
        }

        if (show) {
            $(this).show()
        } else {
            $(this).hide();
        }
    });
}
