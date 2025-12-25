import {Key, KeyboardHandler} from "@main/controller/keyboard_handler";
import {Log} from "@main/utils/log";

const SEARCH_ID = "#search-input";
const SPECITEMS_ELEMENT_ID = "#specitems";

export class KeyboardSearchHandler extends KeyboardHandler {

    constructor() {
        super([$(SEARCH_ID)], [
                //new Key("1", (_) => this.focusFilters()),
                new Key("Enter", (_) => this.focusSpecItems()),
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

    private focusSpecItems(): boolean {
        return this.focus(this.specItemsElements);
    }

} // KeyboardGlobalController