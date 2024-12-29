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

import {SpecItem} from "@main/model/specitems";

/**
 * Definition of metadata used for filters and metrics.
 */

declare global {
    interface Window {
        $: any;
        metadata: any;
    }
}

//
// FilterModel

/**
 * List of all available filters with selectable entries.
 *
 * The FilterModels are poplated by the generated window.metadata.
 */
export type FilterModels = Record<string, Array<FilterModel>>;

/**
 * A single filter
 */
export interface FilterModel {
    label?: string;
    name: string,
    tooltip: string,
    color?: string,
    item_count: number,
}

/**
 * Apply a filter to a SpecItem.
 */
export interface Filter {

    /**
     * @return true if the filter matches the specItem
     */
    matches(specItem: SpecItem): boolean;
}

/**
 * A Filter that filters SpecItems based on a list of selected entries.
 *
 * This filter is used for the sidebar filters.
 */
export class SelectionFilter implements Filter {
    constructor(public readonly filterName: string,
                public readonly filterIndexes: Array<number>) {
    }

    public matches(specItem: SpecItem): boolean {
        if (this.filterIndexes.length == 0) return true;
        const specItemValues: Array<number> | undefined = this.getSpecItemValuesByFilterName(specItem, this.filterName);
        if (specItemValues == undefined) return false;
        return specItemValues.some((value: number) => this.filterIndexes.includes(value));
    }

    private getSpecItemValuesByFilterName(specItem: SpecItem, filterName: string): Array<number> | undefined {
        // TODO improve performance
        if (!Object.keys(specItem).includes(filterName)) return undefined;
        return Object.entries(specItem)
            .filter(([key, _]: [string, any]) => key == filterName)
            .map(([_, value]: [string, any]) => {
                if (Array.isArray(value)) {
                    return value as Array<number>;
                } else if (typeof value == "number") {
                    return [value];
                }
                return [];
            }).flat();
    }
} // SelectionFilter

/**
 * A filter that applies for all SpecItems with an index matching a list of accepted indexes.
 *
 * If the accepted indexes == null than it matches all SpecItems.
 */
export class IndexFilter implements Filter {
    constructor(private readonly acceptedIndexes: Array<number> | null) {
    }

    public matches(specItem: SpecItem): boolean {
        return this.acceptedIndexes == null || this.acceptedIndexes.includes(specItem.index);
    }

} // IndexFilter

/**
 * A filter that filters SpecItems that contains a specific string or matches a regular expression.
 */
export class NameFilter implements Filter {
    constructor(private readonly acceptedName: string,
                private readonly isRegExp: boolean) {
    }

    public matches(specItem: SpecItem): boolean {
        if (this.acceptedName == "") return true;

        if (this.isRegExp) {
            return specItem.fullName.match(this.acceptedName) != null;
        } else {
            return specItem.fullName.includes(this.acceptedName.toLowerCase());
        }
    }

} // NameFilter
