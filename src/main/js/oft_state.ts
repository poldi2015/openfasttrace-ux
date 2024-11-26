export class SelectionChangeEvent {
    constructor(
        public readonly index: number|null,
        public readonly path: Array<string> = [],
    ) {
    }
}

type SelectionChangeListener = (change: SelectionChangeEvent) => void;

export class OftState {
    private selectionChangeListeners: Array<SelectionChangeListener> = [];

    public constructor(
        private selectedIndex: number | null = null,
        private _selectedPath: Array<string> = [],
    ) {
    }

    public selectObject(selectedIndex: number, selectedPath: Array<string>): void {
        this.selectedIndex = selectedIndex;
        this._selectedPath = selectedPath;
        this.notifySelectionChange(selectedIndex,selectedPath);
    }

    public unselectObject(): void {
        this.selectedIndex = null;
        this._selectedPath = [];
        this.notifySelectionChange(null,[]);
    }

    public getSelectedId(): number | null {
        return this.selectedIndex;
    }

    public get selectedPath(): Array<string> {
        return this._selectedPath;
    }

    public addSelectionChangedListener(listener: SelectionChangeListener): void {
        this.selectionChangeListeners.push(listener);
    }

    public removeSelectionChangedListener(listener: SelectionChangeListener): void {
        this.selectionChangeListeners = this.selectionChangeListeners.filter(item => item != listener);
    }

    //
    // private

    private notifySelectionChange(selectedIndex:number|null, selectedPath:Array<string>) {
        this.selectionChangeListeners.forEach(listener => {
            listener(new SelectionChangeEvent(selectedIndex, selectedPath));
        });
    }

} // OftState

declare global {
    interface Window {
        OftState: OftState;
    }
}


(window as any).OftState = new OftState();