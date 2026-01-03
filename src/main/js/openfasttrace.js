/*
  @license
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
import {ExpandableElements} from "@main/view/expandable_elements.ts";
import {SpecItemsController} from "@main/controller/spec_items_controller";
import {OftStateController} from "@main/controller/oft_state_controller";
import {FiltersElement} from "@main/view/filters_element";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {SearchElement} from "@main/view/search_element";
import {DetailsElementFactory} from "@main/view/details_element";
import {SpecItemsElement} from "@main/view/spec_items_element";
import {Project} from "@main/model/project";
import {ThemeController} from "@main/controller/theme_controller";
import {HeaderElement} from "@main/view/header_element";
import {TreeViewElement} from "@main/view/tree_view_element";
import {KeyboardController} from "@main/controller/keyboard_controller";
import {KeyboardSpecItemHandler} from "@main/controller/keyboard_specitems_handler";
import {KeyboardGlobalHandler} from "@main/controller/keyboard_global_handler";
import {KeyboardSearchHandler} from "@main/controller/keyboard_search_handler";

function _init() {
    console.log("START");
    
    // Initialize theme controller with dark mode as default
    const themeController = new ThemeController().init();
    
    const specItems = window.specitem.specitems;
    const project = new Project(
        window.specitem.project,
        window.metadata
    );

    const oftStateBuilder = new OftStateBuilder().fromModel(project, specItems);
    if (Number.parseInt(window.location.hash.substring(1)) > 0) {
        oftStateBuilder.setSelectedIndex(Number.parseInt(window.location.hash.substring(1)));
    }
    const oftState = oftStateBuilder.build();
    const oftStateController = new OftStateController(oftState);

    new ExpandableElements().init();
    new FiltersElement(project.fieldModels, oftStateController).init();

    const searchElement = new SearchElement(oftStateController).init();
    searchElement.activate();

    const specItemsElement = new SpecItemsElement(oftStateController);
    specItemsElement.init().activate();
    const specItemsController = new SpecItemsController(oftStateController, specItemsElement, project);
    specItemsController.init(specItems);

    // Initialize header with OFT logo, project name, and theme toggle
    new HeaderElement($("#header"), project.project.projectName, themeController).init().activate();

    // Initialize tree view in right sidebar
    new TreeViewElement(specItems, oftStateController, project).init().activate();
    
    initFooter(project);

    const detailsElement = new DetailsElementFactory().build(specItems, project, oftStateController).init();
    detailsElement.activate();

    oftStateController.init();

    // Initialize keyboard navigation for spec items (after oftStateController.init())
    new KeyboardController([
        new KeyboardGlobalHandler(detailsElement),
        new KeyboardSpecItemHandler(oftStateController, specItemsController),
        new KeyboardSearchHandler(searchElement)
    ]).init().activate();
    
    console.log("ACTIVE");
}

function initFooter(project) {
    $("#specitem-total").append(project.project.item_count);
    $("#specitem-covered").append(project.project.item_covered);
    $("#specitem-uncovered").append(project.project.item_uncovered);
    $("#specitem-wrong-link-total").append(project.project.wronglink_count.reduce((a, b) => a + b));
}

$(_init);