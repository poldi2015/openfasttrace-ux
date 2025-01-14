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
import {
    ChangeEvent,
    ChangeEventFactory,
    ChangeListener,
    FilterChangeEvent,
    FocusChangeEvent,
    SelectionChangeEvent
} from "@main/model/change_event";
import {HistoryItem, OftStateHistory} from "@main/model/oft_state_history";


/**
 * This OftStateController stores the global state of the application.
 *
 * When the state changes events of type {@link ChangeEvent} are emitted to all registered listeners.
 */
export class OftStateController {
    public constructor(
        private readonly oftState: OftState = new OftStateBuilder().build(),
        private readonly oftStateHistory = new OftStateHistory(),
        private readonly changeEventFactories: Map<string, ChangeEventFactory> = ChangeEventFactory.createEventFactories()
    ) {
    }

    private changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();

    private log: Log = new Log("OftStateController");

    /**
     * Initialize the OftStateController.
     *
     * Communicates the current state by emitting all change event types to registered listeners.
     */
    public init(): void {
        // Bootstrap already connected listeners.
        this.oftStateHistory.init(this.oftState, this.changeEventFactories);
        this.changeEventFactories.forEach((factory: ChangeEventFactory, _: string) => {
            this.sendChangeEvent(factory.build(this.oftState));
        });
    }


    //
    // State

    //
    // selected SpecItem

    /**
     * Changes the selection to the given index.
     *
     * This method must only be called when it can be ensured that the given indexed item is not filtered out.
     *
     * @param index the index of a not filtered item.
     */
    public selectItem(index: number): void {
        this.log.info("Selecting item with index: " + index);
        if (index != this.oftState.selectedIndex) {
            this.oftState.selectedIndex = index;
            this.notifyChange(SelectionChangeEvent.TYPE);
        } else {
            // Just trigger scrolling to the current index
            this.notifyChangeWithoutHistory(SelectionChangeEvent.TYPE);
        }
    }

    /**
     * scrolls to the selected item when one is selected.
     *
     * State is not changed.
     */
    public showSelectedItem() {
        if (this.oftState.selectedIndex == null) return;
        this.log.info("showSelectedItem", this.oftState.selectedIndex);
        this.notifyChangeWithoutHistory(SelectionChangeEvent.TYPE);
    }

    /**
     * Changes selection snd scroll to the selected item ensuring that item can be shown by disabling filters.
     *
     * @param index the new selection
     */
    public selectAndShow(index: number): void {
        this.log.info("Selecting item with index: " + index);
        if (index != this.oftState.focusIndex) {
            // Disable filters if item is not the focused one which is always visible.
            this.oftState.selectedFilters.clear();
        }
        if (this.oftState.selectedIndex != index) {
            this.oftState.selectedIndex = index;
            this.notifyChange(FilterChangeEvent.TYPE);
        } else {
            this.notifyChangeWithoutHistory(FilterChangeEvent.TYPE);
        }
    }

    /**
     * Removes the current selection if there is one.
     */
    public unselectItem(): void {
        this.log.info("unselectItem", this.oftState.selectedIndex);
        if (this.oftState.selectedIndex != null) {
            this.oftState.selectedIndex = null;
            this.notifyChange(SelectionChangeEvent.TYPE);
        } else {
            this.notifyChangeWithoutHistory(SelectionChangeEvent.TYPE);
        }
    }

    //
    // FocusItem

    /**
     * Focus and item or change the coverage of a focused item.
     *
     * @param index the focus
     * @param coverType The type of the focus
     * @param filters Filter for non focused elements
     */
    public focusItem(index: number,
                     coverType: CoverType,
                     filters: Map<FilterName, Filter> | null = null): void {
        this.log.info("focusItem", index);
        if (this.createFocus(index, coverType, filters) ||
            this.adjustFocus(index, coverType, filters)) {
            this.notifyChange(FocusChangeEvent.TYPE, SelectionChangeEvent.TYPE);
        }
    }

    private createFocus(index: number,
                        coverType: CoverType,
                        filters: Map<FilterName, Filter> | null = null): boolean {
        if (this.oftState.focusIndex == index) return false;
        this.oftState.focusIndex = index;
        this.oftState.coverType = coverType;
        this.oftState.selectedIndex = null;
        this.oftState.unfocusedFilters = this.oftState.selectedFilters;
        this.oftState.unfocusedFilters.delete(IndexFilter.FILTER_NAME);
        if (filters != null) this.oftState.selectedFilters = filters;
        this.log.info("focusing item", this.oftState);
        return true;
    }

    private adjustFocus(index: number,
                        coverType: CoverType,
                        filters: Map<FilterName, Filter> | null = null): boolean {
        if (this.oftState.focusIndex != index) return false;
        this.oftState.coverType = coverType;
        if (filters != null) {
            filters.forEach((value: Filter, key: FilterName) => {
                this.oftState.selectedFilters.set(key, value)
            });
        }
        this.log.info("adjust focus", this.oftState);
        return true;
    }

