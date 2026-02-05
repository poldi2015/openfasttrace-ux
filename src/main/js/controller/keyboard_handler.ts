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
import {KeyboardController} from "@main/controller/keyboard_controller";

export class Key {
    constructor(public readonly key: string,
                public readonly handler: (event: JQuery.Event) => boolean,
                public readonly shift: boolean = false,
                public readonly ctrl: boolean = false,
                public readonly alt: boolean = false,
                public readonly meta: boolean = false
    ) {
    }

    public matches(event: JQuery.Event): boolean {
        return event.key == this.key &&
            event.shiftKey == this.shift &&
            event.ctrlKey == this.ctrl &&
            event.altKey == this.alt &&
            event.metaKey == this.meta;
    }
}

export abstract class KeyboardHandler {

    public constructor(elements: Array<JQuery>,
                       private readonly keys: Array<Key>,
                       protected readonly log: Log) {
        elements.forEach((element: JQuery) => this._elements.push(element[0]));
    }

    private _elements: Array<Element> = [];
    private _keys: Array<Key> = [];
    private active: boolean = false;
    private eventHandler = (event: JQuery.Event) => {
    };

    public init(): void {
    }

    public activate(): void {
        this.active = true;
        this.registerKeyHandler();
    }

    public deactivate(): void {
        this.active = false;
        this.unregisterKeyHandler();
    }

    public isActive(): boolean {
        return this.active;
    }

    protected focus(element: JQuery): boolean {
        return KeyboardController.focus(element, this.log);
    }

    private registerKeyHandler(): void {
        this.eventHandler = (event) => this.keydownHandler(event);
        $(document).on('keydown', (event) => this.keydownHandler(event));
    }

    private unregisterKeyHandler(): void {
        $(document).off('keydown', this.eventHandler);
    }

    protected keydownHandler(event: JQuery.Event): void {
        const activeElement = document.activeElement;
        this.log.info(`keydownHandler key:`, event.key, "activeElement:", activeElement?.id, "element", this._elements);

        if (this._elements.length == 0) {
            // Handle only events that are global, means no element has focus

        } else {
            // Only handle events that apply to selected focused elements

            if (activeElement == null || !this._elements.includes(activeElement)) {
                this.log.info("keydownHandler: ignoring event, ", activeElement?.id, "not supported");
                return;
            }
        }
        for (const key of this.keys) {
            if (key.matches(event)) {
                this.log.info(`keydownHandler processing key: ${key.key}`);
                const handled = key.handler(event);
                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                    return;
                }
            }
        }
    }

} // KeyboardController