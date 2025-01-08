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
import {CoverType, FilterName, OftState} from "@main/model/oft_state";
import {OftStateBuilder} from "./oft_state_builder";
import {Log} from "@main/utils/log";
import {Filter, IndexFilter} from "@main/model/filter";

/**
 * Emitted when the state of the OftState changes.
 */
export class ChangeEvent {
    constructor(
        public readonly type: string
    ) {
    }
}

export interface ChangeEventFactory {
    build(OftState: OftState): ChangeEvent;
}

/**
 * Emitted when the selected SpecItem changes or one SpecItem gets selected or gets unselected (no active selection).
 */
export class SelectionChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "selectionChange";

    constructor(
        public readonly index: number | null,
        public readonly path: Array<string> = [],
        public readonly isFocusItem: boolean = false,
    ) {
        super(SelectionChangeEvent.TYPE);
    }
} // SelectionChangeEvent

class SelectionChangeEventFactory implements ChangeEventFactory {
    build(oftState: OftState): ChangeEvent {
        return new SelectionChangeEvent(oftState.selectedIndex, oftState.selectedPath, false);
    }
} // SelectionChangeEventFactory

/**
 * Emitted when an SpecItem is focused or the currently focused SpecItem changes the coverType.
 */
export class FocusChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "focusChange";

    constructor(
        public readonly index: number | null,
        public readonly coverType: CoverType = CoverType.covering,
        public readonly selectedFilters: Map<FilterName, Filter>,
        public readonly scrollPosition: number | undefined = undefined,
    ) {
        super(FocusChangeEvent.TYPE);
    }
} // FocusChangeEvent

class FocusChangeEventFactory implements ChangeEventFactory {
    build(oftState: OftState): ChangeEvent {
        return new FocusChangeEvent(oftState.focusIndex, oftState.coverType, oftState.selectedFilters, oftState.scrollPosition);
    }
} // FocusChangeEventFactory

/**
 * Emit when active filters are added or removed or changed their value.
 */
export class FilterChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "filterChange";

    constructor(
        public readonly selectedFilters: Map<FilterName, Filter>,
        public readonly selectedIndex: number | null,
    ) {
        super(FilterChangeEvent.TYPE);
    }
} // FilterChangeEvent

class FilterChangeEventFactory implements ChangeEventFactory {
    build(oftState: OftState): ChangeEvent {
        return new FilterChangeEvent(oftState.selectedFilters, oftState.selectedIndex);
    }
} // FilterChangeEventFactory


/**
 * Signature of change listeners registered to OftStateController.
 */
export type ChangeListener = (change: ChangeEvent) => void;


/**
 * This OftStateController stores the global state of the application.
 *
 * When the state changes events of type {@link ChangeEvent} are emitted to all registered listeners.
 */
export class OftStateController {
    public constructor(
        private oftState: OftState = new OftStateBuilder().build(),
    ) {
    }

    private readonly changeEventFactories: Map<string, ChangeEventFactory> = new Map<string, ChangeEventFactory>();
    private changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();

    private log: Log = new Log("OftStateController");

    /**
     * Initialize the OftStateController.
     *
     * Communicates the current state by emitting all change event types to registered listeners.
     */
    public init(): void {
        this.changeEventFactories.set(SelectionChangeEvent.TYPE, new SelectionChangeEventFactory());
        this.changeEventFactories.set(FocusChangeEvent.TYPE, new FocusChangeEventFactory());
        this.changeEventFactories.set(FilterChangeEvent.TYPE, new FilterChangeEventFactory());

        // Bootstrap already connected listeners.
        this.changeEventFactories.forEach((factory: ChangeEventFactory, _: string) => {
            this.notifyChange(factory.build(this.oftState));
        });
    }


    //
    // State

    //
    // selected SpecItem

    public selectItem(index: number, path: Array<string>, scrollPosition: number | undefined = undefined): void {
        this.log.info("Selecting item with index: " + index);
        this.oftState.selectedIndex = index;
        this.oftState.selectedPath = path;
        if (scrollPosition != undefined) this.oftState.scrollPosition = scrollPosition;
        this.notifyChange(new SelectionChangeEvent(index, path));

    }

