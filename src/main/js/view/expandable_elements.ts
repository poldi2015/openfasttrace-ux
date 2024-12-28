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
 * Titled container element that can be collapsed.
 *
 * The element itself needs to be a <div> with class "expandable", The title of the element
 * is set by the attribute "data-type", a tooltip by the attribute "data-tooltip".
 */
export class ExpandableElements {

    public init(): void {
        $('.expandable').each((_, element) => {
            const expandableWidget = $(element);
            const title: string = expandableWidget.data('title');
            expandableWidget.wrapInner('<div class="_expandable-content visible"></div>');
            expandableWidget.prepend(`<div class="_expandable-header"><span>${title}</span></div>`);
            const toggleControl = expandableWidget.find("._expandable-header span");
            toggleControl.on("click", () => this.toggleExpansion(expandableWidget));
        });
    }

    private toggleExpansion(expandableWidget: JQuery<HTMLElement>): void {
        expandableWidget.children().first().toggleClass("collapsed");
        $(expandableWidget.children()[1]).toggleClass("visible");
    }

} // ExpandableElements