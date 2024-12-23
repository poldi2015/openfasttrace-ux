import {SpecItemElement} from '@main/view/spec_item_element';
import {getValuesByFilterName, SpecItem} from "@main/model/specitems";
import {
    ChangeEvent,
    ChangeListener,
    FilterChangeEvent,
    FocusChangeEvent,
    OftStateController
} from "./oft_state_controller";
import {CoverType, SelectedFilterIndexes} from "@main/model/oft_state";
import {Log} from "@main/utils/log";
import {FocusSpecItemElement} from "@main/view/focus_spec_item_element";

const FOCUS_SPECITEM_ELEMENT_ID: string = "#focusitem";
const SPECITEMS_ELEMENT_ID: string = "#specitems";

export class SpecItemsController {
    constructor(private oftStateController: OftStateController) {
    }

    private log: Log = new Log("SpecItemsController");

    private focusSpecItemElement: SpecItemElement | null = null;
    private specItems: Map<number, SpecItem> = new Map<number, SpecItem>();
    private specItemElements: Array<SpecItemElement> = [];
    private specItemToElement: Array<[SpecItem, SpecItemElement]> = new Array<[SpecItem, SpecItemElement]>();

    private filterChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener(event as FilterChangeEvent);
    }

    private focusChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.focusChangeListener(event as FocusChangeEvent);
    }

    public init(specItems: Array<SpecItem>): void {
        this.log.info("init ", specItems.map((specItem: SpecItem) => specItem.index).join(", "));
        specItems.forEach((specItem: SpecItem) => {
            const specItemElement: SpecItemElement = this.createSpecItemElement(specItem);
            this.insertSpecItemAt(specItemElement);
            this.specItemToElement.push([specItem, specItemElement]);
            this.specItems.set(specItem.index, specItem);
            if (this.specItemToElement.length === 1) specItemElement.select();
        });
        this.oftStateController.addChangeListener(FilterChangeEvent.TYPE, this.filterChangeListenerFacade);
        this.oftStateController.addChangeListener(FocusChangeEvent.TYPE, this.focusChangeListenerFacade);
    }

    // Initialize Elements

    private createSpecItemElement(specItem: SpecItem): SpecItemElement {
        return new SpecItemElement(
            specItem,
            this.oftStateController
        );
    }

    private createFocusSpecItemElement(specItem: SpecItem, coverType: CoverType): FocusSpecItemElement {
        if (specItem == null) this.log.info("SPECITEM MUST NOT BE NULL")
        return new FocusSpecItemElement(
            specItem,
            coverType,
            this.oftStateController
        );
    }

    private insertSpecItemAt(specItem: SpecItemElement, index: number = -1): void {
        specItem.insertToAt($(SPECITEMS_ELEMENT_ID), index);
        this.specItemElements.push(specItem);
    }

    private setFocusSpecItem(specItem: SpecItem | null, coverType: CoverType): void {
        this.log.info("setFocusSpecItem ", specItem);
        if (specItem == null) {
            $(FOCUS_SPECITEM_ELEMENT_ID).hide();
        } else if (this.focusSpecItemElement?.specItem.index != specItem?.index) {
            this.removeFocusSpecItem();
            $(FOCUS_SPECITEM_ELEMENT_ID).show();
            this.focusSpecItemElement = this.createFocusSpecItemElement(specItem, coverType);
            this.focusSpecItemElement.insertToAt($(FOCUS_SPECITEM_ELEMENT_ID), 0);
        }
    }

    private removeFocusSpecItem() {
        if (this.focusSpecItemElement != null) {
            this.focusSpecItemElement.remove();
            this.focusSpecItemElement = null;
        }
    }


    //
    // Change listener

    private focusChangeListener(focusChangeEvent: FocusChangeEvent): void {
        this.log.info("focusChangeListener ", focusChangeEvent);

        // Update focus element
        if (focusChangeEvent.index == null) {
            // Hide focus item

            this.removeFocusSpecItem();
        } else {
            // show Focus item

            const focusedSpecItem: SpecItem = this.specItems.get(focusChangeEvent.index) as SpecItem;
            this.setFocusSpecItem(focusedSpecItem, focusChangeEvent.coverType);
        }

        // Update filtered items
        const selectedFilters: Array<[string, SelectedFilterIndexes]> = Array.from(focusChangeEvent.selectedFilters);
        const filteredSpecItems: Array<SpecItemElement> =
            SpecItemsController.getSpecItemsMatchingFilters(this.specItemToElement, selectedFilters);

        this.showOnlySelectedSpecItemElements(filteredSpecItems);

        // scroll to last position before focusing
        if (focusChangeEvent.scrollPosition != undefined) {
            this.log.info("Scroll to ", focusChangeEvent.scrollPosition);
            $(SPECITEMS_ELEMENT_ID).scrollTop(focusChangeEvent.scrollPosition);
        }
    }


    //
    // Show items based on filters

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param filterChangeEvent represents the current filter selections
     */
    private filterChangeListener(filterChangeEvent: FilterChangeEvent): void {
        this.log.info("filterChangeListener ", filterChangeEvent);
        const selectedFilters: Array<[string, SelectedFilterIndexes]> = Array.from(filterChangeEvent.selectedFilters);
        const filteredSpecItems: Array<SpecItemElement> =
            SpecItemsController.getSpecItemsMatchingFilters(this.specItemToElement, selectedFilters);

        this.showOnlySelectedSpecItemElements(filteredSpecItems);
    }


    /**
     * Filters SpecItem from the list of all SpecItems that match all filters.
     *
     * @param specItemToElement 1:1 mapping of SpecItem to SpecItemElement
     * @param selectedFilters active filters
     */
    private static getSpecItemsMatchingFilters(specItemToElement: Array<[SpecItem, SpecItemElement]>,
                                               selectedFilters: Array<[string, SelectedFilterIndexes]>): Array<SpecItemElement> {

        return specItemToElement
            .filter(([specItem, _]: [SpecItem, any]) => {
                return SpecItemsController.isMatchingAllFilters(specItem, selectedFilters);
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
            if (filterIndexes.length === 0) return true;
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