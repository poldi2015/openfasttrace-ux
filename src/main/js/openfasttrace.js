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
import {STATUS_FIELD_NAMES, TAG_FIELD_NAMES, TYPED_FIELD_NAMES} from "@main/model/specitems";

function _init() {
    console.log("START");
    const projectModel = window.specitem.project;
    const specItems = window.specitem.specitems;
    const fieldCounts = new Map([
        ["type", projectModel.type_count],
        ["uncovered", projectModel.uncovered_count],
        ["status", projectModel.status_count],
        ["tags", projectModel.tags_count],
    ]);
    const project = new Project(
        projectModel.projectName,
        projectModel.types,
        TYPED_FIELD_NAMES,
        projectModel.tags,
        TAG_FIELD_NAMES,
        projectModel.status,
        STATUS_FIELD_NAMES,
        projectModel.item_count,
        projectModel.item_covered,
        projectModel.item_uncovered,
        fieldCounts,
        window.metadata.fields
    );

    const oftStateBuilder = new OftStateBuilder().fromModel(project.fieldModels, specItems);
    if (Number.parseInt(window.location.hash.substring(1)) > 0) {
        oftStateBuilder.setSelectedIndex(Number.parseInt(window.location.hash.substring(1)));
    }
    const oftState = oftStateBuilder.build();
    const oftStateController = new OftStateController(oftState);

    new ExpandableElements().init();
    new FiltersElement(project.fieldModels, oftStateController).init();

    new SearchElement(oftStateController).init().activate();

    const specItemsElement = new SpecItemsElement(oftStateController);
    specItemsElement.init().activate();
    new SpecItemsController(oftStateController, specItemsElement, project).init(specItems);

    initHeader(project);
    initFooter(project);

    new DetailsElementFactory().build(specItems, project, oftStateController).init().activate();

    oftStateController.init();
    console.log("ACTIVE");
}

function initHeader(project) {
    $("#project-name").append(project.projectName);
}

function initFooter(project) {
    $("#specitem-total").append(project.itemCount);
    $("#specitem-covered").append(project.itemCovered);
    $("#specitem-uncovered").append(project.itemUncovered);
}

$(_init);