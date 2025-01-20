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