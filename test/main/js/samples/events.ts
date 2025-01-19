import {ChangeEvent, EventType} from "@main/model/change_event";
import {CoverType, FilterName, OftState} from "@main/model/oft_state";
import {Filter, SelectionFilter} from "@main/model/filter";
import {HistoryItem} from "@main/model/oft_state_history";

/**
 * Creates a sample {@link ChangeEvent} with an empty {@link OftState}.
 *
 * @param types list of {@link EventType}s.
 */
export function createEvent(...types: Array<EventType>): ChangeEvent {
    return new ChangeEvent(types, new OftState());
}

/**
 * Creates a sample {@link ChangeEvent} with a given OftState.
 *
 * @param oftState OftState of the event
 * @param types list of {@link EventType}s.
 */
export function createEventWithState(oftState: OftState, ...types: Array<EventType>): ChangeEvent {
    return new ChangeEvent(types, oftState);
}

export function createFilter(type: string, filter: Filter): Map<FilterName, Filter> {
    return new Map<FilterName, Filter>([[type, filter]]);
}

/**
 * Creates a history including {@link sampleChangeEventSelection1}, {@link sampleChangeEventFilter1}, {@link sampleChangeEventFocus1}, {@link sampleChangeEventSelection2}
 */
export function createSampleHistory(): Array<HistoryItem> {
    return [
        new HistoryItem(sampleChangeEventSelection1),
        new HistoryItem(sampleChangeEventFilter1),
        new HistoryItem(sampleChangeEventFocus1),
        new HistoryItem(sampleChangeEventSelection2)
    ];
}

export const sampleSelectionState1: OftState = new OftState(1);
export const sampleSelectionState2: OftState = new OftState(2);
export const sampleFilterState1: OftState = new OftState(2, createFilter("Type", new SelectionFilter("Type", [1, 3])));
export const sampleFocusState1: OftState = new OftState(null, new Map(), 2, createFilter("Type", new SelectionFilter("Type", [1, 3])), CoverType.covering);
export const sampleChangeEventSelection1: ChangeEvent = createEventWithState(sampleSelectionState1, EventType.Selection);
export const sampleChangeEventSelection2: ChangeEvent = createEventWithState(sampleSelectionState2, EventType.Selection);
export const sampleChangeEventFilter1: ChangeEvent = createEventWithState(sampleFilterState1, EventType.Filters);
export const sampleChangeEventFocus1: ChangeEvent = createEventWithState(sampleFocusState1, EventType.Focus);

