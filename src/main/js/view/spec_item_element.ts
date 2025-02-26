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
import {Filter, IndexFilter} from "@main/model/filter";
import {Log} from "@main/utils/log";
import {CoverType, FilterName} from "@main/model/oft_state";
import {SpecItem, STATUS_ACCEPTED_INDEX, STATUS_FIELD_NAMES} from "@main/model/specitems";
import {Deferred} from "@main/utils/async";
import {IField, Project} from "@main/model/project";

const SELECT_CLASS: string = '_specitem-selected';
const MOUSE_ENTER_CLASS: string = '_specitem-mouse-enter';
const MOUSE_LEAVE_CLASS: string = '_specitem-mouse-leave';

export class SpecItemElement {
    public constructor(
        readonly specItem: SpecItem,
        protected readonly oftStateController: OftStateController,
        protected readonly project: Project
    ) {
        this.log = new Log("SpecItemElement");
        this.log.info("constructor", specItem.index);
        this.elementId = SpecItemElement.toElementId(specItem.index);
        this.log.info("SpecItemElement.constructor", project.getTypeFieldModel());
        const typeFilterModel: IField = project.getTypeFieldModel()[this.specItem.type];
        this.typeLabel = typeFilterModel.label ?? typeFilterModel.name ?? typeFilterModel.id;
        this.element = this.createTemplate();
    }

    protected readonly typeLabel: string;
    protected readonly element;
    protected parentElement: JQuery | null = null;
    protected readonly elementId: string;
    protected selected: boolean = false;
    private _isActive: boolean = false;

    protected log: Log;

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
     * Place the selection focus on this item.
     */
    public select(): void {
        this.log.info("select", this.specItem.index);
        if (!this.isActive()) return;
        if (this.selected) return;
        this.selected = true;
        this.element.addClass(SELECT_CLASS);
        this.element.removeClass(MOUSE_ENTER_CLASS);
        this.element.removeClass(MOUSE_LEAVE_CLASS);
    }

    /**
     * Remove selection focus from this item.
     */
    public unselect(): void {
        this.log.info("unselect index", this.specItem.index);
        if (!this.isActive()) return;
        if (!this.selected) return;
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
    protected notifyFocus(coverType: CoverType = CoverType.coveredBy): void {
        if (!this.isActive()) return;
        this.log.info("notifyFocus index", this.specItem.index);

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

        const filters: Map<FilterName, Filter> = new Map([[IndexFilter.FILTER_NAME, new IndexFilter(acceptedIndexes)]]);
        this.oftStateController.focusItem(this.specItem.index, coverType, filters);
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
                <div class="_specitem-header">
                    <div class="_specitem-name">[${this.specItem.id}]</div>${draft}
                    <div class="_specitem-status">${coverageTemplate}</div>
                </div>
                <div class="_specitem-body">
                    ${title}
                    ${this.specItem.content}                
                </div>                
            </div>             
        `);

        return this.addListenersToTemplate(template);
    }

    protected createCoverageTemplate(): string {
        return this.project.getTypeFieldModel().map((type: IField, index: number): string => {
            switch (this.specItem.covered[index]) {
                case 2:
                    return `<div id="${this.elementId}_cov${index}" class="_specitem-covered">${type.label}</div>`;
                case 1:
                    return `<div id="${this.elementId}_cov${index}" class="_specitem-uncovered">${type.label}</div>`;
                default:
                    return `<div id="${this.elementId}_cov${index}" class="_specitem-none">${type.label}</div>`;
            }
        }).join('');
    }

    protected createDraftTemplate(): string {
        const statusName: string | undefined = this.project.getFieldModel(STATUS_FIELD_NAMES[0])[this.specItem.status].name;
        return this.specItem.status != STATUS_ACCEPTED_INDEX && statusName != undefined ?
            `<div class="_specitem-draft">(${statusName})</div>` : '';
    }

    protected addListenersToTemplate(template: JQuery): JQuery {
        const deferred = new Deferred(150);
        template.on({
            click: (event: JQuery.ClickEvent) => this.clickListener(deferred, event),
            dblclick: (event: JQuery.DoubleClickEvent) => this.dblClickListener(deferred, event),
            mouseenter: () => this.mouseEntered(),
            mouseleave: () => this.mouseLeave()
        });
        return template;
    }

    private clickListener(deferred: Deferred, event: JQuery.ClickEvent) {
        event.preventDefault();
        deferred.run(() => {
            this.notifySelection();
        });
    }

    private dblClickListener(deferred: Deferred, event: JQuery.DoubleClickEvent) {
        event.preventDefault();
        deferred.cancel();
        this.notifyFocus();
    }

} // TObject