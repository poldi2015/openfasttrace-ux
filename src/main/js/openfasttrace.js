import * as ExpandableWidget from "./view/expandables.ts";
import * as Migrate from "./migrate.js";
import {SpecItemsController} from "./controller/spec_items_controller";
import {FilterElement} from "./view/filter_element.ts";
import {OftStateController} from "./controller/oft_state_controller";
import {FiltersElement} from "./view/filters_element";

function _init() {
    const oftStateController = new OftStateController();
    const specItems = window.specitem.specitems;

    ExpandableWidget.init();
    new FiltersElement(oftStateController).init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    const specItemsElement = new SpecItemsController(oftStateController);
    specItemsElement.init(specItems);
}

$(_init);