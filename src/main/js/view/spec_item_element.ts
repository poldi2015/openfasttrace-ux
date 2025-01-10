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
import {Filter, FilterModel, IndexFilter} from "@main/model/filter";
import {Log} from "@main/utils/log";
import {CoverType, FilterName} from "@main/model/oft_state";
import {SpecItem, SpecItemStatus} from "@main/model/specitems";

const SELECT_CLASS: string = '_specitem-selected';
const MOUSE_ENTER_CLASS: string = '_specitem-mouse-enter';
const MOUSE_LEAVE_CLASS: string = '_specitem-mouse-leave';

export class SpecItemElement {
    public constructor(
        readonly specItem: SpecItem,
        protected readonly oftStateController: OftStateController,
        protected readonly typeFilterModels: Array<FilterModel>
    ) {
        this.elementId = SpecItemElement.toElementId(specItem.index);
        const typeFilterModel: FilterModel = typeFilterModels[this.specItem.type];
        this.typeLabel = typeFilterModel.label ?? typeFilterModel.name;
        this.element = this.createTemplate();
    }

    protected readonly typeLabel: string;
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

    public deactivate(): void {
        if (this.parentElement == null) throw Error('No parentElement');
        this.oftStateController.removeChangeListener(this.changeListener);
        this.element.hide();
    }

    /**
     * @return true of the element is not made invisible
     */
    public isActive() {
        return this.parentElement != null && this.element.is(':visible');
    }

    public getScrollPosition(): number | undefined {
        if (this.parentElement == null) return undefined;
        const elementOffset: number = this.element!.offset()!.top;
        const parentOffset: number = this.parentElement!.offset()!.top;
        const parentScrollTop: number = this.parentElement!.scrollTop()!;
        return elementOffset - parentOffset + parentScrollTop;
    }

    /**
     * Dispatches a selection of this element to the OftStateController.
     *
     * @return true if element is attached to a parent and can be selected
     */
    public select(): boolean {
        this.log.info("select ", this.specItem.index, " ", this.specItem.path);
        if (this.parentElement == null) return false;
        this.oftStateController.selectItem(this.specItem.index);
        return true;
    }


    //
    // private members


    /**
     * Set this element as the focus element.
     */
    protected focus(coverType: CoverType = CoverType.coveredBy): void {
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

        const filters: Map<FilterName, Filter> = new Map([[IndexFilter.FILTER_NAME, new IndexFilter(acceptedIndexes)]]);
        this.oftStateController.focusItem(this.specItem.index, CoverType.coveredBy, filters);
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
        return this.typeFilterModels.map((type: FilterModel, index: number): string => {
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
        return this.specItem.status === SpecItemStatus.Draft ? '<div class="_specitem-draft">(Draft)</div>' : '';
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