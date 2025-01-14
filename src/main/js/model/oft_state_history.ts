import {OftState} from "@main/model/oft_state";
import {ChangeEvent, ChangeEventFactory} from "@main/model/change_event";
import {Log} from "@main/utils/log";

/**
 * One entry in the {@lnik OftStateHistory}.
 */
export class HistoryItem {
    constructor(public readonly eventTypes: Array<string>,
                public readonly oftState: OftState,
                public readonly eventFactories: Map<string, ChangeEventFactory>) {
        this.changeEvents = eventTypes.map((type: string) => eventFactories.get(type)!.build(oftState));
    }

    public readonly changeEvents: Array<ChangeEvent>;

} // HistoryItem

/**
 * History of state changes of the OftState.
 */
export class OftStateHistory {
    /**
     * Initialize the class with an initial history.
     *
     * If history is empty an initial state is added.
     *
     * @param history An initial history, newer states at the beginning.
     * @param currentPosition position of the current state within the history
     * @param maxSize maximum size of the history defaults to 500
     */
    constructor(private readonly history: Array<HistoryItem> = [],
                public currentPosition: number = 0,
                public readonly maxSize: number = 500) {
    }

    private eventFactories: Map<string, ChangeEventFactory> = new Map();

    private log: Log = new Log("OftStateHistory");

    /**
     * Initializes the eventFactories
     * @param oftState state of an initial history
     * @param eventFactories Helper to converting an eventType with an {@link OftState} as input to an {@link ChangeEvent}.
     * @private
     */
    public init(oftState: OftState, eventFactories: Map<string, ChangeEventFactory>) {
        this.log.info("init", this.history.length, this.currentPosition);
        this.eventFactories = eventFactories;
        if (this.history.length == 0) {
            const initialHistoryItem: HistoryItem = new HistoryItem(Array.from(eventFactories.keys()), oftState, this.eventFactories);
            this.log.info("Adding initial state", initialHistoryItem);
            this.history.push(initialHistoryItem);
        }
    }

    /**
     * Adds a new history index at the given position.
     *
     * @param eventTypes events that are issued by this new state
     * @param oftState the state to add
     * @param position the position, defaulting to the last added
     * @return the added {@link HistoryItem}
     */
    public pushState(eventTypes: Array<string>, oftState: OftState, position: number = this.currentPosition): HistoryItem {
        this.log.info("pushState", position, eventTypes);
        const historyItem: HistoryItem = new HistoryItem(eventTypes, oftState, this.eventFactories);
        this.history.splice(position, 0, historyItem);
        this.limitHistorySize(position);
        this.currentPosition = position;
        return historyItem;
    }

    /**
     * Pulls out a state from this history at the given position.
     *
     * @param position the position. default to the last added
     * @return the polled {@link HistoryItem}
     */
    public pullState(position: number = this.currentPosition): HistoryItem {
        if (this.history.length == 1) {
            this.currentPosition = 0;
            return this.history[0];
        } else {
            this.currentPosition = position;
            return this.history.splice(position, 1)[0];
        }
    }

    /**
     * switches the current state to a previous (older state) and returns the corresponding {@link HistoryItem}.
     *
     * @return previous {@link HistoryItem}
     */
    public toPreviousState(): HistoryItem {
        if (this.currentPosition < (this.history.length - 1)) this.currentPosition++;
        this.log.info("toPreviousState", this.currentPosition, this.history[this.currentPosition].eventTypes, this.history.length);
        return this.history[this.currentPosition];
    }

    /**
     * switch the current state to the state on state newer than1 the current state an d returns the corresponding {@link HistoryItem}.
     *
     * If there is no newer state returns the current state.
     *
     * @return newer {@link HistoryItem}
     */
    public toNextState(): HistoryItem {
        if (this.currentPosition > 1) this.currentPosition--;
        this.log.info("toNextState", this.currentPosition, this.history[this.currentPosition].eventTypes, this.history.length);
        return this.history[this.currentPosition];
    }

    /**
     * Keeps the history length to max size by depending in index either removing the first or the last element
     * dependent on index being in the last or in the first halve of the history.
     *
     * @param index where a new element was added
     */
    private limitHistorySize(index: number): void {
        if (this.history.length > this.maxSize) this.history.splice(index >= (this.maxSize / 2) ? 0 : -1, 1);
    }

} // OftStateHistory