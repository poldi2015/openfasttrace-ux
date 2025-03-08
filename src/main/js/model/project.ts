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
    status : Array<string>,
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
            if( this.name == undefined || this.name == this.id ) this.name = this.label;
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
        public readonly statusNames : Array<string>,
        public readonly statusFieldNames: Array<string>,
        public readonly itemCount: number,
        public readonly itemCovered: number,
        public readonly itemUncovered: number,
        configurations: FieldConfigurations
    ) {
        const fieldConfigurations: Map<string, Array<IField>> = new Map(Object.entries(configurations));
        Project.generateFieldModels(typedFieldNames,types,fieldConfigurations).forEach((value, key) => this.fieldModels.set(key, value));
        Project.generateFieldModels(tagFieldNames,tags,fieldConfigurations).forEach((value, key) => this.fieldModels.set(key, value));
        Project.generateFieldModels(statusFieldNames,statusNames,fieldConfigurations).forEach((value, key) => this.fieldModels.set(key, value));
    }

    public readonly fieldModels: Map<String, Array<IField>> = new Map();

    public getTypeFieldModel() : Array<IField> {
        return this.getFieldModel(TYPE_FIELD_NAME);
    }

    public hasField(name:string) : boolean {
        return this.fieldModels.has(name);
    }

    public getFieldModel(name: string): Array<IField> {
        return this.fieldModels.has(name) ? this.fieldModels.get(name)!! : Array.of();
    }

    //
    // private members

    static generateFieldModels(fieldNames: Array<string>, ids: Array<string>, configurations: Map<string, Array<IField>>)
        : Map<string, Array<IField>> {

        return new Map(fieldNames.filter((name) => configurations.has(name)).map((name) => [name, Project.createFieldModels(ids, configurations.get(name))]));
    }

    static createFieldModels(ids: Array<string>, fieldConfiguration: Array<IField> | undefined): Array<IField> {
        const namedFieldConfiguration: Map<string, IField> = fieldConfiguration != undefined
            ? new Map(fieldConfiguration.map((item) => [item.id, item]))
            : new Map();
        return ids.map((id) => Project.createFieldModel(id, namedFieldConfiguration.get(id)));
    }

    static createFieldModel(id: string, configuration: IField | undefined): IField {
        return new Field(id).copyFromSameId(configuration);
    }
} // Project