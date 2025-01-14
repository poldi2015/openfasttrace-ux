import {CoverType, FilterName, OftState} from "@main/model/oft_state";
import {Filter} from "@main/model/filter";

/**
 * Emitted when the state of the OftState changes.
 */
export class ChangeEvent {
    constructor(
        public readonly type: string
    ) {
    }
} // ChangeEvent

/**
 * Type agnostic {@link ChangeEvent} factory.
 */
export abstract class ChangeEventFactory {

    /**
     * Build an event for the given state.
     *
     * @param OftState The state that provides the values of the event
     */
    public abstract build(OftState: OftState): ChangeEvent;

    /**
     * @return The type of the event
     */
    public abstract getType(): string;

    public static createEventFactories(): Map<string, ChangeEventFactory> {
        return new Map<string, ChangeEventFactory>([
            [SelectionChangeEvent.TYPE, new SelectionChangeEventFactory()],
            [FocusChangeEvent.TYPE, new FocusChangeEventFactory()],
            [FilterChangeEvent.TYPE, new FilterChangeEventFactory()],
        ]);
    }
} // ChangeEventFactory

/**
 * Emitted when the selected SpecItem changes or one SpecItem gets selected or gets unselected (no active selection).
 */
export class SelectionChangeEvent extends ChangeEvent {
    public static readonly TYPE: string = "selectionChange";

    constructor(
        public readonly index: number | null,
        public readonly isFocusItem: boolean = false,
    ) {
        super(SelectionChangeEvent.TYPE);
    }
} // SelectionChangeEvent

export class SelectionChangeEventFactory implements ChangeEventFactory {
    build(oftState: OftState): ChangeEvent {
        if (oftState.isFocusSelected()) {
            return new SelectionChangeEvent(oftState.focusIndex, true);
        } else {
            return new SelectionChangeEvent(oftState.selectedIndex, false);
        }
    }

    public getType() {
        return SelectionChangeEvent.TYPE;
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
    ) {
        super(FocusChangeEvent.TYPE);
    }
} // FocusChangeEvent

export class FocusChangeEventFactory implements ChangeEventFactory {
    build(oftState: OftState): ChangeEvent {
        return new FocusChangeEvent(oftState.focusIndex, oftState.coverType, oftState.selectedFilters);
    }

    public getType() {
        return FocusChangeEvent.TYPE;
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

export class FilterChangeEventFactory implements ChangeEventFactory {
    build(oftState: OftState): ChangeEvent {
        return new FilterChangeEvent(oftState.selectedFilters, oftState.selectedIndex);
    }

    public getType() {
        return FilterChangeEvent.TYPE;
    }

} // FilterChangeEventFactory


/**
 * Signature of change listeners registered to OftStateController.
 */
export type ChangeListener = (change: ChangeEvent) => void;
