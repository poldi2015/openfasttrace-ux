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

/**
 *
 * Widget on the left side that can be collapsed.
 *
 * The Widget itself needs to be a <div> with class "expandable-widget", The title of the widget
 * is set by the attribute "data-type", a tooltip by the attribute "data-tooltip".
 */


//
// API

/**
 * Adds title and tooltip and the expand collapse functionality to expandable view.
 */
export function init(): void {
    $('.expandable-widget').each(function () {
        const title: string = $(this).data('title');
        $(this).wrapInner('<div class="_expandable-widget-content"></div>');
        $(this).prepend(`
            <div class="_expandable-widget-header collapsed">
                <span onclick="window.Expandables.toggleExpansion(this.parentNode)">${title}</span>
            </div>
        `);
        toggleExpansion($(this).children('._expandable-widget-header')[0]);
    });
}


//
// Event listeners

(window as any).Expandables = {
    toggleExpansion: toggleExpansion
}

/**
 * onClick function that expands and collapses the widget content.
 *
 * The function is automatically added to the header.
 *
 * @param {Element} header the header class element
 */
function toggleExpansion(header: Element): void {
    header.classList.toggle('collapsed');
    const content: Element = header.nextElementSibling!;
    content.classList.toggle('visible');
}


