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
 * Used by {@link FieldFilter} to execute the actual matching
 */
export type FieldFilterMatcher = (specItem: SpecItem, fieldIndexes: Array<number>) => boolean;

/**
 * Apples a given function with a list of handed in field ids.
 *
 * This class is used by {link _Project} to create filters for the supported fields.
 *
 * @param filterIndexes selected fields
 */
export class FieldFilter extends Filter {
    constructor(filterName: string,
                public readonly fieldIndexes: Array<number>,
                private readonly matcher: FieldFilterMatcher
    ) {
        super(filterName);
    }


    public matches(specItem: SpecItem): boolean {
        return this.fieldIndexes.length == 0 || this.matcher(specItem, this.fieldIndexes);
    }

} // MatcherFilter

/**
 * A filter that applies to all SpecItems with a fitting index
 *
 * @param acceptedIndexes The specItem indexes that are accepted by the Filter
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
    id = 0,
    content = 1
} // NameFilterTarget

/**
 * A filter that filters SpecItems that contains a specific string or matches a regular expression.
 */
export class NameFilter extends Filter {
    public static readonly FILTER_NAME: string = "%name%";

    constructor(public readonly acceptedName: string,
                private readonly isRegExp: boolean = false,
                private readonly nameFilterTarget: NameFilterTarget = NameFilterTarget.id
    ) {
        super(NameFilter.FILTER_NAME);
    }

    public matches(specItem: SpecItem): boolean {
        if (this.acceptedName == "") return true;
        const specItemValues: Array<string> = this.nameFilterTarget == NameFilterTarget.id ?
            Array.of(specItem.title, specItem.id,specItem.name) :
            Array.of(specItem.content);

        return specItemValues.map((value: string): boolean =>
            value != null && value != "" &&
            this.isRegExp ? value.match(this.acceptedName) != null : value.toLowerCase().includes(this.acceptedName.toLowerCase())
        ).some((value: boolean) => value);
    }

} // NameFilter

/**
 * A filter that filters SpecItems with an id that starts with a given prefix.
 */
export class PrefixFilter extends Filter {
    public static readonly FILTER_PREFIX: string = "%prefix%";

    constructor(public readonly acceptedName: string) {
        super(NameFilter.FILTER_NAME);
    }

    public matches(specItem: SpecItem): boolean {
        return this.acceptedName == "" || specItem.id.startsWith(this.acceptedName);
    }

} // PrefixFilter

/**
 * @param specItem The SpecItem to validate
 * @param selectedFilters The filters
 * @return true if the specItem matches all filters
 */
export function isMatchingAllFilters(specItem: SpecItem, selectedFilters: Array<[string, Filter]>): boolean {
    return selectedFilters.every(([_, filter]: [string, Filter]): boolean => filter.matches(specItem));
}