    public unselectItem(): void {
        this.oftState.selectedIndex = null;
        this.oftState.selectedPath = [];
        this.notifyChange(new SelectionChangeEvent(null, []));
    }

    //
    // FocusItem

    public focusItem(index: number,
                     path: Array<string>,
                     coverType: CoverType,
                     filters: Map<FilterName, Filter> | null = null,
                     scrollPosition: number): void {
        if (this.createFocus(index, path, coverType, filters, scrollPosition) ||
            this.adjustFocus(index, coverType, filters)) {
            this.notifyChange(new FocusChangeEvent(this.oftState.focusIndex, this.oftState.coverType, this.oftState.selectedFilters, undefined));
            this.notifyChange(new SelectionChangeEvent(index, path, true));
        }
    }

    private createFocus(index: number,
                        path: Array<string>,
                        coverType: CoverType,
                        filters: Map<FilterName, Filter> | null = null,
                        scrollPosition: number): boolean {
        if (this.oftState.focusIndex == index) return false;
        this.oftState.focusIndex = index;
        this.oftState.focusPath = path;
        this.oftState.coverType = coverType;
        this.oftState.selectedIndex = null;
        this.oftState.selectedPath = [];
        this.oftState.unfocusedFilters = this.oftState.selectedFilters;
        this.oftState.unfocusedFilters.delete(IndexFilter.FILTER_NAME);
        if (filters != null) this.oftState.selectedFilters = filters;
        this.oftState.scrollPosition = scrollPosition;
        this.log.info("focusing item", this.oftState);
        return true;
    }

    private adjustFocus(index: number,
                        coverType: CoverType,
                        filters: Map<FilterName, Filter> | null = null): boolean {
        if (this.oftState.focusIndex != index) return false;
        this.oftState.coverType = coverType;
        if (filters != null) this.oftState.selectedFilters = filters;
        this.log.info("adjust focus", this.oftState);
        return true;
    }

    public unFocusItem(index: number, path: Array<string>): void {
        if (this.oftState.focusIndex != index) return;
        if (this.oftState.focusIndex == null) return;

        this.oftState.selectedIndex = index;
        this.oftState.selectedPath = path;
        this.oftState.focusIndex = null;
        this.oftState.focusPath = [];
        this.oftState.coverType = CoverType.covering;
        this.log.info("unFocusItem: unfocusedFilters=", this.oftState.unfocusedFilters);
        this.oftState.selectedFilters = this.oftState.unfocusedFilters;
        this.notifyChange(new FocusChangeEvent(this.oftState.focusIndex, this.oftState.coverType, this.oftState.selectedFilters, this.oftState.scrollPosition));
        this.notifyChange(new SelectionChangeEvent(this.oftState.selectedIndex, this.oftState.selectedPath, false));
        this.oftState.scrollPosition = undefined;
    }


    //
    // Filters

    public selectFilters(filters: Map<FilterName, Filter> = new Map()): void {
        filters.forEach((value: Filter, key: FilterName) => {
            this.oftState.selectedFilters.set(key, value)
        });
        this.notifyChange(new FilterChangeEvent(this.oftState.selectedFilters, this.oftState.selectedIndex));
    }

    public getSelectedFilters(): Map<FilterName, Filter> {
        return this.oftState.selectedFilters;
    }


    //
    // Listeners

    public addChangeListener(eventType: string, listener: ChangeListener): void {
        const listeners: Array<ChangeListener> | undefined = this.changeListeners.has(eventType) ?
            this.changeListeners.get(eventType) : new Array<ChangeListener>();
        listeners!.push(listener);
        this.changeListeners.set(eventType, listeners!);
        this.initialChangeEventListenerNotification(eventType, listener);
    }

    public removeChangeListener(listener: ChangeListener): void {
        const changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();
        this.changeListeners.forEach((listeners, eventType, _) => {
            changeListeners.set(eventType, listeners.filter((item) => item != listener));
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

    public initialChangeEventListenerNotification(eventType: string, listener: ChangeListener): void {
        const changeEvent: ChangeEvent | undefined = this.changeEventFactories.get(eventType)?.build(this.oftState);
        if (changeEvent != undefined) listener(changeEvent);
    }

} // OftState