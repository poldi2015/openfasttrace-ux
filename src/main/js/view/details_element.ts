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
import {IElement} from "@main/view/element";
import {SpecItem, STATUS_FIELD_NAMES, TAG_FIELD_NAMES, WRONG_LINK_FIELD_NAME} from "@main/model/specitems";
import {Log} from "@main/utils/log";
import {OftStateController} from "@main/controller/oft_state_controller";
import {ChangeEvent, ChangeListener, EventType} from "@main/model/change_event";
import {IField, Project} from "@main/model/project";
import {CopyButtonElement} from "@main/view/copy_button_element";

const SPECITEM_ID_CLASS = ".specitem-id";
const DETAILS_TABLE_ID = "#details-table";
const DETAILS_STATUS_ID = "#details-status";
const DETAILS_NEEDS_ID = "#details-needs";
const DETAILS_COVERS_ID = "#details-covers";
const DETAILS_TAGS_ID = "#details-tags";
const DETAILS_WRONG_VERSION_LABEL = "#details-wrong-version-label";
const DETAILS_WRONG_VERSION_ID = "#details-wrong-version";
const DETAILS_WRONG_ORPHAN_LABEL = "#details-wrong-orphan-label";
const DETAILS_WRONG_ORPHAN_ID = "#details-wrong-orphan";
const DETAILS_WRONG_UNWANTED_LABEL = "#details-wrong-unwanted-label";
const DETAILS_WRONG_UNWANTED_ID = "#details-wrong-unwanted";
const DETAILS_SOURCE_ID = "#details-source";
const DETAILS_COMMENTS_ID = "#details-comments";
const DETAILS_DEPENDENCIES_ID = "#details-dependencies";
const DETAILS_TAB_CLASS = ".details-tab";
const DETAILS_TAB_CONTENT_CLASS = ".details-tab-content";

const ALL_TABLE_IDS: Array<string> = Array.of(
    DETAILS_STATUS_ID,
    DETAILS_NEEDS_ID,
    DETAILS_COVERS_ID,
    DETAILS_TAGS_ID,
    DETAILS_SOURCE_ID,
    DETAILS_COMMENTS_ID,
    DETAILS_DEPENDENCIES_ID);


export interface IDetailsElement extends IElement {
    init(): IDetailsElement;

    showTab(tabName: string): void;
} // IDetailsElement

export class DetailsElementFactory {
    public build(specItems: Array<SpecItem>, project: Project, oftState: OftStateController): IDetailsElement {
        return new DetailsElement(specItems, project, oftState);
    }
} // DetailsElementFactory

export class DetailsElement implements IDetailsElement {
    constructor(
        private readonly specItems: Array<SpecItem>,
        private readonly project: Project,
        private readonly oftState: OftStateController) {
        this.tableElement = $(DETAILS_TABLE_ID);
        this.copyButton = new CopyButtonElement($("#details-copy-btn"), () => this.currentSpecItemName);
    }

    private readonly tableElement: JQuery;
    private readonly copyButton: CopyButtonElement;
    private currentSpecItemName: string | null = null;

    protected log: Log = new Log("DetailsElement");

    private changeListener: ChangeListener = (event: ChangeEvent): void => {
        event.handleSelectionChange((selectedIndex, _) => this.selectionChangeListener(selectedIndex));
    }

    public init(): IDetailsElement {
        this.copyButton.init();
        this.setupTabSwitching();
        this.deactivate();
        return this;
    }

    public activate(): void {
        this.tableElement.removeAttr("disabled");
        this.oftState.addChangeListener(this.changeListener, EventType.Selection);
    }

    public deactivate(): void {
        this.oftState.removeChangeListener(this.changeListener);
        this.tableElement.attr("disabled", "disabled");
        this.clearTable();
    }

    public isActive(): boolean {
        return this.tableElement.attr("disabled") != undefined;
    }

    /**
     * Switch to the tab with the given name.
     */
    public showTab(tabName: string): void {
        const tab = $(`${DETAILS_TAB_CLASS}[data-tab='${tabName}']`);
        // Remove active class from all tabs and contents
        $(DETAILS_TAB_CLASS).removeClass('details-tab-active');
        $(DETAILS_TAB_CONTENT_CLASS).removeClass('details-tab-content-active');

        // Add active class to clicked tab and corresponding content
        tab.addClass('details-tab-active');
        $(`${DETAILS_TAB_CONTENT_CLASS}[data-tab-content="${tabName}"]`).addClass('details-tab-content-active');
    }

    //
    // Private members

    private setupTabSwitching(): void {
        $(DETAILS_TAB_CLASS).on('click', (event) => this.showTab($(event.currentTarget).data('tab') as string));
    }

