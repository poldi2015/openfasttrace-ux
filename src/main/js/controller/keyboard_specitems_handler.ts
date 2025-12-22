import {Key, KeyboardHandler} from "@main/controller/keyboard_handler";
import {Log} from "@main/utils/log";
import {SpecItemsController} from "@main/controller/spec_items_controller";

const FOCUSITEMS_ELEMENT_ID = "#focusitem";
const SPECITEMS_ELEMENT_ID = "#specitems";

export class KeyboardSpecItemHandler extends KeyboardHandler {
    constructor(
        private readonly specItemsController: SpecItemsController
    ) {
        super([$(SPECITEMS_ELEMENT_ID), $(FOCUSITEMS_ELEMENT_ID)],
            [
                new Key('ArrowUp', (_) => this.specItemsController.selectPreviousSpecItem()),
                new Key('ArrowDown', (_) => this.specItemsController.selectNextSpecItem()),
                new Key(' ', (_) => this.focusOrUnfocusSpecItem()),
                new Key('Enter', (_) => this.focusOrUnfocusSpecItem())
            ],
            new Log("KeyboardSpecItemsController"));
    }

    private readonly focusItemElement = $(FOCUSITEMS_ELEMENT_ID);
    private readonly specitemsElement = $(SPECITEMS_ELEMENT_ID);


    private focusOrUnfocusSpecItem(): boolean {
        this.log.info("focusOrUnfocusSpecItem", this.specItemsController.isFocusedItemSelected());
        if (this.specItemsController.isFocusedItemSelected()) {
            if (!this.specItemsController.unfocusItem()) return false;
            this.focus(this.specitemsElement);
        } else {
            if (!this.specItemsController.focusSelectedItem()) return false;
            this.focus(this.focusItemElement);
        }

        return true;
    }


} // keyboardSpecItemsController