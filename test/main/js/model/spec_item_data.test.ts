import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {STATUS_FIELD_NAMES, TAG_FIELD_NAMES, TYPED_FIELD_NAMES} from "@main/model/specitems";
import {FieldConfigurations, IField, IProjectData, Project} from "@main/model/project";
import {metadata} from "@test/samples/meta_data";
import {project} from "@test/samples/specitem_data";

describe("Tests for SpecItemMetaData", () => {
    test('tests filling meta data', () => {
        const projectData: IProjectData = project;
        const configuration: FieldConfigurations = metadata.filters;
        const metaData = new Project(
            projectData.projectName,
            projectData.types,
            TYPED_FIELD_NAMES,
            projectData.tags,
            TAG_FIELD_NAMES,
            projectData.status,
            STATUS_FIELD_NAMES,
            projectData.item_count,
            projectData.item_covered,
            projectData.item_uncovered,
            new Map(),
            configuration
        );

        expect(metaData.projectName).toBe(project.projectName);
        expect(metaData.types).toStrictEqual(project.types);
        const tagModels : Array<IField> = metaData.getFieldModel(TAG_FIELD_NAMES[0]);
        const expectedTooltip = ["Version 2.0","Version 0.1","Version 1.0","",""];
        const expectedLabel = ["ver 2.0","v0.1","ver 1.0","comp1","comp"];
        const expectedName = ["VERSION two.zero","v0.1","ver 1.0","comp1","comp"];
        project.tags.forEach((tag: string,index:number) => {
            expect(tagModels[index].id,"tagModel.id").toBe(tag);
            expect(tagModels[index].label,"tagModel.label").toBe(expectedLabel[index]);
            expect(tagModels[index].name,"tagModel.name").toBe(expectedName[index]);
            expect(tagModels[index].tooltip,"tagModel.tooltip").toBe(expectedTooltip[index]);
        });
    });
});