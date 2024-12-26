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
import {FILTER_NAMES} from "./filter";

export const INDEX_FILTER: string = "%index%";

declare global {
    interface Window {
        specitem: any;
    }
}

export interface SpecItem {
    index: number,
    type: number,
    name: string,
    version: number,
    content: string,
    covered: Array<number>,
    uncovered: Array<number>,
    covering: Array<number>,
    coveredBy: Array<number>,
    status: number,
    path: Array<string>,
}

export function getValuesByFilterName(specItem: SpecItem, filterName: string): Array<number> {
    switch (filterName) {
        case FILTER_NAMES[0]:
            return [specItem.type];
        case FILTER_NAMES[1]:
            return specItem.uncovered;
        case FILTER_NAMES[2]:
            return [specItem.status];
        case INDEX_FILTER:
            return [specItem.index];
        default:
            return [];
    }
}