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
import {SearchElement} from "@main/view/search_element";

const SEARCH_ID = "#search-input";
const SPECITEMS_ELEMENT_ID = "#specitems";

export class KeyboardSearchHandler extends KeyboardHandler {

    constructor(private readonly searchElement: SearchElement) {
        super([$(SEARCH_ID)], [
                //new Key("1", (_) => this.focusFilters()),
                new Key("Enter", (_) => this.focusSpecItems()),
                new Key("Escape", (_) => this.clear()),
            ],
            new Log("KeyboardGlobalController"));
    }

    private readonly specItemsElements: JQuery = $(SPECITEMS_ELEMENT_ID);

    public activate(): void {
        super.activate();
        this.focusSpecItems();
    }


    //
    // private members

    private clear() : boolean {
        this.log.info("Pressed Esc");
        if (this.searchElement.hasContent()) {
            this.searchElement.clear();
        } else {
            this.focusSpecItems();
        }
        return true;
    }

    private focusSpecItems(): boolean {
        return this.focus(this.specItemsElements);
    }

} // KeyboardGlobalController