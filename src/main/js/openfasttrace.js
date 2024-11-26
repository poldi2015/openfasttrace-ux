import * as ExpandableWidget from "./elements/expandables.ts";
import * as FilterWidgets from "./elements/filters.ts";
import * as Migrate from "./migrate.js";
import {SpecItemsElement} from "./elements/spec_items_element";
import * as OftState from "./oft_state";

function _init() {
    const oftState = new OftState.OftState();
    const specItems = window.specitem.specitems;

    ExpandableWidget.init();
    FilterWidgets.init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    const specItemsElement = new SpecItemsElement(oftState);
    specItemsElement.init(specItems);
}

$(_init);