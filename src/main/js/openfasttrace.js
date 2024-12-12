import * as ExpandableWidget from "./view/expandables.ts";
import * as Migrate from "./migrate.js";
import {SpecItemsController} from "./controller/spec_items_controller";
import {OftStateController} from "./controller/oft_state_controller";
import {FiltersElement} from "./view/filters_element";
import {OftStateBuilder} from "./controller/oft_state_builder";

function _init() {
    const metaModel = window.metadata;
    const specItems = window.specitem.specitems;

    const oftState = new OftStateBuilder().fromModel(metaModel,specItems).build();
    const oftStateController = new OftStateController(oftState);

    ExpandableWidget.init();
    new FiltersElement(oftStateController).init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    new SpecItemsController(oftStateController).init(specItems);

    oftStateController.init();
}

$(_init);