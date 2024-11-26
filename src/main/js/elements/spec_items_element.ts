import {SpecItemElement} from './spec_item_element';
import {SpecItem} from "../models";
import {OftState} from "../oft_state";

const SPECITEMS_ELEMENT_ID: string = "#specitems";

export class SpecItemsElement {
    private SpecItemElements: Array<SpecItemElement> = [];

    constructor(private oftState: OftState) {
    }

    public init(specItems: Array<SpecItem>): void {
        specItems.forEach((specItem: SpecItem) => {
            const specItemElement: SpecItemElement = this.createSpecItem(specItem);
            this.insertSpecItemAt(specItemElement);
            if (this.SpecItemElements.length === 1) specItemElement.select(true);
        })
    }

    private createSpecItem(specItem: SpecItem): SpecItemElement {
        return new SpecItemElement(
            specItem.index,
            specItem.name,
            specItem.content,
            specItem.covered,
            specItem.needs,
            specItem.status,
            specItem.path,
            this.oftState
        );
    }

    private insertSpecItemAt(specItem: SpecItemElement, index: number = -1): void {
        specItem.insertToAt($(SPECITEMS_ELEMENT_ID), index);
        this.SpecItemElements.push(specItem);
    }


}