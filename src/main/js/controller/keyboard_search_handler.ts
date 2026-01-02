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