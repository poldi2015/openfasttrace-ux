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
import {FieldModel} from "@main/model/project";
import {NavbarElement} from "@main/view/navbar_element";

const BUTTON_RESET_FILTERS_ID = "btn-reset-filters";
const NAV_BAR_ID = "#sidebar-nav-bar";

/**
 * Populates the Filter UI with the corresponding filter elements based on the {@link FieldMetaData}.
 */
export class FiltersElement {
    constructor(
        private readonly filterModels: Map<String, FieldModel>,
        private readonly oftState: OftStateController,
        private readonly filterElementFactory: FilterElementFactory = new FilterElementFactory()) {
        this.navbarElement = new NavbarElement($(NAV_BAR_ID))
    }

    private readonly navbarElement: NavbarElement;
    private filterElements = new Array<IFilterElement>();

    /**
     * Initialize all filter widget marked with class .filter.
     */
    public init(): void {
        $(".filter").each((_, element: HTMLElement) => {
            let id: string = element?.id ?? "";
            const filterElement: IFilterElement = this.filterElementFactory.build(id ? id : "", element, this.filterModels.get(id)!!, this.oftState);
            filterElement.init().activate();
            this.filterElements.push(filterElement);
        });
        this.navbarElement.init();
        this.navbarElement.setChangeListener(BUTTON_RESET_FILTERS_ID, () => this.onResetFilters());
        this.navbarElement.activate();
    }

    //
    // private members

    private onResetFilters(): void {
        this.filterElements.forEach((filterElement: IFilterElement) => {
            filterElement.selectOff();
        });
    }

} // FiltersElement