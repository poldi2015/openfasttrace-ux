import * as ExpandableWidget from "./expandable_widget.js";
import * as FilterWidgets from "./filter_widgets.js";
import * as Migrate from "./migrate.js";

function _init() {
    ExpandableWidget.init();
    FilterWidgets.init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    console.log(filterModel);
}

$(document).ready(_init);
