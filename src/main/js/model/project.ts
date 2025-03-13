import {TYPE_FIELD_NAME} from "@main/model/specitems";

/**
 * List of all available filters with selectable entries.
 *
 * The FilterModels are populated by the generated window.metadata.
 */
export type FieldConfigurations = Record<string, Array<IField>>;

/**
 * Project data in window.specitem.project.
 */
export interface IProjectData {
    projectName: string,
    types: Array<string>,
    tags: Array<string>,
    status: Array<string>,
    item_count: number,
    item_covered: number,
    item_uncovered: number,
} // IProjectData

/**
 * A single field
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
        public readonly projectName: string,
        public readonly types: Array<string>,
        public readonly typedFieldNames: Array<string>,
        public readonly tags: Array<string>,
        public readonly tagFieldNames: Array<string>,
        public readonly statusNames: Array<string>,
        public readonly statusFieldNames: Array<string>,
        public readonly itemCount: number,
        public readonly itemCovered: number,
        public readonly itemUncovered: number,
        private readonly fieldCounts: Map<string, Array<number>>,
        configurations: FieldConfigurations
    ) {
        const fieldConfigurations: Map<string, Array<IField>> = new Map(Object.entries(configurations));
        Project.generateFieldModels(typedFieldNames, types, fieldConfigurations, fieldCounts).forEach((value, key) => this.fieldModels.set(key, value));
        Project.generateFieldModels(tagFieldNames, tags, fieldConfigurations, fieldCounts).forEach((value, key) => this.fieldModels.set(key, value));
        Project.generateFieldModels(statusFieldNames, statusNames, fieldConfigurations, fieldCounts).forEach((value, key) => this.fieldModels.set(key, value));

    }

    public readonly fieldModels: Map<String, Array<IField>> = new Map();

    public readonly typeCount: Array<number> = new Array<number>();
    public readonly uncoveredCount: Array<number> = new Array<number>();
    public readonly statusCount: Array<number> = new Array<number>();
    public readonly tagCount: Array<number> = new Array<number>();

    public getTypeFieldModel(): Array<IField> {
        return this.getFieldModel(TYPE_FIELD_NAME);
    }

    public hasField(name: string): boolean {
        return this.fieldModels.has(name);
    }

    public getFieldModel(name: string): Array<IField> {
        return this.fieldModels.has(name) ? this.fieldModels.get(name)!! : Array.of();
    }

    //
    // private members

    /**
     * Generates the models used e.g. for test selection lists.
     *
     * Models are only generated based on fieldNames only if configurations know the field name.
     *
     * @param fieldNames possible field names like type, status, tags
     * @param fieldIds identifier names of field entries
     * @param configurations meta_data.js metamodel for the project field models
     * @param fieldCounts the number of items for each field
     */
    static generateFieldModels(fieldNames: Array<string>,
                               fieldIds: Array<string>,
                               configurations: Map<string, Array<IField>>,
                               fieldCounts: Map<string, Array<number>>)
        : Map<string, Array<IField>> {

        return new Map(fieldNames
            .filter((name) => configurations.has(name))
            .map((name) => [name, Project.createFieldModels(fieldIds, configurations.get(name), fieldCounts.get(name))])
        );
    }

    /**
     * Generates the field models for one fieldName (e.g. type, status or tags).
     *
     * @param fieldIds The ids of all entries in a fieldModel provided by meta_data.js
     * @param fieldConfiguration The meta_data.js content
     * @param fieldCounts The number of items for each field
     */
    static createFieldModels(fieldIds: Array<string>, fieldConfiguration: Array<IField> | undefined, fieldCounts: Array<number> | undefined): Array<IField> {
        const namedFieldConfiguration: Map<string, IField> = fieldConfiguration != undefined
            ? new Map(fieldConfiguration.map((item) => [item.id, item]))
            : new Map();

        return fieldIds.map((fieldId) => {
            const idIndex: number = fieldIds.indexOf(fieldId);
            const count: number = (fieldCounts != undefined && fieldCounts.length > idIndex) ? fieldCounts[idIndex] : -1;
            return Project.createFieldModel(fieldId, namedFieldConfiguration.get(fieldId), count);
        });
    }

    /**
     * Generates on entry of a field set identified by a field name.
     *
     * @param id The Id of the field
     * @param configuration the model of the field read out of meta_data.js
     * @param count the number of this entry or -1 if not available
     */
    static createFieldModel(id: string, configuration: IField | undefined, count: number): IField {
        const field: IField = new Field(id).copyFromSameId(configuration);
        if (count >= 0) field.item_count = count;
        return field;
    }

} // Project