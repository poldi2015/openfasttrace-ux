import {CoverType, FilterName, OftState} from "@main/model/oft_state";
import {Filter} from "@main/model/filter";
import {enumIds, enumNames} from "@main/utils/collections";

/**
 * Changed element by a change of the {@link OftState}.
 */
export enum EventType {
    Selection = 0,
    Filters,
    Focus
} // EventType

/**
 * String names of the {@link EventType} values;
 */
export const eventTypeValues: Array<number> = enumNames(EventType);

/**
 * Numeric IDs of the {@link EventType} values;
 */
export const eventTypeIds: Array<number> = enumIds(EventType);

/**
 * Signature of change listeners registered to OftStateController.
 */
export type ChangeListener = (change: ChangeEvent) => void;

export type SelectionChangeHandler = (selection: number | null, oftState: OftState) => void;

export type FocusChangeHandler = (focus: number | null, coverType: CoverType, oftState: OftState) => void;

export type FilterChangeHandler = (filters: Map<FilterName, Filter>, oftState: OftState) => void;

/**
 * Emitted when the state of the OftState changes.
 */
export class ChangeEvent {
    constructor(
        public readonly types: Array<EventType>,
        public readonly oftState: OftState,
    ) {
    }

    /**
     * * Handler is called If selection changed.
     */
    public handleSelectionChange(handler: SelectionChangeHandler) {
        if (this.has(EventType.Selection)) handler(this.oftState.selectedIndex, this.oftState);
    }

    /**
     * Handler is called of focus changed.
     */
    public handleFocusChange(handler: FocusChangeHandler) {
        if (this.has(EventType.Focus)) handler(this.oftState.focusIndex, this.oftState.coverType, this.oftState);
    }

    /**
     * Handler is called when filters changed.
     */
    public handleFilterChange(handler: FilterChangeHandler) {
        if (this.has(EventType.Filters)) handler(this.oftState.selectedFilters, this.oftState);
    }

    /**
     * true of event includes the given eventType.
     */
    public has(eventType: EventType): boolean {
        return this.types.includes(eventType);
    }

} // ChangeEvent
