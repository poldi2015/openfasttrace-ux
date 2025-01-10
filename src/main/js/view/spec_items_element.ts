import {IElement} from "@main/view/element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {NavbarElement} from "@main/view/navbar_element";
import {Log} from "@main/utils/log";

const CONTENT_NAV_BAR_ID = "#content-nav-bar";

export class SpecItemsElement implements IElement {
    constructor(private oftState: OftStateController) {
        this.navbarElement = new NavbarElement($(CONTENT_NAV_BAR_ID));
    }

    private readonly navbarElement: NavbarElement;

    private log = new Log("SpecItemsElement");

    public init(): SpecItemsElement {
        this.navbarElement.setChangeListener("btn-scroll-to-selection", () => this.scrollToSelection());
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


    //
    // private members

    private scrollToSelection(): void {
        this.log.info("selectAndSohw");
        this.oftState.selectItem();
    }

}