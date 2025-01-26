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
import {createEvent, createEventWithState, createFilter, createSampleHistory} from "@test/samples/events";
import {OftStateBuilder} from "@main/controller/oft_state_builder";
import {ChangeEvent, EventType} from "@main/model/change_event";
import {Filter, SelectionFilter} from "@main/model/filter";
import {CoverType, OftState} from "@main/model/oft_state";

describe(("OftStateController"), () => {
    let sampleHistory: OftStateHistory;
    let listener = vi.fn((event: ChangeEvent): ChangeEvent => event);

    function listenAll(oftStateController: OftStateController): void {
        oftStateController.addChangeListener(listener, EventType.Selection, EventType.Filters, EventType.Focus);
    }

    function createOftStateControllerWithEmptyHistory(): OftStateController {
        return new OftStateController(new OftStateBuilder().build(), sampleHistory);
    }

    beforeEach(async () => {
        sampleHistory = new OftStateHistory(createSampleHistory());
        listener = vi.fn((event: ChangeEvent): ChangeEvent => event);
    });

    test("ChangeEvent listener add before OftStateController.init() is called with init() returning empty OftState with all EventTypes", () => {
        const oftStateController: OftStateController = new OftStateController(new OftStateBuilder().build(), sampleHistory);
        listenAll(oftStateController);
        expect(listener.mock.calls.length).toBe(0);
        oftStateController.init();

        expect(listener.mock.calls.length).toBe(1);
        expect(listener.mock.results[0].value).toEqual(createEvent(EventType.Selection, EventType.Filters, EventType.Focus));
    });

    test("ChangeEvent listener add after OftStateController.init() is called when added returning empty OftState with all EventTypes", () => {
        const oftStateController: OftStateController = new OftStateController(new OftStateBuilder().build(), sampleHistory);
        expect(listener.mock.calls.length).toBe(0);
        oftStateController.init();
        expect(listener.mock.calls.length).toBe(0);
        listenAll(oftStateController);
        expect(listener.mock.calls.length).toBe(1);
        expect(listener.mock.results[0].value).toEqual(createEvent(EventType.Selection, EventType.Filters, EventType.Focus));
    });

    test("Emit a selection event and a switch to previous state issues 3 event (init,select,switch to initial) with last one", () => {
        const oftStateController: OftStateController = createOftStateControllerWithEmptyHistory();
        listenAll(oftStateController);
        oftStateController.init();

        // Add selection event
        oftStateController.selectItem(2);
        expect(listener.mock.calls.length).toBe(2);
        const SelectionState1 = new OftState(2, new Map());
        expect(listener.mock.results[1].value).toEqual(createEventWithState(SelectionState1, EventType.Selection));

        // Switch back to initial state
        oftStateController.toPreviousState();
        expect(listener.mock.calls.length).toBe(3);
        expect(listener.mock.results[2].value).toEqual(createEventWithState(new OftState(), EventType.Selection));
    });

    test("Emit a filter change event and a switch to previous state issues 3 event (init,filter,switch to initial) with last one", () => {
        const oftStateController: OftStateController = createOftStateControllerWithEmptyHistory();
        listenAll(oftStateController);
        oftStateController.init();

        // Add filter event
        const typeFilter: Map<string, Filter> = createFilter("Type", new SelectionFilter("Type", [1, 3]));
        oftStateController.selectFilters(typeFilter);
        expect(listener.mock.calls.length).toBe(2);
        const filterState1 = new OftState(null, typeFilter);
        expect(listener.mock.results[1].value).toEqual(createEventWithState(filterState1, EventType.Filters, EventType.Selection));

        // Switch back to initial state
        oftStateController.toPreviousState();
        expect(listener.mock.calls.length).toBe(3);
        expect(listener.mock.results[2].value).toEqual(createEventWithState(new OftState(), EventType.Filters, EventType.Selection));
    });

    test("Emit a focus change event and a switch to previous state issues 3 event (init,filter,focus,switch to filter) with last one", () => {
        const oftStateController: OftStateController = createOftStateControllerWithEmptyHistory();
        listenAll(oftStateController);
        oftStateController.init();

        // Add filter event
        const typeFilter1: Map<string, Filter> = createFilter("Type", new SelectionFilter("Type", [1, 3]));
        oftStateController.selectFilters(typeFilter1);
        const listenerState1: OftState = listener.mock.results[1].value.oftState;
        expect(listener.mock.calls.length).toBe(2);

        // Add focus event
        oftStateController.focusItem(3, CoverType.covering, new Map());
        expect(listener.mock.calls.length).toBe(3);
        const focusState1 = new OftState(null, new Map(), 3, typeFilter1, CoverType.covering);
        expect(listener.mock.results[2].value).toEqual(createEventWithState(focusState1, EventType.Focus, EventType.Filters));

        // Switch back to filter state
        oftStateController.toPreviousState();
        expect(listener.mock.calls.length).toBe(4);
        expect(listener.mock.results[3].value).toEqual(createEventWithState(listenerState1, EventType.Focus, EventType.Filters));
    });

    test("Emit a selection, focus change, switch cover and unFocus", () => {
        const oftStateController: OftStateController = createOftStateControllerWithEmptyHistory();
        listenAll(oftStateController);
        oftStateController.init();

        // Add filter event
        const typeFilter1: Map<string, Filter> = createFilter("Type", new SelectionFilter("Type", [1, 3]));
        oftStateController.selectFilters(typeFilter1);
        expect(listener.mock.calls.length).toBe(2);

        // Add focus event
        oftStateController.focusItem(3, CoverType.covering, new Map());
        expect(listener.mock.calls.length).toBe(3);

        // Add coverType change event
        oftStateController.focusItem(3, CoverType.coveredBy, new Map());
        expect(listener.mock.calls.length).toBe(4);
        const focusState1 = new OftState(null, new Map(), 3, typeFilter1, CoverType.coveredBy);
        expect(listener.mock.results[3].value).toEqual(createEventWithState(focusState1, EventType.Focus, EventType.Filters));

        // Switch back to filter state
        oftStateController.unFocusItem(3);
        expect(listener.mock.calls.length).toBe(5);
        const unFocusState1 = new OftState(3, typeFilter1, null, new Map(), CoverType.covering);
        expect(listener.mock.results[4].value).toEqual(createEventWithState(unFocusState1, EventType.Focus, EventType.Filters, EventType.Selection));
    });


    test("Switch back from unFocus to focused, emit a selection, focus change, switch cover and unFocus", () => {
        const oftStateController: OftStateController = createOftStateControllerWithEmptyHistory();
        listenAll(oftStateController);
        oftStateController.init();

        // Add filter event
        const typeFilter1: Map<string, Filter> = createFilter("Type", new SelectionFilter("Type", [1, 4]));
        oftStateController.selectFilters(typeFilter1);
        expect(listener.mock.calls.length).toBe(2);

        // Add focus event
        oftStateController.focusItem(3, CoverType.covering, new Map());
        expect(listener.mock.calls.length).toBe(3);

        // Switch back to filter state
        oftStateController.unFocusItem(3);
        expect(listener.mock.calls.length).toBe(4);

        // Switch back to filter state
        oftStateController.toPreviousState();
        const focusState1 = new OftState(null, new Map(), 3, typeFilter1, CoverType.covering);
        expect(listener.mock.calls.length).toBe(5);
        expect(listener.mock.results[4].value).toEqual(createEventWithState(focusState1, EventType.Focus, EventType.Filters, EventType.Selection));
    });

    test("Switch previous unFocus then back to focused", () => {
        const oftStateController: OftStateController = createOftStateControllerWithEmptyHistory();
        listenAll(oftStateController);
        oftStateController.init();

        // Add filter event
        const typeFilter1: Map<string, Filter> = createFilter("Type", new SelectionFilter("Type", [1, 4]));
        oftStateController.selectFilters(typeFilter1);
        expect(listener.mock.calls.length).toBe(2);

        // Add focus event
        oftStateController.focusItem(3, CoverType.covering, new Map());
        expect(listener.mock.calls.length).toBe(3);

        // Switch back to filter state
        oftStateController.unFocusItem(3);
        expect(listener.mock.calls.length).toBe(4);

        // Switch back to focus state
        oftStateController.toPreviousState();
        const focusState1 = new OftState(null, new Map(), 3, typeFilter1, CoverType.covering);
        expect(listener.mock.calls.length).toBe(5);
        expect(listener.mock.results[4].value).toEqual(createEventWithState(focusState1, EventType.Focus, EventType.Filters, EventType.Selection));

        // Switch forward to filter state
        oftStateController.toNextState();
        const focusState2 = new OftState(3, typeFilter1, null, new Map(), CoverType.covering);
        expect(listener.mock.calls.length).toBe(6);
        expect(listener.mock.results[5].value).toEqual(createEventWithState(focusState2, EventType.Focus, EventType.Filters, EventType.Selection));
    });
})
;