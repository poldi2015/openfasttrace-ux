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
import {OftStateController} from "@main/controller/oft_state_controller";
import {FieldFilter, Filter, IndexFilter} from "@main/model/filter";
import {Log} from "@main/utils/log";
import {CoverType, FilterName} from "@main/model/oft_state";
import {SpecItem, STATUS_ACCEPTED_INDEX, STATUS_FIELD_NAMES} from "@main/model/specitems";
import {IField, Project} from "@main/model/project";
import {CopyButtonElement} from "@main/view/copy_button_element";

const SELECT_CLASS: string = '_specitem-selected';
const MOUSE_ENTER_CLASS: string = '_specitem-mouse-enter';
const MOUSE_LEAVE_CLASS: string = '_specitem-mouse-leave';

export class SpecItemElement {
    public constructor(
        readonly specItem: SpecItem,
        protected readonly oftStateController: OftStateController,
        protected readonly project: Project
    ) {
        //this.log.info("constructor", specItem.index);
        this.elementId = SpecItemElement.toElementId(specItem.index);
        //this.log.info("SpecItemElement.constructor", project.getTypeFieldModel());
        const typeFilterModel: IField = project.getTypeFieldModel().fields[this.specItem.type];
        this.typeLabel = typeFilterModel.label ?? typeFilterModel.name ?? typeFilterModel.id;
        this.element = this.createTemplate();
    }

    protected log: Log = new Log("SpecItemElement");

    protected readonly typeLabel: string;
    protected readonly element;
    protected parentElement: JQuery | null = null;
    protected readonly elementId: string;
    protected selected: boolean = false;
    private _isActive: boolean = false;
    private copyButton: CopyButtonElement | null = null;

    /**
     * Inserts the specitem at a specific position into the children of the parentElement.
     *
     * @param parentElement the parentElement to at specitem as child
     * @param index 0 as first element, -1 as last element, other index insert at specific position
     */
    public insertToAt(parentElement: JQuery, index: number = -1): void {
        if (this.parentElement !== null) throw Error('Already attached to parentElement');
        if (index === -1 || parentElement.is(':empty')) {
            parentElement.append(this.element);
        } else if (index === 0) {
            parentElement.find('div:eq(1)').before(this.element);
        } else {
            parentElement.find(`div:eq(${index})`).after(this.element);
        }
        this.parentElement = parentElement;
    }

    /**
     * Removes specitem from parentElement.
     */
    public remove(): void {
        if (this.parentElement == null) throw Error('No parentElement');
        this.parentElement.children(`#${this.elementId}`).remove();
        this._isActive = false;
    }

    public activate(): void {
        if (this.isActive()) return;
        if (this.parentElement == null) throw Error('No parentElement');
        this.element.show();
        this._isActive = true;
    }

    public deactivate(): void {
        if (!this.isActive()) return;
        if (this.parentElement == null) throw Error('No parentElement');
        this.element.hide();
        this._isActive = false;
    }

    /**
     * @return true of the element is not made invisible
     */
    public isActive() {
        return this.parentElement != null && this._isActive;
    }

    public getScrollPosition(): number | undefined {
        if (this.parentElement == null) return undefined;
        const elementOffset: number = this.element!.offset()!.top;
        const parentOffset: number = this.parentElement!.offset()!.top;
        const parentScrollTop: number = this.parentElement!.scrollTop()!;
        return elementOffset - parentOffset + parentScrollTop;
    }

    /**
     * @return the height of the specItem element in pixel
     */
    public getHeight(): number {
        return this.element!.outerHeight(true)!;
    }

    /**
     * Place the selection focus on this item.
     */
    public select(): void {
        this.log.info("selectElement index", this.specItem.index);
        this.selected = true;
        this.element.addClass(SELECT_CLASS);
        this.element.removeClass(MOUSE_ENTER_CLASS);
        this.element.removeClass(MOUSE_LEAVE_CLASS);
    }

    /**
     * Remove selection focus from this item.
     */
    public unselect(): void {
        this.log.info("unselectElement index", this.specItem.index);
        this.selected = false;
        this.element.removeClass(SELECT_CLASS);
    }


    //
    // private members

    /**
     * Dispatches a selection of this element to the OftStateController.
     *
     * @return true if element is attached to a parent and can be selected
     */
    protected notifySelection(): boolean {
        if (!this.isActive()) return false;
        if (this.selected) {
            this.log.info("notifySelection already selected");
            return true;
        }
        this.log.info("notifySelection index", this.specItem.index);
        this.oftStateController.selectItem(this.specItem.index);
        return true;
    }


    /**
     * Set this element as the focus element or switch coverType
     */
    public focus(coverType: CoverType = CoverType.coveredBy): void {
        if (!this.isActive()) return;

        // Filter by covering or coveredBy
        const acceptedIndexes: Array<number> = (() => {
            switch (coverType) {
                case CoverType.covering:
                    // indexes need to have at least on entry to filter out all other indexes. -1 will never match
                    this.log.info("covering ", this.specItem.covering);
                    return this.specItem.covering.length > 0 ? this.specItem.covering : [-1];
                case CoverType.coveredBy:
                    // indexes need to have at least on entry to filter out all other indexes. -1 will never match
                    this.log.info("coveredBy ", this.specItem.coveredBy);
                    return this.specItem.coveredBy.length > 0 ? this.specItem.coveredBy : [-1];
                default:
                    // Default means any: return all items
                    this.log.info("any");
                    return [];
            }
        })();

        this.log.info("notifyFocus index", this.specItem.index, "coverType", coverType, "acceptedIndexes", acceptedIndexes);

        const filters: Map<FilterName, Filter> = new Map([[IndexFilter.FILTER_NAME, new IndexFilter(acceptedIndexes)]]);
        this.oftStateController.focusItem(this.specItem.index, coverType, filters);
    }

