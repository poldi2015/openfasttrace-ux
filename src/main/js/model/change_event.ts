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
    public handleSelectionChange(handler: SelectionChangeHandler): boolean {
        if (this.has(EventType.Selection)) handler(this.oftState.selectedIndex, this.oftState);
        return this.has(EventType.Selection);
    }

    /**
     * Handler is called of focus changed.
     */
    public handleFocusChange(handler: FocusChangeHandler): boolean {
        if (this.has(EventType.Focus)) handler(this.oftState.focusIndex, this.oftState.coverType, this.oftState);
        return this.has(EventType.Focus);
    }

    /**
     * Handler is called when filters changed.
     */
    public handleFilterChange(handler: FilterChangeHandler): boolean {
        if (this.has(EventType.Filters)) handler(this.oftState.selectedFilters, this.oftState);
        return this.has(EventType.Filters);
    }

    /**
     * true of event includes the given eventType.
     */
    public has(eventType: EventType): boolean {
        return this.types.includes(eventType);
    }

} // ChangeEvent
