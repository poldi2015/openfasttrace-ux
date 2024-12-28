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
import {ExpandableElements} from "./view/expandable_elements.ts";
import * as Migrate from "./migrate.js";
import {SpecItemsController} from "./controller/spec_items_controller";
import {OftStateController} from "./controller/oft_state_controller";
import {FiltersElement} from "./view/filters_element";
import {OftStateBuilder} from "./controller/oft_state_builder";
import '@css/openfasttrace_view.scss'

function _init() {
    const metaModel = window.metadata;
    const specItems = window.specitem.specitems;

    const oftState = new OftStateBuilder().fromModel(metaModel,specItems).build();
    const oftStateController = new OftStateController(oftState);

    new ExpandableElements().init();
    //ExpandableWidget.init();
    new FiltersElement(metaModel, oftStateController).init();

    Migrate.init_searchform();
    Migrate.init_tabs();

    new SpecItemsController(oftStateController).init(specItems);

    oftStateController.init();
}

$(_init);