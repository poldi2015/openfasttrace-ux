import {OftState, SelectionChangeEvent} from "../oft_state";

export enum Status {
    Accepted = 0,
    Draft = 1
}

const SELECT_CLASS: string = '_specitem-selected';
const MOUSE_ENTER_CLASS: string = '_specitem-mouse-enter';
const MOUSE_LEAVE_CLASS: string = '_specitem-mouse-leave';

const COVERAGE_LABELS: Array<string> = ["feat", "req", "arch", "dsn", "impl", "utest", "itest"];

export class SpecItemElement {
    private readonly element;
    private parentElement: JQuery | null = null;
    private readonly elementId: string;
    private selected: boolean = false;

    public constructor(
        readonly index: number,
        readonly name: string,
        private readonly content: string,
        private covered: Array<number>,
        private readonly status: Status,
        private path: Array<string> = [],
        private oftState: OftState
    ) {
        this.elementId = SpecItemElement.toElementId(index);
        this.element = this.createTemplate();
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
        this.oftState.addSelectionChangedListener((event) => this.selectionChangeListener(event));
    }

    /**
     * Removes specitem from parentElement.
     */
    public remove(): void {
        if (this.parentElement == null) throw Error('No parentElement');
        this.oftState.removeSelectionChangedListener(this.selectionChangeListener);
        this.parentElement.remove(`#${this.elementId}`);
    }

    /**
     * Show the element as selected or unselected element and communicate selection change to OftState.
     *
     * @param selected true to select element
     * @return true if element is attached to a parent and can be selected
     */
    public select(selected: boolean = false): boolean {
        if (this.parentElement == null) return false;
        if (this.selected == selected) return true;
        this.selected = selected;
        if (selected) {
            this.element.addClass(SELECT_CLASS);
            this.element.removeClass(MOUSE_ENTER_CLASS);
            this.element.removeClass(MOUSE_LEAVE_CLASS);
            this.oftState.selectObject(this.index, this.path);
        } else {
            this.element.removeClass(SELECT_CLASS);
        }
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
        if(!this.selected) {
            this.element.addClass(MOUSE_ENTER_CLASS);
            this.element.removeClass(MOUSE_LEAVE_CLASS);
        }
    }

    private mouseLeave(): void {
        if(!this.selected) {
            this.element.addClass(MOUSE_LEAVE_CLASS);
            this.element.removeClass(MOUSE_ENTER_CLASS);
        }
    }

    private selectionChangeListener(event: SelectionChangeEvent): void {
        // TODO: Move event listener to parent element
        this.select(this.index === event.index);
    }

    private createTemplate(): JQuery {
        const coverageTemplate: string = this.createCoverageTemplate();
        const draft: string = this.createDraftTemplate();

        const template: JQuery = $(`
            <div class="specitem" id="${this.elementId}">
                <div class="_specitem-header">
                    <div class="_specitem-name">[${this.name}]</div>${draft}
                    <div class="_specitem-status">${coverageTemplate}</div>
                </div>
                <div class="_specitem-body">
                    ${this.content}                
                </div>                
            </div>             
        `);
        template.on({
            click: () => this.select(true),
            mouseenter: () => this.mouseEntered(),
            mouseleave: () => this.mouseLeave()
        });
        return template;
    }

    private createCoverageTemplate(): string {
        return COVERAGE_LABELS.map((label: string, index: number): string => {
            switch( this.covered[index] ) {
                case 2: return `<div id="${this.elementId}_cov${index}" class="_specitem-covered">${label}</div>`;
                case 1: return `<div id="${this.elementId}_cov${index}" class="_specitem-uncovered">${label}</div>`;
                default: return `<div id="${this.elementId}_cov${index}" class="_specitem-none">${label}</div>`;
            }
        }).join('');
    }

    private createDraftTemplate(): string {
        return this.status === Status.Draft ? '<div class="_specitem-draft">(Draft)</div>' : '';
    }

} // TObject