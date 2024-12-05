import {
    ChangeEvent,
    ChangeListener,
    OftStateController,
    SelectionChangeEvent,
} from "../controller/oft_state_controller";
import {FilterModel} from "../../resources/js/meta_data";
import {typeIndexToLabel} from "../model/filter";

export enum Status {
    Accepted = 0,
    Draft = 1
}

const SELECT_CLASS: string = '_specitem-selected';
const MOUSE_ENTER_CLASS: string = '_specitem-mouse-enter';
const MOUSE_LEAVE_CLASS: string = '_specitem-mouse-leave';

export class SpecItemElement {
    public constructor(
        readonly index: number,
        readonly type: number,
        readonly name: string,
        readonly version: number,
        private readonly content: string,
        private readonly covered: Array<number>,
        private readonly status: Status,
        private readonly path: Array<string> = [],
        private readonly oftStateController: OftStateController
    ) {
        this.elementId = SpecItemElement.toElementId(index);
        this.element = this.createTemplate();
    }

    private readonly typeLabel: string = typeIndexToLabel(this.type);
    private readonly element;
    private parentElement: JQuery | null = null;
    private readonly elementId: string;
    private selected: boolean = false;

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
        if (index === -1) {
            parentElement.append(this.element);
        } else if (index === 0) {
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
        this.parentElement.remove(`#${this.elementId}`);
    }

    /**
     * Dispatches a selection of this element to the OftStateController.
     *
     * @return true if element is attached to a parent and can be selected
     */
    public select(): boolean {
        if (this.parentElement == null) return false;
        this.oftStateController.selectItem(this.index, this.path);
        return true;
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

    private selectionChangeListener(event: SelectionChangeEvent): void {
        if (this.parentElement == null) return;
        this.selected = this.index === event.index;
        if (this.selected) {
            this.element.addClass(SELECT_CLASS);
            this.element.removeClass(MOUSE_ENTER_CLASS);
            this.element.removeClass(MOUSE_LEAVE_CLASS);
        } else {
            this.element.removeClass(SELECT_CLASS);
        }
    }

    private createTemplate(): JQuery {
        const coverageTemplate: string = this.createCoverageTemplate();
        const draft: string = this.createDraftTemplate();

        const template: JQuery = $(`
            <div class="specitem" id="${this.elementId}">
                <div class="_specitem-header">
                    <div class="_specitem-name">[${this.typeLabel}:${this.name}${this.version > 1 ? ":" + this.version : ""}]</div>${draft}
                    <div class="_specitem-status">${coverageTemplate}</div>
                </div>
                <div class="_specitem-body">
                    ${this.content}                
                </div>                
            </div>             
        `);
        template.on({
            click: () => this.select(),
            mouseenter: () => this.mouseEntered(),
            mouseleave: () => this.mouseLeave()
        });
        return template;
    }

    private createCoverageTemplate(): string {
        const types = window.metadata.types as Array<FilterModel>;
        return types.map((type: FilterModel, index: number): string => {
            switch (this.covered[index]) {
                case 2:
                    return `<div id="${this.elementId}_cov${index}" class="_specitem-covered">${type.label}</div>`;
                case 1:
                    return `<div id="${this.elementId}_cov${index}" class="_specitem-uncovered">${type.label}</div>`;
                default:
                    return `<div id="${this.elementId}_cov${index}" class="_specitem-none">${type.label}</div>`;
            }
        }).join('');
    }

    private createDraftTemplate(): string {
        return this.status === Status.Draft ? '<div class="_specitem-draft">(Draft)</div>' : '';
    }

} // TObject