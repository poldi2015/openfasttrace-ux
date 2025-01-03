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
import {CoverType, FilterName, OftState, SelectedFilterIndexes} from "@main/model/oft_state";
import {OftStateBuilder} from "./oft_state_builder";
import {Log} from "@main/utils/log";
import {INDEX_FILTER} from "@main/model/specitems";

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
        public readonly isFocusItem: boolean = false,
    ) {
        super(SelectionChangeEvent.TYPE);
    }
} // SelectionChangeEvent

export class FocusChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "focusChange";

    constructor(
        public readonly index: number | null,
        public readonly coverType: CoverType = CoverType.covering,
        public readonly selectedFilters: Map<FilterName, SelectedFilterIndexes>,
        public readonly scrollPosition: number | undefined = undefined,
    ) {
        super(FocusChangeEvent.TYPE);
    }
} // FocusChangeEvent

export class FilterChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "filterChange";

    constructor(
        public readonly selectedFilters: Map<FilterName, SelectedFilterIndexes>,
    ) {
        super(FilterChangeEvent.TYPE);
    }
} // FilterChangeEvent

export type ChangeListener = (change: ChangeEvent) => void;

export class OftStateController {
    public constructor(
        private oftState: OftState = new OftStateBuilder().build(),
    ) {
    }

    private changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();

    private log: Log = new Log("OftStateController");

    public init(): void {
        this.selectFilters();
    }

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

    public getSelectedItemIndex(): number | null {
        return this.oftState.selectedIndex;
    }

    public getSelectedItemPath(): Array<string> {
        return this.oftState.selectedPath;
    }

    //
    // FocusItem

    public focusItem(index: number,
                     path: Array<string>,
                     coverType: CoverType,
                     filters: Map<FilterName, SelectedFilterIndexes> | null = null,
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
                        filters: Map<FilterName, SelectedFilterIndexes> | null = null,
                        scrollPosition: number): boolean {
        if (this.oftState.focusIndex == index) return false;
        this.oftState.focusIndex = index;
        this.oftState.focusPath = path;
        this.oftState.coverType = coverType;
        this.oftState.selectedIndex = null;
        this.oftState.selectedPath = [];
        this.oftState.unfocusedFilters = this.oftState.selectedFilters;
        this.oftState.unfocusedFilters.delete(INDEX_FILTER);
        if (filters != null) this.oftState.selectedFilters = filters;
        this.oftState.scrollPosition = scrollPosition;
        this.log.info("focusing item", this.oftState);
        return true;
    }

    private adjustFocus(index: number,
                        coverType: CoverType,
                        filters: Map<FilterName, SelectedFilterIndexes> | null = null): boolean {
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

    public selectFilters(filters: Map<FilterName, SelectedFilterIndexes> = new Map()): void {
        filters.forEach((value: SelectedFilterIndexes, key: FilterName) => {
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
        const listeners: Array<ChangeListener> | undefined = this.changeListeners.has(eventType) ?
            this.changeListeners.get(eventType) : new Array<ChangeListener>();
        listeners!.push(listener);
        this.changeListeners.set(eventType, listeners!);
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

} // OftState