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
import {Filter} from "@main/model/filter";

export type FilterName = string;
export type SelectedFilterIndexes = Array<number>;

export enum CoverType {
    covering = 0,
    coveredBy = 1
}

export class OftState {
    public constructor(
        private _selectedIndex: number | null = null,
        private _scrollPosition: number | undefined = undefined,
        private _selectedPath: Array<string> = [],
        private _selectedFilters: Map<FilterName, Filter> = new Map<FilterName, Filter>(),
        private _focusIndex: number | null = null,
        private _focusPath: Array<string> = [],
        private _unfocusedFilters: Map<FilterName, Filter> = new Map<FilterName, Filter>(),
        private _coverType: CoverType = CoverType.covering,
    ) {
    }

    public clone(): OftState {
        return new OftState(
            this._selectedIndex,
            this._scrollPosition,
            this._selectedPath,
            this._selectedFilters,
            this._focusIndex,
            this._focusPath,
            this._unfocusedFilters,
            this._coverType
        );
    }

    public get selectedIndex(): number | null {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number | null) {
        this._selectedIndex = value;
    }

    public get selectedPath(): Array<string> {
        return this._selectedPath;
    }

    public set selectedPath(value: Array<string>) {
        this._selectedPath = value;
    }

    public get selectedFilters(): Map<FilterName, Filter> {
        return this._selectedFilters;
    }

    public set selectedFilters(value: Map<FilterName, Filter>) {
        this._selectedFilters = value;
    }

    get scrollPosition(): number | undefined {
        return this._scrollPosition;
    }

    set scrollPosition(value: number | undefined) {
        this._scrollPosition = value;
    }

    get focusIndex(): number | null {
        return this._focusIndex;
    }

    set focusIndex(value: number | null) {
        this._focusIndex = value;
    }

    get focusPath(): Array<string> {
        return this._focusPath;
    }

    set focusPath(value: Array<string>) {
        this._focusPath = value;
    }

    get unfocusedFilters(): Map<FilterName, Filter> {
        return this._unfocusedFilters;
    }

    set unfocusedFilters(value: Map<FilterName, Filter>) {
        this._unfocusedFilters = value;
    }

    get coverType(): CoverType {
        return this._coverType;
    }

    set coverType(value: CoverType) {
        this._coverType = value;
    }

} // OftState