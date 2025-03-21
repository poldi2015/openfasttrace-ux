/**
 * Definition of metadata used for filters and metrics.
 */

declare global {
    interface Window {
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

