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
import {SpecItemElement} from "@main/view/spec_item_element";
import {OftStateController, SelectionChangeEvent} from "@main/controller/oft_state_controller";
import {CoverType} from "@main/model/oft_state";
import {SpecItem} from "@main/model/specitems";
import {FilterModel} from "@main/model/filter";

const COVERING_TEXT: string = "<<<<  is covering    <<<<";
const IS_COVERED_BY_TEXT: string = ">>>>  is covered by  >>>>";

export class FocusSpecItemElement extends SpecItemElement {
    public constructor(
        specItem: SpecItem,
        public coverType: CoverType,
        oftStateController: OftStateController,
        typeFilterModel: Array<FilterModel>
    ) {
        super(specItem, oftStateController, typeFilterModel);
        this.log.info("Creating FocusSpecItemElement");
    }

    /**
     * UnFocus this item and with that hide focus item.
     */
    public unFocus(): void {
        this.log.info("Unfocusing item");
        // TODO: restore scroll position
        this.oftStateController.unFocusItem(this.specItem.index, this.specItem.path);
    }


    /**
     * If focus item is already selected the cover type is switched via {@link switchCoverType}.
     */
    public select(): boolean {
        if (this.parentElement == null) return false;
        return this.switchCoverType() ? true : super.select();
    }


    //
    // private members

    /**
     * Switch the coverType of this item and in case item is already selected.
     */
    private switchCoverType(): boolean {
        if (this.parentElement == null) return false;
        if (!this.selected) return false;
        this.coverType = (() => {
            switch (this.coverType) {
                case CoverType.covering:
                    return CoverType.coveredBy;
                case CoverType.coveredBy:
                    return CoverType.covering;
                default:
                    throw new Error(`Unknown coverType: ${this.coverType}`);
            }
        })();
        this.log.info("Switching coverType to ", this.coverType);
        this.focus(this.coverType);
        return true;
    }

    //
    // UI Templates

    protected override createTemplate(): JQuery {
        const coverageTemplate: string = this.createCoverageTemplate();
        const draft: string = this.createDraftTemplate();
        const coverType: string = this.createCoverTypeTemplate();
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

    private createCoverTypeTemplate(): string {
        if (this.coverType == CoverType.covering) {
            return `<div class="_specitem-cover-type">${COVERING_TEXT}</div>`;
        } else {
            return `<div class="_specitem-cover-type">${IS_COVERED_BY_TEXT}</div>`;
        }
    }

    private updateCoverTypeElement(): void {
        this.element.find("._specitem-cover-type").html(this.coverType == CoverType.covering ? COVERING_TEXT : IS_COVERED_BY_TEXT);
    }

    protected override addListenersToTemplate(template: JQuery): JQuery {
        template = super.addListenersToTemplate(template);
        template.off("click");
        template.on("click", () => this.select());
        template.off("dblclick");
        template.on("dblclick", () => this.unFocus());

        return template;
    }


    //
    // Event listeners

    protected selectionChangeListener(event: SelectionChangeEvent) {
        this.updateCoverTypeElement();
        super.selectionChangeListener(event);
    }


} // FocusSpecItemElement