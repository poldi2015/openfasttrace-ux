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
import {IElement} from "@main/view/element";
import {NavbarElement} from "@main/view/navbar_element";
import {ThemeController} from "@main/controller/theme_controller";

export class HeaderElement implements IElement {
    private readonly log: Log = new Log("HeaderElement");
    private readonly navbar: NavbarElement;
    private readonly themeController: ThemeController;
    private _isActive: boolean = false;

    constructor(
        private readonly element: JQuery<HTMLElement>,
        private readonly projectName: string,
        themeController: ThemeController
    ) {
        this.log.info("HeaderElement initialized");
        this.themeController = themeController;
        this.navbar = new NavbarElement(this.element.find("#nav-bar-header"));
    }

    public init(): HeaderElement {
        this.log.info("Initializing header");
        
        // Set project name
        this.element.find("#project-name").text(this.projectName);
        
        // Initialize navbar with buttons
        this.navbar.init();
        
        // Set up theme toggle button listener
        this.navbar.setChangeListener("btn-theme-toggle", (id, state) => {
            this.log.info("Theme toggle clicked, new state:", state);
            this.themeController.toggleTheme();
        });
        
        return this;
    }

    public activate(): void {
        this.log.info("Activating header");
        this._isActive = true;
        this.navbar.activate();
    }

    public deactivate(): void {
        this.log.info("Deactivating header");
        this.navbar.deactivate();
        this._isActive = false;
    }

    public isActive(): boolean {
        return this._isActive;
    }
}
