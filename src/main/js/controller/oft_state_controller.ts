import {SelectedFilterIndexes, FilterName, OftState} from "@main/model/oft_state";
import {OftStateBuilder} from "./oft_state_builder";

export class ChangeEvent {
    constructor(
        public readonly type: string
    ) {
    }
}

export class SelectionChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "selectionChange";

    constructor(
        public readonly index: number | null,
        public readonly path: Array<string> = [],
    ) {
        super(SelectionChangeEvent.TYPE);
    }
} // SelectionChangeEvent

export class FilterChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "filterChange";

    constructor(
        public selectedFilters: Map<FilterName, SelectedFilterIndexes>,
    ) {
        super(FilterChangeEvent.TYPE);
    }
} // FilterChangeEvent

export type ChangeListener = (change: ChangeEvent) => void;

export class OftStateController {
    private changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();

    public constructor(
        private oftState: OftState = new OftStateBuilder().build(),
    ) {
    }

    public init() : void {
        this.selectFilters();
    }

    //
    // selected SpecItem

    public selectItem(index: number, path: Array<string>): void {
        this.oftState.selectedIndex = index;
        this.oftState.selectedPath = path;
        this.notifyChange(new SelectionChangeEvent(index, path));

    }

    public unselectItem(): void {
        this.oftState.selectedIndex = null;
        this.oftState.selectedPath = [];
        this.notifyChange(new SelectionChangeEvent(null, []));
    }

    public getSelectedItemIndex(): number | null {
        return this.oftState.selectedIndex;
    }

    public getSelectedItemPath(): Array<string> {
        return this.oftState.selectedPath;
    }


    //
    // Filters

    public selectFilters(filters: Map<FilterName, SelectedFilterIndexes> = new Map()): void {
        filters.forEach((value:SelectedFilterIndexes, key:FilterName) => {
            this.oftState.selectedFilters.set(key, value)
        });
        this.notifyChange(new FilterChangeEvent(this.oftState.selectedFilters));
    }

    public getSelectedFilters(): Map<FilterName, SelectedFilterIndexes> {
        return this.oftState.selectedFilters;
    }


    //
    // Listeners

    public addChangeListener(eventType: string, listener: ChangeListener): void {
        const listeners: Array<ChangeListener>|undefined = this.changeListeners.has(eventType) ?
            this.changeListeners.get(eventType) : new Array<ChangeListener>();
        listeners!.push(listener);
        this.changeListeners.set(eventType, listeners!);
    }

    public removeChangeListener(listener: ChangeListener): void {
        const changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();
        this.changeListeners.forEach((listeners,eventType,_) => {
            changeListeners.set( eventType, listeners.filter((item) => item != listener));
        });
        this.changeListeners = changeListeners;
    }

    //
    // private

    private notifyChange(changeEvent: ChangeEvent): void {
        this.changeListeners.get(changeEvent.type)?.forEach((listener: ChangeListener) => {
            listener(changeEvent);
        })
    }

} // OftState