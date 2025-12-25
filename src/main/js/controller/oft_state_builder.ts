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
import {CoverType, FilterName, OftState} from "@main/model/oft_state";
import {Filter} from "@main/model/filter";
import {SpecItem} from "@main/model/specitems";
import {FieldModel, Project} from "@main/model/project";

export class OftStateBuilder {
    public constructor(private oftState: OftState = new OftState() ) {}

    public fromModel(project: Project, specItems: Array<SpecItem>): OftStateBuilder {
        if (specItems.length > 0) {
            this.oftState.selectedIndex = 0;
        } else {
            this.oftState.selectedIndex = null;
        }
        project.fieldModels.forEach((fieldModel: FieldModel, filterName: string) => {
            this.oftState.selectedFilters.set(filterName, fieldModel.createFilter([]));
        });

        return this;
    }

    public setSelectedIndex(selectedIndex: number): OftStateBuilder {
        console.log("OftStateBuilder.setSelectedIndex: " + selectedIndex);
        this.oftState.selectedIndex = selectedIndex;
        return this;
    }

    public setSelectedFilters(selectedFilters: Map<FilterName, Filter>): OftStateBuilder {
        this.oftState.selectedFilters = selectedFilters;
        return this;
    }

    public setFocusIndex(value: number | null):void {
        this.oftState.focusIndex = value;
    }

    public setUnfocusedFilters(unfocusedFilters: Map<FilterName, Filter>): OftStateBuilder {
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