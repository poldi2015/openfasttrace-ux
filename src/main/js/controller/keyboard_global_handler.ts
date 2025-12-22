import {Key, KeyboardHandler} from "@main/controller/keyboard_handler";
import {Log} from "@main/utils/log";

const SPECITEMS_ELEMENT_ID = "#specitems";
const SIDEBAR_LEFT_ID = "#select-type";

export class KeyboardGlobalHandler extends KeyboardHandler {

    constructor() {
        super([], [
                new Key("1", (_) => this.focusFilters()),
                new Key("2", (_) => this.focusSpecItems())
            ],
            new Log("KeyboardGlobalController"));
    }

    private readonly sidebarLeftElement: JQuery = $(SIDEBAR_LEFT_ID);
    private readonly specItemsElements: JQuery = $(SPECITEMS_ELEMENT_ID);


    //
    // private members

    private focusFilters(): boolean {
        return this.focus(this.sidebarLeftElement);
    }

    private focusSpecItems(): boolean {
        return this.focus(this.specItemsElements);
    }

} // KeyboardGlobalController