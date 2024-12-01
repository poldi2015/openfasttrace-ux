import {Filter, FilterName, OftState} from "../model/oft_state";

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
        public selectedFilters: Map<FilterName, Filter>,
    ) {
        super(FilterChangeEvent.TYPE);
    }
} // FilterChangeEvent

type ChangeListener = (change: ChangeEvent) => void;
type SelectionChangeListener = (change: SelectionChangeEvent) => void;

export class OftStateController {
    private changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();

    public constructor(
        private oftState: OftState = new OftState(),
    ) {
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

    public selectFilters(filters: Map<FilterName, Filter>): void {
        filters.forEach((value, key) => this.oftState.selectedFilters.set(key, value));
    }

    public getSelectedFilters(): Map<FilterName, Filter> {
        return this.oftState.selectedFilters;
    }


    //
    // Listeners

    public addChangeListener(eventType: string, listener: ChangeListener): void {
        console.log(`Adding listener ${listener} for eventType: ${eventType}`);
        const listeners: Array<ChangeListener>|undefined = this.changeListeners.has(eventType) ?
            this.changeListeners.get(eventType) : new Array<ChangeListener>();
        listeners!.push(listener);
        this.changeListeners.set(eventType, listeners!);
    }

    public removeChangeListener(listener: Function): void {
        console.log(`Removing listener ${listener}`);
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