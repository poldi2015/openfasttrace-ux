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
import {FilterElement} from "./filter_element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {SelectedFilterIndexes} from "@main/model/oft_state";
import {FilterModel} from "@resources/js/meta_data";

interface FilterModelMetadata {
    [key: string]: Array<FilterModel>;
}

export class FiltersElement {
    constructor(
        private readonly filterModels: FilterModelMetadata,
        private readonly oftState: OftStateController) {
    }

    public filterElements: Array<FilterElement> = [];

    /**
     * Initialize all filter widget marked with class .widget-filter.
     */
    public init(): void {
        const filterElements: Array<FilterElement> = this.filterElements;
        const oftState:OftStateController = this.oftState;
        const filterModels: FilterModelMetadata = this.filterModels;

        $(".widget-filter").each(function (_, element: HTMLElement) {
            let id: string = element?.parentElement?.parentElement?.id ?? "";
            const filterElement: FilterElement = new FilterElement(id ? id : "", element, filterModels[id], oftState);
            const selectedFilterIndexes: SelectedFilterIndexes = oftState.getSelectedFilters().get(id) ?? [];
            filterElement.init(selectedFilterIndexes);
            filterElement.activate();
            filterElements.push(filterElement);
        });
        this.filterElements = filterElements;
    }

} // FiltersElement