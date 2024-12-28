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
import {FilterElementFactory, IFilterElement} from "./filter_element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {SelectedFilterIndexes} from "@main/model/oft_state";
import {FilterModels} from "@main/model/filter";

export class FiltersElement {
    constructor(
        private readonly filterModels: FilterModels,
        private readonly oftState: OftStateController,
        private readonly filterElementFactory: FilterElementFactory = new FilterElementFactory()) {
    }

    public filterElements: Array<IFilterElement> = [];

    /**
     * Initialize all filter widget marked with class .filter.
     */
    public init(): void {
        const filterElements: Array<IFilterElement> = this.filterElements;
        const oftState:OftStateController = this.oftState;
        const filterModels: FilterModels = this.filterModels;
        const filterElementFactory: FilterElementFactory = this.filterElementFactory;

        $(".filter").each(function (_, element: HTMLElement) {
            let id: string = element?.id ?? "";
            const filterElement: IFilterElement = filterElementFactory.build(id ? id : "", element, filterModels[id], oftState);
            const selectedFilterIndexes: SelectedFilterIndexes = oftState.getSelectedFilters().get(id) ?? [];
            filterElement.init();
            filterElement.activate();
            filterElements.push(filterElement);
        });
        this.filterElements = filterElements;
    }

} // FiltersElement