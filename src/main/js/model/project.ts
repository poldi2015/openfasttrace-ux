import {
    COVERAGE_FIELD_NAME,
    SpecItem,
    STATUS_FIELD_NAME,
    TAGS_FIELD_NAME,
    TYPE_FIELD_NAME,
    WRONG_LINK_FIELD_NAME
} from "@main/model/specitems";
import {FieldFilter, FieldFilterMatcher, Filter} from "@main/model/filter";
import {Log} from "@main/utils/log";

export interface IConfiguration {
    project: IConfigurationProject,
    fields: FieldMetaData,
}

export interface IConfigurationProject {
    maxcovering: number,
}
/**
 * List of all available filters with selectable entries.
 *
 * The FilterModels are populated by the generated window.metadata.
 */
export type FieldMetaData = Record<string, Array<IField>>;

/**
 * Project data in window.specitem.project.
 *
 * Model used by the {@link Project} and by window.metadata.
 */
export interface IProjectMetaData {
    projectName: string,
    types: Array<string>,
    tags: Array<string>,
    status: Array<string>,
    wronglinkNames: Array<string>,
    item_count: number,
    item_covered: number,
    item_uncovered: number,
    type_count: Array<number>,
    uncovered_count: Array<number>,
    status_count: Array<number>,
    tag_count: Array<number>,
    wronglink_count: Array<number>,
} // IProjectData


/**
 * FieldModel represent the visualization of entries in the specItem.
 *
 * They are used to provide readable names, tooltips and filter for the filter sidebar.
 *
 * @id The id as shown up in the specItem and the project meta model
 * @fieldEntries all possible field entry values that show up in the specItem (they are there identified by an id)
 * @matcher the filter applied by the filter sidebar
 */
export class FieldModel {
    constructor(
        public readonly id: string,
        public readonly fields: Array<IField> = [],
        private readonly matcher: FieldFilterMatcher,
    ) {
        this.fieldById = new Map(fields.map(field => [field.id, field]));
    }

    public readonly fieldById: Map<string, IField>;

    public createFilter(fieldIndexes: Array<number>): Filter {
        return new FieldFilter(this.id, fieldIndexes, this.matcher);
    }

} // FieldConfiguration

/**
 * A single entry of a Field (described in the FieldModel).
 *
 * It provides human readable values of the field and a number of specItems related to the entry.
 *
 * Model used by the {@link Project} and by window.metadata.
 *
 * @id The id as used in the specItem
 * @label an optional human readable label used sa short form in badges and in details view, defaults to id
 * @name a optional human readable name used in lists
 * @tooltip an optional tooltip shown in the UI
 * @color unused
 * @item_count number of specItems related to this field entry
 */
export interface IField {
    id: string,
    label?: string;
    name?: string,
    tooltip: string,
    color?: string,
    item_count: number,
} // IFieldModel

export class Field implements IField {
    constructor(
        id: string,
        label?: string,
        name?: string,
        tooltip: string = "",
        color?: string,
        item_count: number = -1,
    ) {
        this.id = id;
        this.label = label !== undefined ? label : id;
        this.name = name !== undefined ? name : this.label;
        this.tooltip = tooltip;
        this.color = color;
        this.item_count = item_count;
    }

    public id: string;
    public label: string | undefined;
    public name: string | undefined;
    public tooltip: string;
    public color: string | undefined;
    public item_count: number;

    public copyFromSameId(model: IField | undefined): Field {
        if (model != undefined && model.id === this.id) {
            if (model.label != undefined && model.label != model.id) this.label = model.label;
            if (model.name != undefined && model.name != model.id) this.name = model.name;
            if (this.name == undefined || this.name == this.id) this.name = this.label;
            if (model.tooltip != "") this.tooltip = model.tooltip;
            if (model.color != undefined) this.color = model.color;
            if (model.item_count >= 0) this.item_count = model.item_count;
        }
        return this;
    }
} // FieldModel

export class Project {
    constructor(
        public readonly project: IProjectMetaData,
        public readonly configuration: IConfiguration
    ) {
        // Populate fieldModels (e.g. used for filters)
        this.addFieldModel(TYPE_FIELD_NAME, project.types, project.type_count, Project.createTypeFieldFilterMatcher());
        this.addFieldModel(COVERAGE_FIELD_NAME, Project.COVERAGE_FIELDS, this.getCoverageFieldCounters(project), this.createCoverageFieldFilterMatcher());
        this.addFieldModel(WRONG_LINK_FIELD_NAME, project.wronglinkNames, project.wronglink_count, Project.createWrongLinkMatcher());
        this.addFieldModel(STATUS_FIELD_NAME, project.status, project.status_count, Project.createStatusFieldFilterMatcher());
        this.addFieldModel(TAGS_FIELD_NAME, project.tags, project.tag_count, Project.createTagsFieldFilterMatcher());

        // Provide type labels and names
        this.typeLabels = this.fieldModels.get(TYPE_FIELD_NAME)!.fields.map(field => field.label) as Array<string>;
        this.typeNames = this.fieldModels.get(TYPE_FIELD_NAME)!.fields.map(field => field.name) as Array<string>;
    }

