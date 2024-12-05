import {SpecItemElement} from '../view/spec_item_element';
import {getValuesByFilterName, SpecItem} from "../model/specitems";
import {ChangeEvent, ChangeListener, FilterChangeEvent, OftStateController} from "./oft_state_controller";
import {SelectedFilterIndexes} from "../model/oft_state";
import {logger} from "../utils/logger";

const SPECITEMS_ELEMENT_ID: string = "#specitems";

export class SpecItemsController {
    constructor(private oftStateController: OftStateController) {
    }

    private specItemElements: Array<SpecItemElement> = [];
    private specItemToElement: Array<[SpecItem, SpecItemElement]> = new Array<[SpecItem, SpecItemElement]>();

    private changeListener: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener(event as FilterChangeEvent);
    }

    public init(specItems: Array<SpecItem>): void {
        specItems.forEach((specItem: SpecItem) => {
            const specItemElement: SpecItemElement = this.createSpecItemElement(specItem);
            this.insertSpecItemAt(specItemElement);
            this.specItemToElement.push([specItem, specItemElement]);
            if (this.specItemToElement.length === 1) specItemElement.select();
        });
        this.oftStateController.addChangeListener(FilterChangeEvent.TYPE, this.changeListener);
    }

    // Initialize Elements

    private createSpecItemElement(specItem: SpecItem): SpecItemElement {
        return new SpecItemElement(
            specItem.index,
            specItem.type,
            specItem.name,
            specItem.version,
            specItem.content,
            specItem.covered,
            specItem.status,
            specItem.path,
            this.oftStateController
        );
    }

    private insertSpecItemAt(specItem: SpecItemElement, index: number = -1): void {
        specItem.insertToAt($(SPECITEMS_ELEMENT_ID), index);
        this.specItemElements.push(specItem);
    }


    // Change listener

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param filterChangeEvent represents the current filter selections
     */
    private filterChangeListener(filterChangeEvent: FilterChangeEvent): void {
        logger.info("filterChangeListener ", filterChangeEvent);
        const filteredSpecItems: Array<SpecItemElement> =
            SpecItemsController.getSpecItemsMatchingFilters(this.specItemToElement, filterChangeEvent);

        this.showOnlySelectedSpecItemElements(filteredSpecItems);
    }


    /**
     * Filters SpecItem from the list of all SpecItems that match all filters.
     *
     * @param specItemToElement 1:1 mapping of SpecItem to SpecItemElement
     * @param filterChangeEvent event with current filter selection
     */
    private static getSpecItemsMatchingFilters(specItemToElement: Array<[SpecItem, SpecItemElement]>,
                                               filterChangeEvent: FilterChangeEvent): Array<SpecItemElement> {

        const selectedFilters: Array<[string, SelectedFilterIndexes]> = Array.from(filterChangeEvent.selectedFilters);
        return specItemToElement
            .filter(([specItem, _]: [SpecItem, any]) => {
                return SpecItemsController.isMatchingAllFilters(specItem, selectedFilters)
            })
            .map(([_, specItemElement]: [any, SpecItemElement]): SpecItemElement => specItemElement);
    }

    /**
     * @param specItem The SpecItem to validate
     * @param selectedFilters The filters
     * @return true if the specItem matches all filters
     * @private
     */
    private static isMatchingAllFilters(specItem: SpecItem, selectedFilters: Array<[string, SelectedFilterIndexes]>): boolean {
        return selectedFilters.every(([filterName, filterIndexes]: [string, SelectedFilterIndexes]): boolean => {
            const itemIndexes: number[] = getValuesByFilterName(specItem, filterName);
            return itemIndexes.some((itemIndex: number) => filterIndexes.includes(itemIndex));
        });
    }

    /**
     * Shows selected SpecItemElements and hides the others.
     *
     * @param specItemElements The specItems to show
     */
    private showOnlySelectedSpecItemElements(specItemElements: Array<SpecItemElement>): void {
        this.specItemElements.forEach((specItemElement: SpecItemElement) => {
            if (specItemElements.includes(specItemElement)) {
                specItemElement.activate();
            } else {
                specItemElement.deactivate();
            }
        });
    }

} // SpecItemsElement