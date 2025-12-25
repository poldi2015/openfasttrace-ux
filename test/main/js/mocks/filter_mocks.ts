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
import {FilterElementFactory, IFilterElement} from "@main/view/filter_element";
import {MockInstance, vi} from "vitest";
import {OftStateController} from "@main/controller/oft_state_controller";
import {FieldModel} from "@main/model/project";
import {SpecItem} from "@main/model/specitems";

// Simple matcher for tests
const testMatcher = (specItem: SpecItem, fieldIndexes: Array<number>): boolean => {
    return fieldIndexes.length === 0 || fieldIndexes.includes(specItem.type);
};

export const FILTER_MODELS_SAMPLE: Map<string, FieldModel> = new Map(Object.entries({
    type: new FieldModel("type", [{
        id: "fea",
        name: "Feature",
        tooltip: "Tooltip Feature",
        color: "red",
        item_count: 5
    }], testMatcher),
    coverage: new FieldModel("coverage", [{
        id: "impl",
        name: "Missing implementation",
        tooltip: "Tooltip Implementation",
        color: "red",
        item_count: 5
    }], testMatcher),
    status: new FieldModel("status", [{
        id: "accept",
        name: "Accept",
        tooltip: "Tooltip Accept",
        color: "red",
        item_count: 5
    }], testMatcher),
}));

export class FilterElementMock implements IFilterElement {
    public constructor(
        public readonly id: string,
        public readonly containerElement: HTMLElement,
        public readonly filterModel: FieldModel,
        public readonly oftState: OftStateController
    ) {
        // Create a mock SelectElement
        this.selectElement = {
            id: id,
            init: () => this.selectElement,
            activate: () => {
            },
            deactivate: () => {
            },
            isActive: () => true,
            getSelectedIndexes: () => [],
            updateSelection: () => {
            },
            selectAll: () => {
            },
            selectNone: () => {
            }
        } as any;
    }

    public readonly selectElement: any;
    public _isActive: boolean = false;


    public init(): IFilterElement {
        return this;
    }

    public activate(): void {
        this._isActive = true;
    }

    public deactivate(): void {
        this._isActive = false;
    }

    public isActive(): boolean {
        return true;
    }
} // FilterElementMock

export class FilterElementSpy {
    constructor(id: string, containerElement: HTMLElement, filterModel: FieldModel, oftState: OftStateController) {
        this.filterElement = new FilterElementMock(id, containerElement, filterModel, oftState);
        this.initSpy = vi.spyOn(this.filterElement, 'init');
        this.activateSpy = vi.spyOn(this.filterElement, 'activate');
        this.deactivateSpy = vi.spyOn(this.filterElement, 'deactivate');
        this.isDisabledSpy = vi.spyOn(this.filterElement, 'isActive');
    }

    public readonly filterElement: FilterElementMock;

    public readonly initSpy: MockInstance<(selectedIndexes: Array<number>) => void>;
    public readonly activateSpy: MockInstance<() => void>;
    public readonly deactivateSpy: MockInstance<() => void>;
    public readonly isDisabledSpy: MockInstance<() => boolean>;

} // FilterElementSpy

export class FilterElementFactoryMock extends FilterElementFactory {
    public build(id: string, containerElement: HTMLElement, filterModel: FieldModel, oftState: OftStateController): IFilterElement {
        const filterElementSpy: FilterElementSpy = new FilterElementSpy(id, containerElement, filterModel, oftState);
        this.instances.push(filterElementSpy);
        return filterElementSpy.filterElement;
    }

    public instances: Array<FilterElementSpy> = [];

} // FilterElementFactoryMock