    private readonly log = new Log("Project");

    public readonly fieldModels: Map<string, FieldModel> = new Map();

    public readonly typeIds: Array<string> = this.project.types;
    public readonly typeLabels: Array<string>;
    public readonly typeNames: Array<string>;

    public getTypeFieldModel(): FieldModel {
        return this.getFieldModel(TYPE_FIELD_NAME);
    }

    public hasField(name: string): boolean {
        return this.fieldModels.has(name);
    }

    public getFieldModel(name: string): FieldModel {
        return this.fieldModels.has(name) ? this.fieldModels.get(name)!! : new FieldModel(name, [], () => false);
    }

    private createCoverageFieldFilterMatcher() {
        return (specItem: SpecItem, fieldIndexes: Array<number>) =>
            // field = 0 matches specItems that are fully covered
            (fieldIndexes.includes(0) && specItem.uncovered.length === 0) ||
            // field = 1 matches specItems that are not fully covere
            (fieldIndexes.includes(1) && specItem.uncovered.length != 0);
    }



    //
    // private members


    private addFieldModel(id: string,
                          fieldIds: Array<string>,
                          fieldCounts: Array<number>,
                          matcher: FieldFilterMatcher): void {
        this.fieldModels.set(id, new FieldModel(id, this.createFields(fieldIds, this.configuration.fields[id], fieldCounts), matcher));
    }

    /**
     * Generates the fields for a {@link FieldModel}.
     *
     * @param fieldIds Field IDs taken from the specitem_data project data (e.g. types, tags, status)
     * @param fieldMetaData The meta_data.js field models
     * @param fieldCounts The number of items for each field from the specitem_data project data
     */
    private createFields(fieldIds: Array<string>, fieldMetaData: Array<IField> | undefined, fieldCounts: Array<number>): Array<IField> {
        const namedFieldMetaData: Map<string, IField> = fieldMetaData != undefined
            ? new Map(fieldMetaData.map((item) => [item.id, item]))
            : new Map();

        return fieldIds.map((fieldId) => {
            this.log.info(`createFields id=${fieldId} counts=${fieldCounts}`);
            const idIndex: number = fieldIds.indexOf(fieldId);
            const count: number = fieldCounts.length > idIndex ? fieldCounts[idIndex] : -1;
            return Project.createField(fieldId, namedFieldMetaData.get(fieldId), count);
        });
    }

    /**
     * Generates on entry of a field set identified by a field name.
     *
     * @param id The Id of the field
     * @param configuration the model of the field read out of meta_data.js
     * @param count the number of this entry or -1 if not available
     */
    private static createField(id: string, configuration: IField | undefined, count: number): IField {
        const field: IField = new Field(id).copyFromSameId(configuration);
        if (count >= 0) field.item_count = count;
        return field;
    }


    // Field matchers

    /**
     * Create a matcher that matches field ids to {@link SpecItem.type}.
     */
    public static createTypeFieldFilterMatcher(): FieldFilterMatcher {
        return (specItem, fieldIndexes) => fieldIndexes.includes(specItem.type);
    }

    /**
     * Create a matcher that matches field ids to {@link SpecItem.tags}.
     */
    private static createTagsFieldFilterMatcher(): FieldFilterMatcher {
        return (specItem, fieldIndexes) => fieldIndexes.some(index => specItem.tags.includes(index));
    }

    private static readonly COVERAGE_FIELDS = ["covered", "uncovered"];

    private getCoverageFieldCounters(project: IProjectMetaData): Array<number> {
        return [project.item_covered, project.item_uncovered];
    }

    /**
     * Create a matcher that matches field ids to {@link SpecItem.wrongLinkTypes}.
     */
    private static createWrongLinkMatcher(): FieldFilterMatcher {
        return (specItem, fieldIndexes) => fieldIndexes.some((wrongLinkType) => specItem.wrongLinkTypes.includes(wrongLinkType));
    }


    /**
     * Create a matcher that matches field ids to {@link SpecItem.status}.
     */
    private static createStatusFieldFilterMatcher(): FieldFilterMatcher {
        return (specItem, fieldIndexes) => fieldIndexes.includes(specItem.status);
    }

} // Project
