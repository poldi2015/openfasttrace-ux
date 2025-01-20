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
import {beforeEach, describe, expect, vi} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {OftStateController} from "@main/controller/oft_state_controller";
import {OftStateHistory} from "@main/model/oft_state_history";
import {createEvent, createEventWithState, createFilter, createSampleHistory} from "../samples/events";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {ChangeEvent, EventType} from "@main/model/change_event";
import {SelectionFilter} from "@main/model/filter";
import {OftState} from "@main/model/oft_state";

describe(("OftStateController"), () => {

    let sampleHistory: OftStateHistory;
    let listener = vi.fn((event: ChangeEvent): ChangeEvent => event);

    function listenAll(oftStateController: OftStateController): void {
        oftStateController.addChangeListener(listener, EventType.Selection, EventType.Filters, EventType.Focus);
    }

    beforeEach(async () => {
        sampleHistory = new OftStateHistory(createSampleHistory());
        listener = vi.fn((event: ChangeEvent): ChangeEvent => event);
    });

    test("ChangeEvent listener add before OftStateController.init() is called with init() returning empty OftState with all EventTypes", () => {
        const oftStateController = new OftStateController(new OftStateBuilder().build(), sampleHistory);
        listenAll(oftStateController);
        expect(listener.mock.calls.length).toBe(0);
        oftStateController.init();
        expect(listener.mock.calls.length).toBe(1);
        expect(listener.mock.results[0].value).toEqual(createEvent(EventType.Selection, EventType.Filters, EventType.Focus));
    });

    test("ChangeEvent listener add after OftStateController.init() is called when added returning empty OftState with all EventTypes", () => {
        const oftStateController = new OftStateController(new OftStateBuilder().build(), sampleHistory);
        expect(listener.mock.calls.length).toBe(0);
        oftStateController.init();
        expect(listener.mock.calls.length).toBe(0);
        listenAll(oftStateController);
        expect(listener.mock.calls.length).toBe(1);
        expect(listener.mock.results[0].value).toEqual(createEvent(EventType.Selection, EventType.Filters, EventType.Focus));
    });


    test("Emmit a filter change event and a switch to previous state issues 3 event (init,filter,switch to initial) with last one ", () => {
        const history = new OftStateHistory();
        const oftStateController = new OftStateController(new OftStateBuilder().build(), history);
        listenAll(oftStateController);
        oftStateController.init();

        // Add filter event
        const typeFilter = createFilter("Type", new SelectionFilter("Type", [1, 3]));
        oftStateController.selectFilters(typeFilter);
        expect(listener.mock.calls.length).toBe(2);
        const filterState1 = new OftState(null, typeFilter);
        expect(listener.mock.results[1].value).toEqual(createEventWithState(filterState1, EventType.Filters));

        // Switch back to initial state
        oftStateController.toPreviousState();
        expect(listener.mock.calls.length).toBe(3);
        expect(listener.mock.results[2].value).toEqual(createEventWithState(new OftState(), EventType.Filters));
    });
});