import {FilterElement} from "./filter_element";
import {OftStateController} from "../controller/oft_state_controller";
import {FilterName, SelectedFilterIndexes} from "../model/oft_state";
import {Logger, logger} from "../utils/logger";

export class FiltersElement {
    constructor(private oftState: OftStateController) {
    }

    public filterElements: Array<FilterElement> = [];

    /**
     * Initialize all filter widget marked with class .widget-filter.
     */
    public init(): void {
        const filterElements: Array<FilterElement> = this.filterElements;
        const oftState:OftStateController = this.oftState;

        $(".widget-filter").each(function (_, element: HTMLElement) {
            let id: string = element?.parentElement?.parentElement?.id ?? "";
            const filterElement: FilterElement = new FilterElement(id ? id : "", element, oftState);
            const selectedFilterIndexes: SelectedFilterIndexes = oftState.getSelectedFilters().get(id) ?? [];
            filterElement.init(selectedFilterIndexes);
            filterElement.activate();
            filterElements.push(filterElement);
        });
        this.filterElements = filterElements;
    }

} // FiltersElement