/**
 * Definition of metadata used for filters and metrics.
 */


declare global {
    interface Window {
        $: any;
        metadata: any;
    }
}

export interface FilterModel {
    label: string;
    name: string,
    tooltip: string,
    color: string,
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