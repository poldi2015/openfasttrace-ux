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
import {IElement} from "@main/view/element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {NavbarElement} from "@main/view/navbar_element";
import {Log} from "@main/utils/log";

const CONTENT_NAV_BAR_ID = "#content-nav-bar";
const CONTENT_SPEC_ITEM_COUNT = "#specitem-count";

export class SpecItemsElement implements IElement {
    constructor(private oftState: OftStateController) {
        this.navbarElement = new NavbarElement($(CONTENT_NAV_BAR_ID));
        this.specItemCountElement = $(CONTENT_SPEC_ITEM_COUNT);
    }

    private readonly navbarElement: NavbarElement;
    private readonly specItemCountElement: JQuery<HTMLElement> = $(CONTENT_SPEC_ITEM_COUNT);

    private log: Log = new Log("SpecItemsElement");

    public init(): SpecItemsElement {
        this.navbarElement.setChangeListener("btn-scroll-to-selection", () => this.scrollToSelection());
        this.navbarElement.setChangeListener("btn-history-back", () => this.changeOftStateToPreviousState());
        this.navbarElement.setChangeListener("btn-history-forward", () => this.changeOftStateToNextState());
        this.navbarElement.init();
        return this;
    }


    public activate(): void {
        this.navbarElement.activate();
    }

    public deactivate(): void {
        this.navbarElement.deactivate();
    }

    public isActive(): boolean {
        return this.navbarElement.isActive();
    }

    public updateNumberOfItems(numberOfItems: number): void {
        this.log.info("updateShownItems number:", numberOfItems);
        this.specItemCountElement.text(numberOfItems);
    }

    //
    // private members

    private scrollToSelection(): void {
        this.log.info("scrollToSelection");
        this.oftState.selectItem();
    }

    private changeOftStateToPreviousState() {
        this.oftState.toPreviousState();
    }

    private changeOftStateToNextState() {
        this.oftState.toNextState();
    }

} // SpecItemsElement