    public unFocusItem(index: number): void {
        this.log.info("unfocusItem", index);
        if (this.oftState.focusIndex != index) return;
        if (this.oftState.focusIndex == null) return;

        this.oftState.selectedIndex = index;
        this.oftState.focusIndex = null;
        this.oftState.coverType = CoverType.covering;
        this.log.info("unFocusItem: unfocusedFilters=", this.oftState.unfocusedFilters);
        this.oftState.selectedFilters = this.oftState.unfocusedFilters;
        this.notifyChange(FocusChangeEvent.TYPE, SelectionChangeEvent.TYPE);
    }


    //
    // Filters

    /**
     * Changes or appends filters to he existing filter list.
     *
     * Even triggers a change event even if no filters changed.
     *
     * @param filters the filters to change or add
     */
    public selectFilters(filters: Map<FilterName, Filter> = new Map()): void {
        if (filters.size > 0) {
            filters.forEach((value: Filter, key: FilterName) => {
                this.oftState.selectedFilters.set(key, value);
            });
            this.notifyChange(FilterChangeEvent.TYPE);
        } else {
            this.notifyChangeWithoutHistory(FilterChangeEvent.TYPE);
        }
    }

    /**
     * Resets all filters to not filtering.
     *
     * Even triggers a change event even if no filters changed.
     */
    public clearFilters() {
        if (this.oftState.selectedFilters.size > 0) {
            this.oftState.selectedFilters.clear();
            this.notifyChange(FilterChangeEvent.TYPE);
        } else {
            this.notifyChangeWithoutHistory(FilterChangeEvent.TYPE);
        }
    }


    public getSelectedFilters(): Map<FilterName, Filter> {
        return this.oftState.selectedFilters;
    }

    //
    // History

    /**
     * switch the state to the previous (older) state.
     */
    public toPreviousState() {
        const historyItem: HistoryItem = this.oftStateHistory.toPreviousState();
        historyItem.changeEvents.forEach((changeEvent: ChangeEvent) => this.sendChangeEvent(changeEvent));
    }

    /**
     * switch the state to the next (newer) state.
     */
    public toNextState() {
        const historyItem: HistoryItem = this.oftStateHistory.toNextState();
        historyItem.changeEvents.forEach((changeEvent: ChangeEvent) => this.sendChangeEvent(changeEvent));
    }


    //
    // Listeners

    /**
     * Adds a new listener for listening to state changes.
     *
     * Send an initial event
     *
     * @param eventType the type of the event
     * @param listener the listener
     */
    public addChangeListener(eventType: string, listener: ChangeListener): void {
        const listeners: Array<ChangeListener> | undefined = this.changeListeners.has(eventType) ?
            this.changeListeners.get(eventType) : new Array<ChangeListener>();
        listeners!.push(listener);
        this.changeListeners.set(eventType, listeners!);
        this.initialChangeEventListenerNotification(eventType, listener);
    }

    /**
     * Removes a listener from the list of registered listeners.
     *
     * @param listener The listener to remove
     */
    public removeChangeListener(listener: ChangeListener): void {
        const changeListeners: Map<string, Array<ChangeListener>> = new Map<string, Array<ChangeListener>>();
        this.changeListeners.forEach((listeners, eventType, _) => {
            changeListeners.set(eventType, listeners.filter((item) => item != listener));
        });
        this.changeListeners = changeListeners;
    }

    //
    // private

    /**
     * Send change events to all listeners and put the current state to the history of state changes.
     *
     * @param eventTypes The events to be issued.
     */
    private notifyChange(...eventTypes: Array<string>): void {
        this.log.info("notifyChange", ...eventTypes);
        const historyItem: HistoryItem = this.oftStateHistory.pushState(eventTypes, this.oftState);
        historyItem.changeEvents.forEach((changeEvent: ChangeEvent) => this.sendChangeEvent(changeEvent));
    }

    /**
     * Sends events to all listeners without putting the state change to the history.
     *
     * @param eventTypes the types of event to issue
     */
    private notifyChangeWithoutHistory(...eventTypes: Array<string>): void {
        this.log.info("notifyChangeWithoutHistory", ...eventTypes);
        eventTypes.forEach((eventType: string) => {
            const changeEvent: ChangeEvent = this.changeEventFactories.get(eventType)!.build(this.oftState);
            this.sendChangeEvent(changeEvent);
        });
    }

    /**
     * send event to all listeners.
     *
     * @param changeEvent The event to send
     */
    private sendChangeEvent(changeEvent: ChangeEvent): void {
        this.log.info("sendChangeEvent", changeEvent);
        this.changeListeners.get(changeEvent.type)?.forEach((listener: ChangeListener) => {
            listener(changeEvent);
        })
    }

    /**
     * Send initial event when listener is added.
     *
     * @param eventType the event to send
     * @param listener the listener to inform
     */
    public initialChangeEventListenerNotification(eventType: string, listener: ChangeListener): void {
        const changeEvent: ChangeEvent | undefined = this.changeEventFactories.get(eventType)?.build(this.oftState);
        if (changeEvent != undefined) listener(changeEvent);
    }

} // OftState