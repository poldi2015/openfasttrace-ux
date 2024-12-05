import {FilterName, OftState, SelectedFilterIndexes} from "../model/oft_state";
import {FilterModel} from "../model/filter";

export class VolatileOftState extends OftState {

    constructor(
        selectedIndex: number | null = null,
        selectedPath: Array<string> = [],
        selectedFilters: Map<FilterName, SelectedFilterIndexes> = new Map<FilterName, SelectedFilterIndexes>(),
    ) {
        // Initialize first specItem as selectedIndex and selectPath if not set and existing
        if (window.specitem.specitems.length > 0) {
            selectedIndex = selectedIndex ?? 0;
            selectedPath = window.specitem.specitems[selectedIndex].selectedPath;
        }

        // Initialize selectedFilters to selectAll if not set as parameter
        Object.entries(window.metadata).forEach(([filterName, values]: [string, any]) => {
            if (!selectedFilters.has(filterName)) {
                const filterEntries = values as Array<FilterModel>;
                const allFilterEntriesSelected: SelectedFilterIndexes =
                    Array.from({length: filterEntries.length}, (_, index: number): number => index);
                selectedFilters.set(filterName, allFilterEntriesSelected);
            }
        })

        super(selectedIndex, selectedPath, selectedFilters);
    }

} // VolatileOftState