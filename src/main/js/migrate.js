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
/**
 * initializes the search form
 */
export function init_searchform() {
    $("#searchform").searchform(function (value) {
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