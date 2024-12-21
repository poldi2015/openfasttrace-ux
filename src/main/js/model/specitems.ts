import {FILTER_NAMES} from "./filter";

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
        default:
            return [];
    }
}