    /**
     * Set this element as the focus element and filter by the clicked badge's type
     *
     * @param badgeElement the clicked badge element containing the type index
     */
    protected notifyFocusWithTypeFilter(badgeElement: HTMLElement): void {
        if (!this.isActive()) return;

        const typeIndex = this.extractBatchTypeIndex(badgeElement);

        // Get covering indexes (items that this item covers)
        const acceptedIndexes: Array<number> = this.specItem.coveredBy.length > 0 ? this.specItem.coveredBy : [-1];

        // Create filters: index filter for covering items + type filter for the clicked badge
        const filters: Map<FilterName, Filter> = new Map<FilterName, Filter>();
        filters.set(IndexFilter.FILTER_NAME, new IndexFilter(acceptedIndexes));
        filters.set("type", new FieldFilter("type", [typeIndex], Project.createTypeFieldFilterMatcher()));

        this.log.info("notifyFocusWithTypeFilter index", this.specItem.index, "typeIndex", typeIndex, "acceptedIndexes", acceptedIndexes);

        this.oftStateController.focusItem(this.specItem.index, CoverType.coveredBy, filters);
    }

    /**
     * Extract the type index from the badge element's id attribute
     * id Format: "to_{specItemIndex}_cov{typeIndex}"
     *
     * @param badgeElement The badge element selected (expected that the id has th correct format)
     * @return The extracted specItem type index
     * @private
     */
    private extractBatchTypeIndex(badgeElement: HTMLElement) {
        const badgeId = $(badgeElement).attr('id') as String;
        const typeIndexMatch = badgeId.match(/_cov(\d+)$/) as RegExpMatchArray;
        return parseInt(typeIndexMatch[1], 10);
    }

    private static toElementId(index: number): string {
        return `to_${index.toString()}`;
    }

    private mouseEntered(): void {
        if (!this.selected) {
            this.element.addClass(MOUSE_ENTER_CLASS);
            this.element.removeClass(MOUSE_LEAVE_CLASS);
        }
    }

    private mouseLeave(): void {
        if (!this.selected) {
            this.element.addClass(MOUSE_LEAVE_CLASS);
            this.element.removeClass(MOUSE_ENTER_CLASS);
        }
    }

    protected createTemplate(): JQuery {
        const coverageTemplate: string = this.createCoverageTemplate();
        const draft: string = this.createDraftTemplate();
        const title: string = this.specItem.title != this.specItem.name ? `<b>${this.specItem.title}</b><br><br>` : '';

        const template: JQuery = $(`
            <div class="specitem" id="${this.elementId}">
                <div style="position:relative">    
                    <div class="_specitem-header">
                        <div class="_specitem-name">[${this.specItem.id}]</div>
                        <span class="_copy-btn-sm" title="Copy ID to clipboard">
                            <span class="_img-content-copy"></span>
                        </span>
                        ${draft}
                        <div class="_specitem-status">${coverageTemplate}</div>
                    </div>
                    <div class="_specitem-body">
                        ${title}
                        ${this.specItem.content}                
                    </div>                
                </div>
            </div>             
        `);

        return this.addListenersToTemplate(this.addCopyButton(template));
    }

    protected createCoverageTemplate(): string {
        // Determine overall acceptance status
        const isFullyCovered = this.specItem.uncovered.length === 0;
        const acceptanceBadge = isFullyCovered
            ? `<div class="_specitem-accepted">✓</div>`
            : `<div class="_specitem-rejected">✗</div>`;

        // Generate type-specific coverage badges
        const typeBadges = this.project.getTypeFieldModel().fields
            .map((type: IField, index: number): string => {
                if (index === this.specItem.type) return '';
                else
                switch (this.specItem.covered[index]) {
                    case 3: // MISSING - use red color
                        return `<div id="${this.elementId}_cov${index}" class="_specitem-missing">${type.label}</div>`;
                    case 2: // COVERED - use green color
                        return `<div id="${this.elementId}_cov${index}" class="_specitem-covered">${type.label}</div>`;
                    case 1: // UNCOVERED - use red color
                        return `<div id="${this.elementId}_cov${index}" class="_specitem-uncovered">${type.label}</div>`;
                    default:
                        return '';
                }
            }).join('');

        return acceptanceBadge + typeBadges;
    }

    protected createDraftTemplate(): string {
        const statusName: string | undefined = this.project.getFieldModel(STATUS_FIELD_NAMES[0]).fields[this.specItem.status].name;
        return this.specItem.status != STATUS_ACCEPTED_INDEX && statusName != undefined ?
            `<div class="_specitem-draft">(${statusName})</div>` : '';
    }

    protected addListenersToTemplate(template: JQuery): JQuery {
        // Single click for selection
        template.on({
            click: () => this.notifySelection(),
            dblclick: () => this.focus(), // Double-click to pin/focus
            mouseenter: () => this.mouseEntered(),
            mouseleave: () => this.mouseLeave()
        });

        // Single click on acceptance badge to pin/focus
        template.find('._specitem-accepted, ._specitem-rejected').on({
            click: (e) => {
                e.stopPropagation(); // Prevent triggering parent click
                this.focus();
            }
        });

        // Single click on covered type badges to pin and filter by type
        template.find('._specitem-covered').on({
            click: (e) => {
                e.stopPropagation(); // Prevent triggering parent click
                this.notifyFocusWithTypeFilter(e.currentTarget);
            }
        });

        return template;
    }

    protected addCopyButton(template: JQuery): JQuery {
        this.copyButton = new CopyButtonElement(
            template.find('._copy-btn-sm'),
            () => this.specItem.id
        ).init().activate();
        return template;
    }

} // SpecItemElement
