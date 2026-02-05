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
        const metaData = new Project(projectData, {
            project: {maxcovering: 3},
            fields: metadata.filters
        });

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