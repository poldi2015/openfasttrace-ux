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

const CLASS_COPY_SUCCESS = "_copy-success";
const SUCCESS_DURATION_MS = 500;

/**
 * Reusable copy-to-clipboard button element.
 * Handles clipboard operations and visual feedback.
 */
export class CopyButtonElement {
    private readonly log: Log = new Log("CopyButtonElement");

    constructor(
        private readonly buttonElement: JQuery<HTMLElement>,
        private readonly getText: () => string | null
    ) {
    }

    /**
     * Initialize the copy button and attach event listeners.
     */
    public init(): CopyButtonElement {
        this.buttonElement.on('click', (event) => {
            event.stopPropagation();
            const text = this.getText();
            if (text) {
                this.copyToClipboard(text);
            }
        });
        return this;
    }

    /**
     * Copy text to clipboard and show visual feedback.
     */
    private copyToClipboard(text: string): void {
        navigator.clipboard.writeText(text).then(() => {
            this.log.info("Copied to clipboard:", text);
            this.showSuccessFeedback();
        }).catch(err => {
            this.log.info("Failed to copy:", err);
        });
    }

    /**
     * Show a brief success indicator by adding a CSS class.
     */
    private showSuccessFeedback(): void {
        this.buttonElement.addClass(CLASS_COPY_SUCCESS);
        setTimeout(() => {
            this.buttonElement.removeClass(CLASS_COPY_SUCCESS);
        }, SUCCESS_DURATION_MS);
    }

    /**
     * Show or hide the copy button.
     */
    public setVisible(visible: boolean): void {
        if (visible) {
            this.buttonElement.show();
        } else {
            this.buttonElement.hide();
        }
    }

    /**
     * Get the jQuery element for the button.
     */
    public getElement(): JQuery<HTMLElement> {
        return this.buttonElement;
    }
}
