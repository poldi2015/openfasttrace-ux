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
import {beforeEach, describe, expect} from "vitest";
import {HistoryItem, OftStateHistory} from "@main/model/oft_state_history";
import {test} from "@test/fixtures/fixtures";
import {ChangeEvent, EventType} from "@main/model/change_event";
import {
    createEvent,
    createEventWithState,
    createSampleHistory,
    sampleChangeEventFocus1,
    sampleChangeEventSelection1,
    sampleFilterState1,
    sampleFocusState1
} from "@test/samples/events";

describe(("OftStateHistory"), () => {

    let sampleHistory: Array<HistoryItem>;

    beforeEach(async () => {
        // Needs to be replaced if new entries needs to be added
        sampleHistory = createSampleHistory();
    });

    test("OftStateHistory default values are as expected", () => {
        const history: OftStateHistory = new OftStateHistory();
        expect(history.currentPosition).toBe(0);
        expect(history.maxSize).toBe(500);
    });

    test("init initializes history with a start event if handed in array does not contain one", () => {
        const history: OftStateHistory = new OftStateHistory();
        const initialStateEvent: ChangeEvent = createEvent(EventType.Selection);
        history.init(initialStateEvent);
        expect(history.length()).toBe(1);
        const initialEvent: ChangeEvent | null = history.peekState(0);
        expect(initialEvent).toBe(initialStateEvent);
    });

    test("init does not add a start state if the array handed in via the constructor contains one", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        expect(history.length()).toBe(sampleHistory.length);
        const initialEvent: ChangeEvent | null = history.peekState(0);
        expect(initialEvent).toBe(sampleChangeEventSelection1);
    });

    test("toPreviousState returns the second newest event with the corresponding OftState and the EventTypes of the newest", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        const nextEvent: ChangeEvent | null = history.toPreviousState();
        const expectedEvent: ChangeEvent = createEventWithState(sampleFilterState1, EventType.Selection);
        expect(nextEvent).toEqual(expectedEvent);
    });

    test("THe second toPreviousState returns the third newest event with the corresponding OftState and the EventTypes of the second", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        history.toPreviousState();
        const nextEvent: ChangeEvent | null = history.toPreviousState();
        const expectedEvent: ChangeEvent = createEventWithState(sampleFocusState1, EventType.Filters);
        expect(nextEvent).toEqual(expectedEvent);
    });

    test("toPreviousState when current position is last one returns null", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        history.currentPosition = history.length() - 1;
        const nextEvent: ChangeEvent | null = history.toPreviousState();
        expect(nextEvent).toBeNull();
    });

    test("toNextState returns the first newer event with the corresponding OftState", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        history.currentPosition = 1;
        const nextEvent: ChangeEvent | null = history.toNextState();
        expect(nextEvent).toEqual(sampleChangeEventSelection1);
    });

    test("toNextState when current position is 0 returns null", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        history.currentPosition = 0;
        const nextEvent: ChangeEvent | null = history.toNextState();
        expect(nextEvent).toBeNull();
    });

    test("history reaching max size when an event is added drops out oldest element", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory, 0, 4);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        history.pushEvent(createEvent(EventType.Selection));
        history.currentPosition = 3;
        const lastEvent: ChangeEvent | null = history.peekState(history.length() - 1);
        expect(lastEvent).not.toBeNull();
        expect(lastEvent).toEqual(sampleChangeEventFocus1);
    });

    test("pushEvent with currentPosition 2 adds it at position 2 and shifts previous position 2 to 3", () => {
        const history: OftStateHistory = new OftStateHistory(sampleHistory, 0, 4);
        const initialStateEvent: ChangeEvent = createEvent(EventType.Focus);
        history.init(initialStateEvent);
        history.currentPosition = 2;
        const newEvent: ChangeEvent = createEvent(EventType.Selection)
        history.pushEvent(newEvent); // Removes the fist element due to history overflow and position >= length / 2
        expect(history.currentPosition).toBe(1);
        const pos2Event: ChangeEvent | null = history.peekState(history.currentPosition);
        expect(pos2Event).toEqual(newEvent);
        const pos3Event: ChangeEvent | null = history.peekState(history.currentPosition + 1);
        expect(pos3Event).toEqual(sampleChangeEventFocus1);
    });

});