import {Log} from "@main/utils/log";
import {ButtonElement} from "@main/view/button_element";

type ChangeListener = (id: string, state: boolean) => void;

export class NavbarElement {
    public constructor(
        private element: JQuery<HTMLElement>,
    ) {
        this.navbarElement = this.element.find('div.nav-bar');
    }

    private readonly navbarElement: JQuery<HTMLElement>;
    private readonly buttons: Map<string, ButtonElement> = new Map<string, ButtonElement>();
    private readonly changeListeners: Map<string, ChangeListener> = new Map<string, ChangeListener>();
    private isActive: boolean = false;

    private log: Log = new Log("Navbar_element");

    public init(): NavbarElement {
        this.log.info("NavbarElement initialized");
        this.navbarElement.find('.nav-btn').each((index: number, element: HTMLElement) => {
            const buttonElement = $(element);
            const id: string = element.id !== "" ? element.id : `${index}`;
            const button = new ButtonElement(buttonElement, (state: boolean) => this.notifyChange(id, state));
            this.buttons.set(id, button);
            button.init();
        });

        return this;
    }

    public activate(): void {
        this.isActive = true;
        this.buttons.forEach((button: ButtonElement) => button.activate());
        this.navbarElement.prop('disabled', false);
    }

    public deactivate(): void {
        this.navbarElement.prop('disabled', true);
        this.buttons.forEach((button: ButtonElement) => button.deactivate());
        this.isActive = false;
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
        if (!this.isActive) return;
        const changeListener: ChangeListener | undefined = this.changeListeners.get(id);
        if (changeListener !== undefined) {
            this.log.info(`Notify change for ${id} with state ${state}`);
            changeListener(id, state);
        }
    }

} // NavbarElement