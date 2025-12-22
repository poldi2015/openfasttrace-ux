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
import {KeyboardHandler} from "@main/controller/keyboard_handler";

export class KeyboardController {

    constructor(
        private readonly keyboardControllers: Array<KeyboardHandler>
    ) {
    }

    private readonly log: Log = new Log("KeyboardNavigationController");

    /**
     * Initialize the keyboard navigation controller.
     */
    public init(): KeyboardController {
        this.keyboardControllers.forEach((controller) => {
            controller.init();
        });
        return this;
    }

    public activate(): void {
        this.log.info("Activate keyboard support");
        this.keyboardControllers.forEach((controller) => {
            controller.activate();
        });
    }

    public deactivate(): void {
        this.log.info("Deactivate keyboard support");
        this.keyboardControllers.forEach((controller) => {
            controller.deactivate();
        });
    }

    /**
     * Focus keyword handling to selected element.
     *
     * @param element The element that gets the focus.
     * @param log The logger to use.
     */
    public static focus(element: JQuery, log: Log): boolean {
        if (element.length != 1 || element.is(":focus")) {
            log.info("focus: ", element[0]?.id, " cannot be focused");
            return false;
        }
        log.info("focus: element", element[0].id);
        element[0].focus();
        return true;
    }

} // KeyboardMainController