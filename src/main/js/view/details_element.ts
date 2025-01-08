import {IElement} from "@main/view/element";
import {SpecItem, SpecItemStatus} from "@main/model/specitems";
import {
    ChangeEvent,
    ChangeListener,
    OftStateController,
    SelectionChangeEvent
} from "@main/controller/oft_state_controller";
import {IFilterElement} from "@main/view/filter_element";
import {Log} from "@main/utils/log";
import {Filter, IndexFilter} from "@main/model/filter";
import {CoverType, FilterName} from "@main/model/oft_state";

const SPECITEM_ID_CLASS = ".specitem-id";
const DETAILS_TABLE_ID = "#details-table";
const DETAILS_STATUS_ID = "#details_status";
const DETAILS_NEEDS_ID = "#details_needs";
const DETAILS_COVERS_ID = "#details-covers";
const DETAILS_TAGS_ID = "#details-tags";
const DETAILS_SOURCE_ID = "#details-source";
const DETAILS_COMMENTS_ID = "#details-comments";
const DETAILS_DEPENDENCIES_ID = "#details-dependencies";

const ALL_TABLE_IDS: Array<string> = Array.of(
    DETAILS_STATUS_ID,
    DETAILS_NEEDS_ID,
    DETAILS_COVERS_ID,
    DETAILS_TAGS_ID,
    DETAILS_SOURCE_ID,
    DETAILS_COMMENTS_ID,
    DETAILS_DEPENDENCIES_ID);


export interface IDetailsElement extends IElement {
} // IDetailsElement

export class DetailsElementFactory {
    public build(specItems: Array<SpecItem>, types: Array<string>, tags: Array<string>, oftState: OftStateController): IFilterElement {
        return new DetailsElement(specItems, types, tags, oftState);
    }
} // DetailsElementFactory

export class DetailsElement implements IDetailsElement {
    constructor(
        private readonly specItems: Array<SpecItem>,
        private readonly types: Array<string>,
        private readonly tags: Array<string>,
        private readonly oftState: OftStateController) {
        this.tableElement = $(DETAILS_TABLE_ID);
    }

    private readonly tableElement: JQuery<HTMLElement>;

    protected log: Log = new Log("DetailsElement");

    private changeListener: ChangeListener = (event: ChangeEvent): void => {
        this.selectionChangeListener(event as SelectionChangeEvent);
    }

    public init(): IDetailsElement {
        this.deactivate();
        return this;
    }

    public activate(): void {
        this.tableElement.removeAttr("disabled");
        this.oftState.addChangeListener(SelectionChangeEvent.TYPE, this.changeListener);
    }

    public deactivate(): void {
        this.oftState.removeChangeListener(this.changeListener);
        this.tableElement.attr("disabled", "disabled");
        this.clearTable();
    }

    public isActive(): boolean {
        return this.tableElement.attr("disabled") != undefined;
    }

    //
    // Private members

    private updateTable(specItem: SpecItem | null): void {
        if (specItem == null) {
            this.log.info("Clearing description");
            this.clearTable();
            return;
        }

        this.log.info("Updating description for", specItem!.index);
        $(SPECITEM_ID_CLASS).text(this.createNavHeaderLabel(specItem!));
        $(DETAILS_STATUS_ID).text(this.createDraftValue(specItem!));
        $(DETAILS_NEEDS_ID).text(this.createTypesValue(specItem!.needs));
        $(DETAILS_COVERS_ID).text(this.createTypesValue(specItem!.provides));
        $(DETAILS_TAGS_ID).text(this.createTagsValue(specItem!));
        $(DETAILS_SOURCE_ID).html(this.createSourceValue(specItem!));
        $(DETAILS_COMMENTS_ID).html(this.createCommentsValue(specItem!));
        this.replaceHyperlinkedSpecItems($(DETAILS_DEPENDENCIES_ID), specItem!.depends);
    }

    private clearTable(): void {
        $(SPECITEM_ID_CLASS).html("");
        ALL_TABLE_IDS.forEach((tableID: string) => $(tableID).html(""));
    }


    private createNavHeaderLabel(specItem: SpecItem): string {
        return `[${specItem.name}]`;
    }

    private createDraftValue(specItem: SpecItem): string {
        switch (specItem.status) {
            case SpecItemStatus.Draft:
                return "Draft";
            default:
                return "Accepted";
        }
    }

    private createTypesValue(types: Array<number>): string {
        return types.map((index: number) => this.types[index]).join(", ");
    }

    private createTagsValue(specItem: SpecItem): string {
        return specItem.tags.map((index: number) => this.tags[index]).join(", ");
    }

    private createSourceValue(specItem: SpecItem): string {
        return `<a href="file://${specItem.sourceFile}">${specItem.sourceFile}</a>, Line ${specItem.sourceLine}`;
    }

    private createCommentsValue(specItem: SpecItem): string {
        return specItem.comments;
    }

    private replaceHyperlinkedSpecItems(dependenciesElement: JQuery<HTMLElement>, specItemIndexes: Array<number>): void {
        dependenciesElement.find("a._specitem-hyperlink").off("click");
        dependenciesElement.html(specItemIndexes.map((index: number) =>
            `[<a class="_specitem-hyperlink" href="${index}">${this.specItems[index].name}</a>]`
        ).join(", "));
        this.addHyperlinkClickEvent(dependenciesElement);
    }

    private addHyperlinkClickEvent(containerElement: JQuery<HTMLElement>) {
        this.log.info("set hyperlink", $("a._specitem-hyperlink"));
        containerElement.find("a._specitem-hyperlink").on("click", (event) => {
            //this.log.info("BUM",event.target);
            event.preventDefault();
            const url: string | null = event.target.getAttribute("href");
            if (url) {
                this.log.info("HYPERLINK", url);
                const index: number = Number.parseInt(url);
                const path: Array<string> = this.specItems[index].path;
                const filters: Map<FilterName, Filter> = new Map([[IndexFilter.FILTER_NAME, new IndexFilter(this.specItems[index].covering)]]);
                this.oftState.focusItem(index, path, CoverType.covering, new Map<FilterName, Filter>(), 0);
            }
        })
    }

    private selectionChangeListener(event: SelectionChangeEvent) {
        this.updateTable(event.index != null ? this.specItems[event.index!] : null);
    }

} // DetailsElement