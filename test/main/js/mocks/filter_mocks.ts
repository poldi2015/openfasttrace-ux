import {FilterElementFactory, IFilterElement} from "@main/view/filter_element";
import {MockInstance, vi} from "vitest";
import {FilterModel, FilterModels} from "@main/model/filter";
import {OftStateController} from "@main/controller/oft_state_controller";

export const FILTER_MODELS_SAMPLE: FilterModels = {
    type: [{
        label: "fea",
        name: "Feature",
        tooltip: "Tooltip Feature",
        color: "red",
        item_count: 5
    }],
    coverage: [{
        label: "impl",
        name: "Missing implementation",
        tooltip: "Tooltip Implementation",
        color: "red",
        item_count: 5
    }],
    status: [{
        label: "accept",
        name: "Accept",
        tooltip: "Tooltip Accept",
        color: "red",
        item_count: 5
    }],
}

export class FilterElementMock implements IFilterElement {
    public constructor(
        public readonly id: string,
        public readonly selectElement: HTMLElement,
        public readonly filterModel: Array<FilterModel>,
        public readonly oftState: OftStateController
    ) {
    }

    public isActive: boolean = false;


    init(): void {
    }

    activate(): void {
        this.isActive = true;
    }

    deactivate(): void {
        this.isActive = false;
    }

    isDisabled(): boolean {
        return true;
    }
} // FilterElementMock

export class FilterElementSpy {
    constructor(id: string, selectElement: HTMLElement, filterModel: Array<FilterModel>, oftState: OftStateController) {
        this.filterElement = new FilterElementMock(id, selectElement, filterModel, oftState);
        this.initSpy = vi.spyOn(this.filterElement, 'init');
        this.activateSpy = vi.spyOn(this.filterElement, 'activate');
        this.deactivateSpy = vi.spyOn(this.filterElement, 'deactivate');
        this.isDisabledSpy = vi.spyOn(this.filterElement, 'isDisabled');
    }

    public readonly filterElement: FilterElementMock;

    public readonly initSpy: MockInstance<(selectedIndexes: Array<number>) => void>;
    public readonly activateSpy: MockInstance<() => void>;
    public readonly deactivateSpy: MockInstance<() => void>;
    public readonly isDisabledSpy: MockInstance<() => boolean>;

} // FilterElementSpy

export class FilterElementFactoryMock extends FilterElementFactory {
    public build(id: string, selectElement: HTMLElement, filterModel: Array<FilterModel>, oftState: OftStateController): IFilterElement {
        const filterElementSpy: FilterElementSpy = new FilterElementSpy(id, selectElement, filterModel, oftState);
        this.instances.push(filterElementSpy);
        return filterElementSpy.filterElement;
    }

    public instances: Array<FilterElementSpy> = [];

} // FilterElementFactoryMock