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
import {
    ChangeEvent,
    ChangeListener,
    OftStateController,
    SelectionChangeEvent,
} from "@main/controller/oft_state_controller";
import {FilterModel} from "@resources/js/meta_data";
import {typeIndexToLabel} from "@main/model/filter";
import {Log} from "@main/utils/log";
import {CoverType, FilterName, SelectedFilterIndexes} from "@main/model/oft_state";
import {INDEX_FILTER, SpecItem} from "@main/model/specitems";

export enum Status {
    Accepted = 0,
    Draft = 1
}

const SELECT_CLASS: string = '_specitem-selected';
const MOUSE_ENTER_CLASS: string = '_specitem-mouse-enter';
const MOUSE_LEAVE_CLASS: string = '_specitem-mouse-leave';

export class SpecItemElement {
    public constructor(
        readonly specItem: SpecItem,
        protected readonly oftStateController: OftStateController
    ) {
        this.elementId = SpecItemElement.toElementId(specItem.index);
        this.element = this.createTemplate();
    }

    protected readonly typeLabel: string = typeIndexToLabel(this.specItem.type);
    protected readonly element;
    protected parentElement: JQuery | null = null;
    protected readonly elementId: string;
    protected selected: boolean = false;

    protected log: Log = new Log("SpecItemElement");

    private changeListener: ChangeListener = (event: ChangeEvent): void => {
        this.selectionChangeListener(event as SelectionChangeEvent);
    }

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
            this.log.info(`Add ${this.specItem.name} as first element`);
            parentElement.find('div:eq(1)').before(this.element);
        } else {
            parentElement.find(`div:eq(${index})`).after(this.element);
        }
        this.parentElement = parentElement;
        this.oftStateController.addChangeListener(SelectionChangeEvent.TYPE, this.changeListener);
    }

    public deactivate(): void {
        if (this.parentElement == null) throw Error('No parentElement');
        this.oftStateController.removeChangeListener(this.changeListener);
        this.element.hide();
    }

    public activate(): void {
        if (this.parentElement == null) throw Error('No parentElement');
        this.oftStateController.addChangeListener(SelectionChangeEvent.TYPE, this.changeListener);
        this.element.show();
    }

    /**
     * Removes specitem from parentElement.
     */
    public remove(): void {
        if (this.parentElement == null) throw Error('No parentElement');
        this.oftStateController.removeChangeListener(this.changeListener);
        this.parentElement.children(`#${this.elementId}`).remove();
        this.oftStateController.removeChangeListener(this.changeListener);
    }

    /**
     * Dispatches a selection of this element to the OftStateController.
     *
     * @return true if element is attached to a parent and can be selected
     */
    public select(): boolean {
        this.log.info("select ", this.specItem.index, " ", this.specItem.path);
        if (this.parentElement == null) return false;
        this.oftStateController.selectItem(this.specItem.index, this.specItem.path, this.parentElement.scrollTop());
        return true;
    }

    /**
     * Set this element as the focus element.
     */
    public focus(coverType: CoverType = CoverType.coveredBy): void {
        if (this.parentElement == null) return;
        this.log.info("Focus filters ", this.specItem);

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

        const filters: Map<FilterName, SelectedFilterIndexes> = new Map([[INDEX_FILTER, acceptedIndexes]]);
        this.oftStateController.focusItem(this.specItem.index, this.specItem.path, CoverType.coveredBy, filters, this.parentElement.scrollTop()!!);
    }

    private static toElementId(index: number): string {
        return `to_${index.toString()}`;
    }

    public getElementId(): string {
        return this.elementId;
    }

    //
    // private members

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

    protected selectionChangeListener(event: SelectionChangeEvent): void {
        if (this.parentElement == null) return;
        this.selected = this.specItem.index == event.index;
        if (this.selected) {
            this.element.addClass(SELECT_CLASS);
            this.element.removeClass(MOUSE_ENTER_CLASS);
            this.element.removeClass(MOUSE_LEAVE_CLASS);
        } else {
            this.element.removeClass(SELECT_CLASS);
        }
    }

    protected createTemplate(): JQuery {
        const coverageTemplate: string = this.createCoverageTemplate();
        const draft: string = this.createDraftTemplate();
        const template: JQuery = $(`
            <div class="specitem" id="${this.elementId}">
                <div class="_specitem-header">
                    <div class="_specitem-name">[${this.typeLabel}:${this.specItem.name}${this.specItem.version > 1 ? ":" + this.specItem.version : ""}]</div>${draft}
                    <div class="_specitem-status">${coverageTemplate}</div>
                </div>
                <div class="_specitem-body">
                    ${this.specItem.content}                
                </div>                
            </div>             
        `);

        return this.addListenersToTemplate(template);
    }

    protected createCoverageTemplate(): string {
        const types = window.metadata.types as Array<FilterModel>;
        return types.map((type: FilterModel, index: number): string => {
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
        return this.specItem.status === Status.Draft ? '<div class="_specitem-draft">(Draft)</div>' : '';
    }

    protected addListenersToTemplate(template: JQuery): JQuery {
        template.on({
            click: () => {
                if (!this.selected) {
                    this.log.info("Selecting");
                    this.select();
                } else {
                    this.log.info("Already selected");
                }
            },
            dblclick: () => this.focus(),
            mouseenter: () => this.mouseEntered(),
            mouseleave: () => this.mouseLeave()
        });
        return template;
    }

} // TObject