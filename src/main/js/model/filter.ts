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
/**
 * Definition of metadata used for filters and metrics.
 */


declare global {
    interface Window {
        $: any;
        metadata: any;
    }
}

export type FilterModels = {
    types: Array<FilterModel>;
    coverages: Array<FilterModel>;
    status: Array<FilterModel>;
    tags : Array<FilterModel>;
}

export interface FilterModel {
    label?: string;
    name: string,
    tooltip: string,
    color?: string,
    item_count: number,
}

export const FILTER_NAMES : Array<String> = Object.getOwnPropertyNames(window.metadata);

/**
 * Returns the label of an entry in the type filter.
 *
 * @param index the index of the type filter
 */
export function typeIndexToLabel(index : number ): string {
    return window.metadata.types[index].label;
}