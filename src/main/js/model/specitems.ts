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

declare global {
    interface Window {
        specitem: any;
    }
}

export interface SpecItem {
    index: number,
    type: number,
    title: string,
    name: string,
    id: string,
    tags: Array<number>,
    version: number,
    content: string,
    provides: Array<number>,
    needs: Array<number>,
    covered: Array<number>,
    uncovered: Array<number>,
    covering: Array<number>,
    coveredBy: Array<number>,
    depends: Array<number>,
    status: number,
    path: Array<string>,
    sourceFile: string,
    sourceLine: number,
    comments: string,
    wrongLinkTypes: Array<number>,
    wrongLinkTargets: Array<string>,

    // Generated elements
    isShallowCovered: boolean,
}

export function initSpecItems(specItems: Array<SpecItem>): Map<number, SpecItem> {
    const indexedSpecItems: Map<number, SpecItem> = new Map(specItems.map((specItem: SpecItem) => [specItem.index, specItem]));
    specItems.forEach((specItem: SpecItem) => {
        initShallowCoverage(indexedSpecItems, specItem);
    });
    return indexedSpecItems;
}

/**
 * Initializes {@link SpecItem.isShallowCovered} for the given specItem.
 *
 * @param specItems The list of all specItewms by id
 * @param specItem The specItem to investigate
 * @private
 */
function initShallowCoverage(specItems: Map<number, SpecItem>, specItem: SpecItem): void {
    specItem.isShallowCovered = specItem.needs.length == 0 || specItem.coveredBy.filter((coveringIndex) =>
        specItem.needs.includes(specItems.get(coveringIndex)?.type ?? -1)
    ).length > 0;
}

export const TYPE_FIELD_NAME: string = "type";
export const COVERAGE_FIELD_NAME: string = "coverage";
export const WRONG_LINK_FIELD_NAME = "wronglink";
export const TAGS_FIELD_NAME: string = "tags";
export const STATUS_FIELD_NAME: string = "status";

export const TAG_FIELD_NAMES : Array<string> = ["tags"];
export const STATUS_FIELD_NAMES : Array<string> = ["status"];
export const STATUS_ACCEPTED_INDEX: number = 0;