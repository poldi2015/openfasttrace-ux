import * as ExpandableWidget from "./view/expandables.ts";
import * as Migrate from "./migrate.js";
import {SpecItemsController} from "./controller/spec_items_controller";
import {OftStateController} from "./controller/oft_state_controller";
import {FiltersElement} from "./view/filters_element";
import {VolatileOftState} from "./controller/volatile_oft_state";

function _init() {
    const oftState = new VolatileOftState(
        null,
        [],
        new Map([["tags",[]]]),
    );
    const oftStateController = new OftStateController(oftState);
    const specItems = window.specitem.specitems;

    ExpandableWidget.init();
    new FiltersElement(oftStateController).init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    new SpecItemsController(oftStateController).init(specItems);

    oftStateController.init();
}

$(_init);