import {CoverType, FilterName, OftState, SelectedFilterIndexes} from "@main/model/oft_state";
import {FilterModels} from "@main/model/filter";
import {SpecItem} from "@main/model/specitems";

export class OftStateBuilder {
    public constructor(private oftState: OftState = new OftState() ) {}

    public fromModel(metaModel: FilterModels, specItems: Array<SpecItem>):OftStateBuilder {
        if (specItems.length > 0) {
            this.oftState.selectedIndex = 0;
            this.oftState.selectedPath = specItems[this.oftState.selectedIndex].path;
        } else {
            this.oftState.selectedIndex = null;
            this.oftState.selectedPath = [];
        }
        /*
        Object.entries(metaModel).forEach(([filterName, _]: [string, any]) => {
            this.oftState.selectedFilters.set(filterName, []);
        });
         */

        return this;
    }

    public setSelectedIndex(selectedIndex: number): OftStateBuilder {
        this.oftState.selectedIndex = selectedIndex;
        return this;
    }

    public setPosition(value: number):void {
        this.oftState.scrollPosition = value;
    }

    public setSelectedPath(selectedPath: Array<string>): OftStateBuilder {
        this.oftState.selectedPath = selectedPath;
        return this;
    }

    public setSelectedFilters(selectedFilters: Map<FilterName, SelectedFilterIndexes>): OftStateBuilder {
        this.oftState.selectedFilters = selectedFilters;
        return this;
    }

    public setFocusIndex(value: number | null):void {
        this.oftState.focusIndex = value;
    }

    public setUnfocusedFilters(unfocusedFilters: Map<FilterName, SelectedFilterIndexes>): OftStateBuilder {
        this.oftState.unfocusedFilters = unfocusedFilters;
        return this;
    }


    public setFocusType(value: CoverType):void {
        this.oftState.coverType = value;
    }

    public build(): OftState {
        return this.oftState.clone();
    }

} // VolatileOftState