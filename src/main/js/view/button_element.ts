import {Log} from "@main/utils/log";

const CLASS_ACTIVATOR = "nav-btn-activator";
const CLASS_TOGGLER = "nav-btn-toggler";

const CLASS_ON = "nav-btn-on";

enum ButtonType {
    PRESS,
    ACTIVATOR,
    TOGGLER
}

export class ButtonElement {
    constructor(private buttonElement: JQuery<HTMLElement>,
                private readonly changeListener: (state: boolean) => void,
    ) {
        if (buttonElement.hasClass(CLASS_TOGGLER)) {
            this.buttonType = ButtonType.TOGGLER;
            this._isOn = buttonElement.hasClass(CLASS_ON);
        } else if (buttonElement.hasClass(CLASS_ACTIVATOR)) {
            this.buttonType = ButtonType.ACTIVATOR;
            this._isOn = buttonElement.hasClass(CLASS_ON);
        } else {
            this.buttonType = ButtonType.PRESS;
            this._isOn = false;
        }
        this.log.info("ButtonType", this.buttonType);
    }

    private readonly buttonType: ButtonType;
    private _isOn: boolean;

    private readonly log: Log = new Log("ButtonElement");

    public init(): ButtonElement {
        return this;
    }

    public activate() {
        this.buttonElement.on('click', () => {
            if (this.canToggleOnClick()) {
                this.toggle();
                this.changeListener(this._isOn);
            } else if (this.canClicked()) {
                this.changeListener(true);
            }
        });
        this.buttonElement.prop('disabled', false);
    }

    public deactivate() {
        this.buttonElement.off('click');
        this.buttonElement.prop('disabled', true);
    }

    public get isOn(): boolean {
        return this._isOn;
    }

    public toggle(on: boolean = this._isOn): boolean {
        if (this.buttonType === ButtonType.PRESS) return false;
        if (this._isOn === on) return on;
        this._isOn = on;
        this.log.info("Toggling to", this._isOn);
        if (this._isOn) {
            this.buttonElement.addClass(CLASS_ON);
        } else {
            this.buttonElement.removeClass(CLASS_ON);
        }
        return this._isOn;
    }

    private canToggleOnClick(): boolean {
        return this.buttonType === ButtonType.TOGGLER ? true
            : this.buttonType === ButtonType.ACTIVATOR && !this._isOn;
    }

    private canClicked(): boolean {
        return this.buttonType === ButtonType.PRESS;
    }

} // ButtonElement