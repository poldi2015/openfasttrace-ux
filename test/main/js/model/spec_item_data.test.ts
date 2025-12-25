import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";
import {TAG_FIELD_NAMES} from "@main/model/specitems";
import {IField, IProjectMetaData, Project} from "@main/model/project";
import {metadata} from "@test/samples/meta_data";
import {project} from "@test/samples/specitem_data";

describe("Tests for SpecItemMetaData", () => {
    test('tests filling meta data', () => {
        const projectData: IProjectMetaData = {
            projectName: project.projectName,
            types: project.types,
            tags: project.tags,
            status: project.status,
            wronglinkNames: [],
            item_count: project.item_count,
            item_covered: project.item_covered,
            item_uncovered: project.item_uncovered,
            type_count: [],
            uncovered_count: [],
            status_count: [],
            tag_count: [],
            wronglink_count: []
        };
        const metaData = new Project(projectData, metadata.filters);

        expect(metaData.project.projectName).toBe(project.projectName);
        expect(metaData.project.types).toStrictEqual(project.types);
        const tagModels: Array<IField> = metaData.getFieldModel(TAG_FIELD_NAMES[0]).fields;
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