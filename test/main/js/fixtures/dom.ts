/*
  OpenFastTrace UX

 Copyright (C) 2016 - 2024 itsallcode.org

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
import {beforeEach, expect} from "vitest";
import jQuery from "jquery";

declare module 'vitest' {
    interface Assertion<T = any> {
        toMatchHTML(expected: string): void;
    }
}

declare global {
    interface Window {
        $: any;
        metadata: any;
    }
}

/**
 * Define JQuery $. Needs to be imported so that openfasttrace classes can be used.
 */
export const $: JQueryStatic = jQuery;
window.$ = $;

beforeEach(() => {
    document.body.innerHTML = '';
})


/**
 * HTML matcher with normalization.
 *
 * Accepts JQuery, HTML Element and Strings as input.
 */

export function normalizeJQuery(element: JQuery): string {
    return normalizeElement(element[0]);
}

export function normalizeElement(element: Element): string {
    return normalizeHTML(element.innerHTML);
}

function normalizeHTML(html: string): string {
    return html
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces
        .replace(/>\s+</g, '><') // Remove spaces between tags
        .trim(); // Trim leading and trailing spaces
}


expect.extend({
    toMatchHTML(received: any, expected: string) {
        const normalizedReceived: string =
            "jquery" in received ? normalizeJQuery(received) :
                received instanceof Element ? normalizeElement(received)
                    : normalizeHTML(received.toString());
        const normalizedExpected: string = normalizeHTML(expected);

        const pass = normalizedReceived === normalizedExpected;

        if (pass) {
            return {
                message: () => `Expected HTML not to match:\n${normalizedReceived}\n\nbut got:\n${normalizedExpected}`,
                pass: true,
            };
        } else {
            return {
                message: () => `Expected HTML to match:\n${normalizedExpected}\n\nbut got:\n${normalizedReceived}`,
                pass: false,
            };
        }
    },
});