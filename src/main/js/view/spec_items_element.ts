import {SpecItemElement} from './spec_item_element';
import {SpecItem} from "../model/specitems";
import {OftStateController} from "../controller/oft_state_controller";

const SPECITEMS_ELEMENT_ID: string = "#specitems";

export class SpecItemsElement {
    private SpecItemElements: Array<SpecItemElement> = [];

    constructor(private oftStateController: OftStateController) {
    }

    public init(specItems: Array<SpecItem>): void {
        specItems.forEach((specItem: SpecItem) => {
            const specItemElement: SpecItemElement = this.createSpecItem(specItem);
            this.insertSpecItemAt(specItemElement);
            if (this.SpecItemElements.length === 1) specItemElement.select();
        })
    }

    private createSpecItem(specItem: SpecItem): SpecItemElement {
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
        this.SpecItemElements.push(specItem);
    }

} // SpecItemsElement