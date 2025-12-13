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
import {ChangeEvent, ChangeListener, EventType, eventTypeIds} from "@main/model/change_event";
import {OftStateHistory} from "@main/model/oft_state_history";


/**
 * This OftStateController stores the global state of the application.
 *
 * When the state changes events of type {@link ChangeEvent} are emitted to all registered listeners.
 */
export class OftStateController {
    public constructor(
        private readonly oftState: OftState = new OftStateBuilder().build(),
        private readonly oftStateHistory = new OftStateHistory(),
    ) {
    }

    private changeListeners: Map<EventType, Array<ChangeListener>> = new Map<EventType, Array<ChangeListener>>();
    private isInitialized: boolean = false;

    private log: Log = new Log("OftStateController");

    /**
     * Initialize the OftStateController.
     *
     * Communicates the current state by emitting all change event types to registered listeners.
     */
    public init(): void {
        const initialChangeEvent: ChangeEvent = this.createChangeEvent(EventType.Selection, EventType.Filters, EventType.Focus);
        this.oftStateHistory.init(initialChangeEvent);
        this.sendChangeEvent(initialChangeEvent); // Bootstrap already connected listeners.
        this.isInitialized = true;
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
     * @param index the index of a not filtered item or empty to scroll to the current selection
     */
    public selectItem(index: number | null = this.oftState.selectedIndex): void {
        this.log.info("selectItem ", index);
        if (index != this.oftState.selectedIndex) {
            this.oftState.selectedIndex = index;
            this.notifyChangeWithHistory(EventType.Selection);
        } else {
            // Just trigger scrolling to the current index
            this.notifyChangeWithoutHistory(EventType.Selection);
        }
    }

    /**
     * Changes selection snd scroll to the selected item ensuring that item can be shown by disabling filters.
     *
     * @param index the new selection
     */
    public selectAndShowItem(index: number): void {
        this.log.info("selectAndShowItem", index);
        if (index != this.oftState.focusIndex) {
            // Disable filters if item is not the focused one which is always visible.
            this.oftState.selectedFilters.clear();
        }
        if (this.oftState.selectedIndex != index) {
            this.oftState.selectedIndex = index;
            this.oftState.selectedFilters = new Map<FilterName, Filter>();
            this.notifyChangeWithHistory(EventType.Selection, EventType.Filters);
        } else {
            this.notifyChangeWithoutHistory(EventType.Selection);
        }
    }

    /**
     * Removes the current selection if there is one.
     */
    public unselectItem(): void {
        this.log.info("unselectItem", this.oftState.selectedIndex);
        if (this.oftState.selectedIndex == null) return;
        this.oftState.selectedIndex = null;
        this.notifyChangeWithoutHistory(EventType.Selection);
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
        if (this.activateFocus(index, coverType, filters) ||
            this.adjustFocus(index, coverType, filters)) {
            this.notifyChangeWithHistory(EventType.Selection, EventType.Focus, EventType.Filters);
        }
    }

    private activateFocus(index: number,
                        coverType: CoverType,
                        filters: Map<FilterName, Filter> | null = null): boolean {
        if (this.oftState.focusIndex == index) return false;
        this.oftState.focusIndex = index;
        this.oftState.coverType = coverType;
        this.oftState.selectedIndex = index;
        this.oftState.unfocusedFilters = this.oftState.selectedFilters;
        this.oftState.unfocusedFilters.delete(IndexFilter.FILTER_NAME);
        if (filters != null) this.oftState.selectedFilters = filters;
        this.log.info("activateFocus", this.oftState);
        return true;
    }

    private adjustFocus(index: number,
                        coverType: CoverType,
                        filters: Map<FilterName, Filter> | null = null): boolean {
        if (this.oftState.focusIndex != index) return false;
        this.oftState.selectedIndex = index;
        this.oftState.coverType = coverType;
        if (filters != null) {
            filters.forEach((value: Filter, key: FilterName) => {
                this.oftState.selectedFilters.set(key, value)
            });
        }
        this.log.info("adjustFocus", this.oftState);
        return true;
    }

    public unFocusItem(index: number): void {
        this.log.info("unfocusItem", index);
        if (this.oftState.focusIndex != index) return;
        if (this.oftState.focusIndex == null) return;

        this.oftState.selectedIndex = index;
        this.oftState.focusIndex = null;
        this.oftState.coverType = CoverType.covering;
        this.log.info("unFocusItem: index=", index, "filters=", this.oftState.unfocusedFilters);
        this.oftState.selectedFilters = this.oftState.unfocusedFilters;
        this.oftState.unfocusedFilters = new Map();
        this.notifyChangeWithHistory(EventType.Focus, EventType.Filters, EventType.Selection);
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
        this.log.info("selectFilters filters", filters);
        if (filters.size > 0) {
            filters.forEach((value: Filter, key: FilterName) => {
                this.oftState.selectedFilters.set(key, value);
            });
            this.log.info("selectFilters oftState.", this.oftState.selectedFilters);
            // Selection is needed for switch to previous state as filter may void the selection
            this.notifyChangeWithHistory(EventType.Filters, EventType.Selection);
        } else {
            // Selection is needed for switch to previous state as filter may void the selection
            this.notifyChangeWithoutHistory(EventType.Filters, EventType.Selection);
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
            this.notifyChangeWithHistory(EventType.Filters);
        } else {
            this.notifyChangeWithoutHistory(EventType.Filters);
        }
    }


    //
    // History

    /**
     * switch the state to the previous (older) state.
     */
    public toPreviousState(): void {
        this.log.info("toPreviousState");
        const changeEvent: ChangeEvent | null = this.oftStateHistory.toPreviousState();
        if (changeEvent == null) return;
        this.oftState.copyFrom(changeEvent.oftState);
        this.sendChangeEvent(changeEvent);
    }

    /**
     * switch the state to the next (newer) state.
     */
    public toNextState() {
        this.log.info("toNextState");
        const changeEvent: ChangeEvent | null = this.oftStateHistory.toNextState();
        if (changeEvent == null) return;
        this.oftState.copyFrom(changeEvent.oftState);
        this.sendChangeEvent(changeEvent);
    }


    //
    // Listeners

    /**
     * Adds a new listener for listening to state changes.
     *
     * Send an initial event
     *
     * @param eventTypes the type of the event
     * @param listener the listener
     * // TODO remove eventTypes
     */
    public addChangeListener(listener: ChangeListener, ...eventTypes: Array<EventType>): void {
        eventTypes.forEach((eventType: EventType) => {
            const listeners: Array<ChangeListener> | undefined = this.changeListeners.has(eventType) ?
                this.changeListeners.get(eventType) : new Array<ChangeListener>();
            listeners!.push(listener);
            this.changeListeners.set(eventType, listeners!);
        });
        this.initializeListener(listener);
    }

    /**
     * Sends a change event to a newly added listener with all event types when listener is added after initialization.
     *
     * @param listener the listener to inform
     */
    private initializeListener(listener: ChangeListener): void {
        if (!this.isInitialized) return;
        listener(new ChangeEvent(eventTypeIds, this.oftState.clone()));
    }

    /**
     * Removes a listener from the list of registered listeners.
     *
     * @param listener The listener to remove
     */
    public removeChangeListener(listener: ChangeListener): void {
        const changeListeners: Map<EventType, Array<ChangeListener>> = new Map();
        this.changeListeners.forEach((listeners, eventTypes, _) => {
            changeListeners.set(eventTypes, listeners.filter((item) => item != listener));
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
    private notifyChangeWithHistory(...eventTypes: Array<EventType>): void {
        this.log.info("notifyChangeWithHistory", ...eventTypes);
        const changeEvent: ChangeEvent = this.oftStateHistory.pushEvent(this.createChangeEvent(...eventTypes));
        this.sendChangeEvent(changeEvent);
    }

    /**
     * Sends events to all listeners without putting the state change to the history.
     *
     * @param eventTypes the types of event to issue
     */
    private notifyChangeWithoutHistory(...eventTypes: Array<EventType>): void {
        this.log.info("notifyChangeWithoutHistory", ...eventTypes);
        const changeEvent: ChangeEvent = this.createChangeEvent(...eventTypes);
        this.sendChangeEvent(changeEvent);
    }

    /**
     * Creates an instance of {@link EventType} initialized with the current state and the given list of event types.
     *
     * @param eventTypes list of event types or empty if all event types should be used
     * @return A {@link ChangeEvent}
     */
    public createChangeEvent(...eventTypes: Array<EventType>): ChangeEvent {
        const types: Array<EventType> = eventTypes.length == 0 ? eventTypeIds : Array.of(...eventTypes);
        return new ChangeEvent(types, this.oftState.clone());
    }

    /**
     * send event to all listeners.
     *
     * @param changeEvent The event to send
     */
    private sendChangeEvent(changeEvent: ChangeEvent): void {
        this.log.info("sendChangeEvent", changeEvent);
        const listeners: Set<ChangeListener> = new Set(
            Array.of(...this.changeListeners)
                .filter(([eventType, _]: [EventType, Array<ChangeListener>]) => changeEvent.types.includes(eventType))
                .flatMap(([_, listener]: [EventType, Array<ChangeListener>]) => listener)
        );

        listeners.forEach((listener: ChangeListener) => listener(changeEvent));
    }

} // OftState