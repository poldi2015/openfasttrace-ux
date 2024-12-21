export type FilterName = string;
export type SelectedFilterIndexes = Array<number>;

export enum CoverType {
    covering=0,
    coveredBy=1
}

export class OftState {
    public constructor(
        private _selectedIndex: number | null = null,
        private _scrollPosition: number = 0,
        private _selectedPath: Array<string> = [],
        private _selectedFilters: Map<FilterName, SelectedFilterIndexes> = new Map<FilterName, SelectedFilterIndexes>(),
        private _focusIndex: number | null = null,
        private _focusPath: Array<string> = [],
        private _coverType: CoverType = CoverType.covering,
    ) {
    }

    public clone() : OftState {
        return new OftState(
            this._selectedIndex,
            this._scrollPosition,
            this._selectedPath,
            this._selectedFilters,
            this._focusIndex,
            this._focusPath,
            this._coverType
        );
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

    get scrollPosition(): number {
        return this._scrollPosition;
    }

    set scrollPosition(value: number) {
        this._scrollPosition = value;
    }

    get focusIndex(): number | null {
        return this._focusIndex;
    }

    set focusIndex(value: number | null) {
        this._focusIndex = value;
    }

    get focusPath(): Array<string> {
        return this._focusPath;
    }

    set focusPath(value: Array<string>) {
        this._focusPath = value;
    }

    get coverType(): CoverType {
        return this._coverType;
    }

    set coverType(value: CoverType) {
        this._coverType = value;
    }

} // OftState