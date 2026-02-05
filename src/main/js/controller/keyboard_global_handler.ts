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
import {Key, KeyboardHandler} from "@main/controller/keyboard_handler";
import {Log} from "@main/utils/log";
import {IDetailsElement} from "@main/view/details_element";

const SPECITEMS_ELEMENT_ID = "#specitems";
const SIDEBAR_LEFT_ID = "#select-type";
const SEARCH_ID = "#search-input";

export class KeyboardGlobalHandler extends KeyboardHandler {

    constructor(private readonly detailsElement: IDetailsElement) {
        super([], [
                //new Key("1", (_) => this.focusFilters()),
                new Key("2", (_) => this.focusSpecItems()),
                new Key("f", (_) => this.search()),
                new Key("F", (_) => this.search()),
                new Key("/", (_) => this.search()),
                new Key("m", (_) => this.switchDetailsTab("basic")),
                new Key("d", (_) => this.switchDetailsTab("details")),
            ],
            new Log("KeyboardGlobalController"));
    }

    private readonly sidebarLeftElement: JQuery = $(SIDEBAR_LEFT_ID);
    private readonly specItemsElements: JQuery = $(SPECITEMS_ELEMENT_ID);
    private readonly searchElements: JQuery = $(SEARCH_ID);

    public activate(): void {
        super.activate();
        this.focusSpecItems();
    }


    //
    // private members

    private focusFilters(): boolean {
        return this.focus(this.sidebarLeftElement);
    }

    private focusSpecItems(): boolean {
        return this.focus(this.specItemsElements);
    }

    private search(): boolean {
        this.log.info("search");
        return this.focus(this.searchElements);
    }

    private switchDetailsTab(tab: string): boolean {
        this.log.info("switchDetailsTab", tab);
        this.detailsElement.showTab(tab);
        return true;
    }


    protected keydownHandler(event: JQuery.Event): void {
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLInputElement) return;
        super.keydownHandler(event);
    }
} // KeyboardGlobalController