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
import '@css/openfasttrace.scss';
import {ExpandableElements} from "./view/expandable_elements.ts";
import * as Migrate from "@main/migrate.js";
import {SpecItemsController} from "@main/controller/spec_items_controller";
import {OftStateController} from "@main/controller/oft_state_controller";
import {FiltersElement} from "@main/view/filters_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {SearchElement} from "@main/view/search_element";
import {DetailsElementFactory} from "@main/view/details_element";

function _init() {
    const filters = window.metadata.filters;
    const specItems = window.specitem.specitems;

    const oftState = new OftStateBuilder().fromModel(filters, specItems).build();
    const oftStateController = new OftStateController(oftState);

    new ExpandableElements().init();
    new FiltersElement(filters, oftStateController).init();

    new SearchElement(oftStateController).init().activate();
    Migrate.init_tabs();

    new SpecItemsController(oftStateController, filters.type).init(specItems);

    initHeader();
    initFooter();

    const types = filters.type.map((type) => type.name);
    const tags = filters.tags.map((tag) => tag.name);
    console.log("SPECITEMS", specItems[300]);
    new DetailsElementFactory().build(specItems, types, tags, oftStateController).init().activate();

    oftStateController.init();
}

function initHeader() {
    $("#project-name").append(window.metadata.project.name);
}

function initFooter() {
    $("#specitem-total").append(window.metadata.project.item_count);
    $("#specitem-covered").append(window.metadata.project.item_covered);
    $("#specitem-uncovered").append(window.metadata.project.item_uncovered);
}

$(_init);