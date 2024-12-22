import {SpecItemElement} from "@main/view/spec_item_element";
import {OftStateController} from "@main/controller/oft_state_controller";
import {CoverType} from "@main/model/oft_state";
import {SpecItem} from "@main/model/specitems";

export class FocusSpecItemElement extends SpecItemElement {
    public constructor(
        specItem: SpecItem,
        public readonly coverType: CoverType,
        oftStateController: OftStateController
    ) {
        super(specItem, oftStateController);
    }

    /**
     * UnFocus this item and with that hide focus item.
     */
    public unFocus(): void {
        this.log.info("Unfocusing item");
        this.oftStateController.unFocusItem(this.specItem.index, this.specItem.path);
    }

    protected override createTemplate(): JQuery {
        const coverageTemplate: string = this.createCoverageTemplate();
        const draft: string = this.createDraftTemplate();
        const coverType:string = this.createCoverTypeTemplate();
        const template: JQuery = $(`
            <div class="specitem _focuspecitem" id="${this.elementId}">
                <div class="_specitem-header">
                    <div class="_specitem-name">[${this.typeLabel}:${this.specItem.name}${this.specItem.version > 1 ? ":" + this.specItem.version : ""}]</div>${draft}
                    <div class="_specitem-status">${coverageTemplate}&nbsp;&nbsp;Close</div>                    
                </div>
                <div class="_specitem-body">
                    ${this.specItem.content}                
                </div>
                ${coverType}                
            </div>             
        `);

        return this.addListenersToTemplate(template);
    }

    private createCoverTypeTemplate():string {
        if(this.coverType === CoverType.covering) {
            return `<div class="_specitem-cover-type">is covering</div>`;
        } else {
            return `<div class="_specitem-cover-type">is covered by</div>`;
        }
    }

    protected override addListenersToTemplate(template: JQuery): JQuery {
        template = super.addListenersToTemplate(template);
        template.off("dblclick");
        template.on("dblclick", () => {
            this.unFocus();
        });

        return template;
    }

} // FocusSpecItemElement