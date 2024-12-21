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
    private specItems: Array<SpecItem> = [];
    private specItemElements: Array<SpecItemElement> = [];
    private specItemToElement: Array<[SpecItem, SpecItemElement]> = new Array<[SpecItem, SpecItemElement]>();

    private filterChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.filterChangeListener(event as FilterChangeEvent);
    }

    private focusChangeListenerFacade: ChangeListener = (event: ChangeEvent): void => {
        this.focusChangeListener(event as FocusChangeEvent);
    }

    public init(specItems: Array<SpecItem>,
                focusSpecItem: SpecItem | null = null,
                focusCoverPath: Array<string> = [],
                focusCoverType: CoverType = CoverType.covering): void {
        this.specItems = specItems;
        this.setFocusSpecItem(focusSpecItem, focusCoverPath, focusCoverType);
        specItems.forEach((specItem: SpecItem) => {
            if (specItem === focusSpecItem) return;
            const specItemElement: SpecItemElement = this.createSpecItemElement(specItem);
            this.insertSpecItemAt(specItemElement);
            this.specItemToElement.push([specItem, specItemElement]);
            if (this.specItemToElement.length === 1) specItemElement.select();
        });
        this.oftStateController.addChangeListener(FilterChangeEvent.TYPE, this.filterChangeListenerFacade);
        this.oftStateController.addChangeListener(FocusChangeEvent.TYPE, this.focusChangeListenerFacade);
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

    private createFocusSpecItemElement(specItem: SpecItem, coverType: CoverType): FocusSpecItemElement {
        return new FocusSpecItemElement(
            specItem.index,
            specItem.type,
            specItem.name,
            specItem.version,
            specItem.content,
            specItem.covered,
            specItem.status,
            coverType,
            specItem.path,
            this.oftStateController
        );
    }

    private insertSpecItemAt(specItem: SpecItemElement, index: number = -1): void {
        specItem.insertToAt($(SPECITEMS_ELEMENT_ID), index);
        this.specItemElements.push(specItem);
    }

    private setFocusSpecItem(specItem: SpecItem | null, path: Array<string>, coverType: CoverType): void {
        if (specItem === null) {
            $(FOCUS_SPECITEM_ELEMENT_ID).hide();
        } else {
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


    // Change listener

    private focusChangeListener(focusChangeEvent: FocusChangeEvent): void {
        this.log.info("focusChangeListener ", focusChangeEvent);
        if (focusChangeEvent.index === null) {
            this.removeFocusSpecItem();
        } else {
            const specItem: SpecItem = this.specItems[focusChangeEvent.index];
            this.setFocusSpecItem(specItem, focusChangeEvent.path, focusChangeEvent.coverType);
        }
    }

    /**
     * Called when the filters changed their selection.
     *
     * All specItems matching the filters are made visible, all non matching are made invisible.
     *
     * @param filterChangeEvent represents the current filter selections
     */
    private filterChangeListener(filterChangeEvent: FilterChangeEvent): void {
        this.log.info("filterChangeListener ", filterChangeEvent);
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