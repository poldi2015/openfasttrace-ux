import {Key, KeyboardHandler} from "@main/controller/keyboard_handler";
import {Log} from "@main/utils/log";
import {SpecItemsController} from "@main/controller/spec_items_controller";
import {OftStateController} from "@main/controller/oft_state_controller";
import {CoverType} from "@main/model/oft_state";

const FOCUSITEMS_ELEMENT_ID = "#focusitem";
const SPECITEMS_ELEMENT_ID = "#specitems";

export class KeyboardSpecItemHandler extends KeyboardHandler {
    constructor(
        private readonly oftState: OftStateController,
        private readonly specItemsController: SpecItemsController
    ) {
        super([$(SPECITEMS_ELEMENT_ID), $(FOCUSITEMS_ELEMENT_ID)],
            [
                new Key('ArrowUp', (_) => this.specItemsController.selectPreviousSpecItem()),
                new Key('ArrowDown', (_) => this.specItemsController.selectNextSpecItem()),
                new Key(' ', (_) => this.focusOrUnfocusSpecItem()),
                new Key('Enter', (_) => this.focusOrUnfocusSpecItem()),
                new Key("f", (_) => this.scrollToSelection()),
                new Key("F", (_) => this.scrollToSelection()),
                new Key("ArrowLeft", (_) => this.changeOftStateToPreviousState()),
                new Key("ArrowRight", (_) => this.changeOftStateToNextState()),
                new Key("<", (_) => this.changeFocusedCoverageType(CoverType.covering)),
                new Key(">", (_) => this.changeFocusedCoverageType(CoverType.coveredBy), true),
                new Key("t", (_) => this.toggleFocusedCoverageType()),
                new Key("T", (_) => this.toggleFocusedCoverageType()),
            ],
            new Log("KeyboardSpecItemsController"));
    }

    private readonly focusItemElement = $(FOCUSITEMS_ELEMENT_ID);
    private readonly specitemsElement = $(SPECITEMS_ELEMENT_ID);


    //
    // Prvate members

    private focusOrUnfocusSpecItem(): boolean {
        this.log.info("focusOrUnfocusSpecItem", this.specItemsController.isFocusedSpecItemSelected());
        if (this.specItemsController.isFocusedSpecItemSelected()) {
            if (!this.specItemsController.unfocusSpecItem()) return false;
            this.focus(this.specitemsElement);
        } else {
            if (!this.specItemsController.focusSelectedSpecItem()) return false;
            this.focus(this.focusItemElement);
        }

        return true;
    }

    private scrollToSelection(): boolean {
        this.log.info("scrollToSelection");
        this.oftState.selectItem();
        return true;
    }

    private changeOftStateToPreviousState(): boolean {
        this.log.info("changeOftStateToPreviousState");
        this.oftState.toPreviousState();
        return true;
    }

    private changeOftStateToNextState(): boolean {
        this.log.info("changeOftStateToNextState");
        this.oftState.toNextState();
        return true;
    }

    private changeFocusedCoverageType(coverType: CoverType): boolean {
        this.log.info("changeFocusedCoverageType to", CoverType[coverType]);
        return this.specItemsController.changeFocusCoverType(coverType);
    }

    private toggleFocusedCoverageType(): boolean {
        this.log.info("toggleFocusedCoverageType");
        return this.specItemsController.toggleFocusCoverType();
    }

} // keyboardSpecItemsController