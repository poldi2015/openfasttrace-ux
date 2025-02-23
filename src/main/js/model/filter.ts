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
 * Apply a filter to a SpecItem.
 */
export abstract class Filter {
    protected constructor(public readonly filterName: string) {
    }

    /**
     * @return true if the filter matches the specItem
     */
    public abstract matches(specItem: SpecItem): boolean;
} // Filter

/**
 * A Filter that filters SpecItems based on a list of selected entries.
 *
 * This filter is used for the sidebar filters.
 */
export class SelectionFilter extends Filter {
    constructor(filterName: string,
                public readonly filterIndexes: Array<number>) {
        super(filterName);
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
                    // Covering filter: covers, coveredBy etc.
                    return value as Array<number>;
                } else if (typeof value == "number") {
                    // Type and Status
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
export class IndexFilter extends Filter {
    public static readonly FILTER_NAME: string = "%index%";

    constructor(private readonly acceptedIndexes: Array<number> | null) {
        super(IndexFilter.FILTER_NAME);
    }

    public matches(specItem: SpecItem): boolean {
        return this.acceptedIndexes == null || this.acceptedIndexes.includes(specItem.index);
    }

} // IndexFilter

export enum NameFilterTarget {
    name = 0,
    content = 1
} // NameFilterTarget

/**
 * A filter that filters SpecItems that contains a specific string or matches a regular expression.
 */
export class NameFilter extends Filter {
    public static readonly FILTER_NAME: string = "%name%";

    constructor(public readonly acceptedName: string,
                private readonly isRegExp: boolean = false,
                private readonly nameFilterTarget: NameFilterTarget = NameFilterTarget.name
    ) {
        super(NameFilter.FILTER_NAME);
    }

    public matches(specItem: SpecItem): boolean {
        if (this.acceptedName == "") return true;
        const specItemValue: string = this.nameFilterTarget == NameFilterTarget.name ? specItem.fullName : specItem.content;

        if (this.isRegExp) {
            return specItemValue.match(this.acceptedName) != null;
        } else {
            return specItemValue.includes(this.acceptedName.toLowerCase());
        }
    }

} // NameFilter
