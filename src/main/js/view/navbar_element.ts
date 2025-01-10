import {Log} from "@main/utils/log";
import {ButtonElement} from "@main/view/button_element";
import {IElement} from "@main/view/element";

type ChangeListener = (id: string, state: boolean) => void;

export class NavbarElement implements IElement {
    public constructor(
        private element: JQuery<HTMLElement>,
    ) {
        this.log.info("NavbarElement for ", element);
        this.navbarElement = this.element.hasClass('nav-bar') ? this.element : this.element.find('.nav-bar');
    }

    private readonly navbarElement: JQuery<HTMLElement>;
    private readonly buttons: Map<string, ButtonElement> = new Map<string, ButtonElement>();
    private readonly changeListeners: Map<string, ChangeListener> = new Map<string, ChangeListener>();
    private _isActive: boolean = false;

    private log: Log = new Log("Navbar_element");

    public init(): NavbarElement {
        this.log.info("NavbarElement init ", this.navbarElement);
        this.navbarElement.find('.nav-btn').each((index: number, element: HTMLElement) => {
            const buttonElement = $(element);
            const id: string = element.id !== "" ? element.id : `${index}`;
            this.log.info("NavbarElement initialize for ", id);
            const button = new ButtonElement(buttonElement, (state: boolean) => this.notifyChange(id, state));
            this.buttons.set(id, button);
            button.init();
        });

        return this;
    }

    public activate(): void {
        this._isActive = true;
        this.buttons.forEach((button: ButtonElement) => button.activate());
        this.navbarElement.prop('disabled', false);
    }

    public deactivate(): void {
        this.navbarElement.prop('disabled', true);
        this.buttons.forEach((button: ButtonElement) => button.deactivate());
        this._isActive = false;
    }

    public isActive(): boolean {
        return this._isActive;
    }



    public setChangeListener(id: string, changeListener: ChangeListener): void {
        this.log.info(`Set change listener for ${id} ${this.buttons.has(id)}`);
        this.changeListeners.set(id, changeListener);
    }

    public unsetChangeListener(id: string): void {
        this.changeListeners.delete(id);
    }

    public getButton(id: string): ButtonElement | undefined {
        return this.buttons.get(id);
    }

    //
    // Private methods

    private notifyChange(id: string, state: boolean): void {
        this.log.info(`Notify change for ${id} with state ${state}`);
        if (!this.isActive) return;
        const changeListener: ChangeListener | undefined = this.changeListeners.get(id);
        if (changeListener !== undefined) {
            changeListener(id, state);
        }
    }

} // NavbarElement