export type FilterName = string;
export type SelectedFilterIndexes = Array<number>;

export class OftState {
    public constructor(
        private _selectedIndex: number | null = null,
        private _selectedPath: Array<string> = [],
        private _selectedFilters: Map<FilterName, SelectedFilterIndexes> = new Map<FilterName, SelectedFilterIndexes>(),
    ) {
    }

    public get selectedIndex(): number | null {
        return this._selectedIndex;
    }

    public set selectedIndex(value: number | null) {
        this._selectedIndex = value;
    }

    public get selectedPath(): Array<string> {
        return this._selectedPath;
    }

    public set selectedPath(value: Array<string>) {
        this._selectedPath = value;
    }

    public get selectedFilters(): Map<FilterName, SelectedFilterIndexes> {
        return this._selectedFilters;
    }

    public set selectedFilters(value: Map<FilterName, SelectedFilterIndexes>) {
        this._selectedFilters = value;
    }
}