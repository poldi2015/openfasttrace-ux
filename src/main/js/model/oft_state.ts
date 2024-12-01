export type FilterName = Array<number>;
export type Filter = Array<number>;

export class OftState {
    public constructor(
        public selectedIndex: number | null = null,
        public selectedPath: Array<string> = [],
        public selectedFilters: Map<FilterName,Filter> = new Map<FilterName,Filter>(),
    ) {
    }
}