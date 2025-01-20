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
        this.log.info("init");
        this.navbarElement.find('.nav-btn').each((index: number, element: HTMLElement) => {
            const buttonElement = $(element);
            const id: string = element.id !== "" ? element.id : `${index}`;
            this.log.info("ButtonElement.id", id);
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