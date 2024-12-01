import * as ExpandableWidget from "./view/expandables.ts";
import * as Migrate from "./migrate.js";
import {SpecItemsElement} from "./view/spec_items_element";
import {FilterElement} from "./view/filter_element.ts";
import {OftStateController} from "./controller/oft_state_controller";

function _init() {
    const oftStateController = new OftStateController();
    const specItems = window.specitem.specitems;

    ExpandableWidget.init();
    FilterElement.init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    const specItemsElement = new SpecItemsElement(oftStateController);
    specItemsElement.init(specItems);
}

$(_init);