    private updateTable(specItem: SpecItem | null): void {
        if (specItem == null) {
            this.log.info("Clearing description");
            this.clearTable();
            this.currentSpecItemName = null;
            this.copyButton.deactivate();
            return;
        }

        this.log.info("Updating description for", specItem!.index);
        this.currentSpecItemName = specItem!.name != null && specItem!.name.length > 0 ? specItem!.name : specItem.id;
        $(SPECITEM_ID_CLASS).text(this.createNavHeaderLabel(specItem!));
        this.copyButton.activate();
        $(DETAILS_STATUS_ID).text(this.createStatusValue(specItem!));
        $(DETAILS_NEEDS_ID).text(this.createTypesValue(specItem!.needs));
        $(DETAILS_COVERS_ID).text(this.createTypesValue(specItem!.provides));
        $(DETAILS_TAGS_ID).text(this.createTagsValue(specItem!));
        $(DETAILS_WRONG_VERSION_LABEL).text(this.createWrongLinkLabel("version"));
        $(DETAILS_WRONG_VERSION_ID).html(this.createWrongLinksValues(specItem!, "version"));
        $(DETAILS_WRONG_ORPHAN_LABEL).text(this.createWrongLinkLabel("orphaned"));
        $(DETAILS_WRONG_ORPHAN_ID).html(this.createWrongLinksValues(specItem!, "orphaned"));
        $(DETAILS_WRONG_UNWANTED_LABEL).text(this.createWrongLinkLabel("unwanted"));
        $(DETAILS_WRONG_UNWANTED_ID).html(this.createWrongLinksValues(specItem!, "unwanted"));
        $(DETAILS_SOURCE_ID).html(this.createSourceValue(specItem!));
        $(DETAILS_COMMENTS_ID).html(this.createCommentsValue(specItem!));
        this.replaceHyperlinkedSpecItems($(DETAILS_DEPENDENCIES_ID), specItem!.depends);
        this.attachWrongLinkCopyButtons();
    }

    /**
     * Extract the label a a wrongLink type from the project configuration.
     */
    private createWrongLinkLabel(type: string): string {
        this.log.info("createWrongLinkLabel", this.project.fieldModels.get(WRONG_LINK_FIELD_NAME)?.fields);
        const fields = this.project.fieldModels.get(WRONG_LINK_FIELD_NAME)?.fields;
        if (fields == null) return "1" + type;
        const typeField = fields!!.filter((field) => field.id === type);
        return typeField.length > 0 && typeField[0].name ? typeField[0].name : "2" + type;
    }

    private clearTable(): void {
        $(SPECITEM_ID_CLASS).html("");
        ALL_TABLE_IDS.forEach((tableID: string) => $(tableID).html(""));
    }


    private createNavHeaderLabel(specItem: SpecItem): string {
        return specItem.id != specItem.name ?
            `#${specItem.index} ${specItem.name} [${specItem.id}]` :
            `#${specItem.index} [${specItem.id}]`;
    }

    private createStatusValue(specItem: SpecItem): string {
        const statusName: string | undefined = this.project.getFieldModel(STATUS_FIELD_NAMES[0]).fields[specItem.status].name;
        return statusName != undefined ? statusName : "";
    }

    private createTypesValue(types: Array<number>): string {
        const typeItems: Array<IField> = this.project.getTypeFieldModel().fields;
        return types.map((index: number) => typeItems[index].label).join(", ");
    }

    private createTagsValue(specItem: SpecItem): string {
        const tagFields: Array<IField> = this.project.getFieldModel(TAG_FIELD_NAMES[0]).fields;
        return specItem.tags.map((index: number) => tagFields[index].name).join(", ");
    }

    private createSourceValue(specItem: SpecItem): string {
        return `<a href="file://${specItem.sourceFile}" tabindex="-1">${specItem.sourceFile}</a>, Line ${specItem.sourceLine}`;
    }

    private createCommentsValue(specItem: SpecItem): string {
        return specItem.comments;
    }

    private createWrongLinksValues(specItem: SpecItem, type: string): string {
        const entries = this.getWrongLinksByType(specItem, type);
        return entries.map((entry) =>
            `<span class="wrong-link-entry">${entry}${this.generateWrongLinkCopyButton(entry)}</span>`
        ).join("<br>");
    }

    private generateWrongLinkCopyButton(entry: string) {
        return `<span class="_copy-btn-sm wrong-link-copy-btn" data-value="${entry}">
                    <span class="_img-content-copy"></span>
               </span>`;
    }

    private getWrongLinksByType(specItem: SpecItem, type: string): Array<string> {
        return specItem.wrongLinkTargets.map((entry) => {
            const match = entry.match(/^(.+?)\[(.+?)]$/);
            return match && type == match[2] ? match[1] : null;
        }).filter((target) => target != null);
    }

    private replaceHyperlinkedSpecItems(dependenciesElement: JQuery, specItemIndexes: Array<number>): void {
        dependenciesElement.find("a._specitem-hyperlink").off("click");
        dependenciesElement.html(specItemIndexes.map((index: number) =>
            `[<a class="_specitem-hyperlink" href="${index}">${this.specItems[index].title}</a>]`
        ).join(", "));
        this.addHyperlinkClickEvent(dependenciesElement);
    }

    private addHyperlinkClickEvent(containerElement: JQuery) {
        this.log.info("set hyperlink", $("a._specitem-hyperlink"));
        containerElement.find("a._specitem-hyperlink").on("click", (event) => {
            event.preventDefault();
            const url: string | null = event.target.getAttribute("href");
            if (url) {
                this.log.info("HYPERLINK", url);
                const index: number = Number.parseInt(url);
                this.oftState.selectAndShowItem(index);
            }
        })
    }

    private attachWrongLinkCopyButtons(): void {
        $('.wrong-link-copy-btn').off('click').on('click', (event) => {
            event.stopPropagation();
            const button = $(event.currentTarget);
            const value = button.data('value');

            if (value) {
                navigator.clipboard.writeText(value).then(() => {
                    this.log.info("Copied to clipboard:", value);
                    button.addClass('_copy-success');
                    setTimeout(() => {
                        button.removeClass('_copy-success');
                    }, 500);
                }).catch(err => {
                    this.log.info("Failed to copy:", err);
                });
            }
        });
    }

    private selectionChangeListener(selectedIndex: number | null) {
        this.log.info("selectionChangeListener index", selectedIndex);
        this.updateTable(selectedIndex != null ? this.specItems[selectedIndex!] : null);
    }

} // DetailsElement