import {FilterElement} from "./filter_element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {SelectedFilterIndexes} from "@main/model/oft_state";
import {FilterModel} from "@resources/js/meta_data";

interface FilterModelMetadata {
    [key: string]: Array<FilterModel>;
}

export class FiltersElement {
    constructor(
        private readonly filterModels: FilterModelMetadata,
        private readonly oftState: OftStateController) {
    }

    public filterElements: Array<FilterElement> = [];

    /**
     * Initialize all filter widget marked with class .widget-filter.
     */
    public init(): void {
        const filterElements: Array<FilterElement> = this.filterElements;
        const oftState:OftStateController = this.oftState;
        const filterModels: FilterModelMetadata = this.filterModels;

        $(".widget-filter").each(function (_, element: HTMLElement) {
            let id: string = element?.parentElement?.parentElement?.id ?? "";
            const filterElement: FilterElement = new FilterElement(id ? id : "", element, filterModels[id], oftState);
            const selectedFilterIndexes: SelectedFilterIndexes = oftState.getSelectedFilters().get(id) ?? [];
            filterElement.init(selectedFilterIndexes);
            filterElement.activate();
            filterElements.push(filterElement);
        });
        this.filterElements = filterElements;
    }

} // FiltersElement