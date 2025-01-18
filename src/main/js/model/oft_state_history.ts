import {ChangeEvent} from "@main/model/change_event";
import {Log} from "@main/utils/log";

/**
 * One entry in the {@lnik OftStateHistory}.
 */
export class HistoryItem {
    constructor(public readonly changeEvent: ChangeEvent) {
    }
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

    private log: Log = new Log("OftStateHistory");

    /**
     * Initializes the eventFactories.
     *
     * @param changeEvent The event that created the initial state
     */
    public init(changeEvent: ChangeEvent) {
        this.log.info("init", this.history.length, this.currentPosition);
        if (this.history.length == 0) {
            this.log.info("Adding initial state", changeEvent);
            this.history.push(new HistoryItem(changeEvent));
        }
    }

    /**
     * Adds a new history index at the given position.
     *
     * @param changeEvent change that leads to the new state.
     * @param position the position in this history where to place the event, defaulting to the last added
     * @return the added {@link HistoryItem}
     */
    public pushEvent(changeEvent: ChangeEvent, position: number = this.currentPosition): ChangeEvent {
        this.log.info("pushState", position, changeEvent);
        const historyItem: HistoryItem = new HistoryItem(changeEvent);
        this.history.splice(position, 0, historyItem);
        this.limitHistorySize(position);
        this.currentPosition = position;
        return changeEvent;
    }

    /**
     * Pulls out a {@link ChangeEvent} from this history at the given position.
     *
     * @param position the position. default to the last added
     * @return the pulled {@link ChangeEvent}
     */
    public pullState(position: number = this.currentPosition): ChangeEvent {
        if (this.history.length == 1) {
            this.currentPosition = 0;
            return this.history[0].changeEvent;
        } else {
            this.currentPosition = position;
            return this.history.splice(position, 1)[0].changeEvent;
        }
    }

    /**
     * switches the history to the previous (older) entry and returns a {@link ChangeEvent} representing the state change.
     *
     * @return {@link ChangeEvent} executing the state change or null if in the latest state
     */
    public toPreviousState(): ChangeEvent | null {
        if (this.currentPosition >= this.history.length) return null;
        const fromEntry: HistoryItem = this.history[this.currentPosition];
        this.currentPosition++;
        const toEntry: HistoryItem = this.history[this.currentPosition];
        const changeEvent: ChangeEvent = new ChangeEvent(fromEntry.changeEvent.types, toEntry.changeEvent.oftState);
        this.log.info("toPreviousState", this.currentPosition, this.history.length, changeEvent);
        return changeEvent;
    }

    /**
     * switch the history to the next (newer) entry  and returns a {@link ChangeEvent} representing the state change.
     *
     * @return {@link ChangeEvent} executing the state change or null if in the latest state
     */
    public toNextState(): ChangeEvent | null {
        if (this.currentPosition < 1) return null
        this.currentPosition--;
        const changeEvent: ChangeEvent = this.history[this.currentPosition].changeEvent;
        this.log.info("toNextState", this.currentPosition, this.history.length, changeEvent);
        return changeEvent;
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