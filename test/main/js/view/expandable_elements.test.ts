/*
  OpenFastTrace UX

 Copyright (C) 2016 - 2024 itsallcode.org

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
import {ExpandableElements} from "@main/view/expandable_elements";
import {$} from "@test/fixtures/dom";

const SAMPLE_DOCUMENT_SINGLE_EXPANDABLE = '<div class="expandable" data-title="Title">Content</div>';

const GOLDEN_SAMPLE_SINGLE_EXPANDABLE_EXPANDED = `
    <div class="_expandable-header">
        <span>Title</span>            
    </div>
    <div class="_expandable-content visible">Content</div>`;

const GOLDEN_SAMPLE_SINGLE_EXPANDABLE_COLLAPSED = `
    <div class="_expandable-header collapsed">
        <span>Title</span>            
    </div>
    <div class="_expandable-content">Content</div>`;

describe("Tests for expandable elements", () => {
    test("expandable class initialized is expanded", () => {
        $("body").append(SAMPLE_DOCUMENT_SINGLE_EXPANDABLE);
        new ExpandableElements().init();

        const expandable: JQuery = $(".expandable");
        expect(expandable).toMatchHTML(GOLDEN_SAMPLE_SINGLE_EXPANDABLE_EXPANDED);
    });

    test("expandable class clicked is collapsed", () => {
        $("body").append(SAMPLE_DOCUMENT_SINGLE_EXPANDABLE);
        new ExpandableElements().init();

        const expandable: JQuery = $(".expandable");
        const header: HTMLElement = $(".expandable span")[0];
        header.click();
        expect(expandable).toMatchHTML(GOLDEN_SAMPLE_SINGLE_EXPANDABLE_COLLAPSED);
    });

    test("expandable class double clicked is expanded", () => {
        $("body").append(SAMPLE_DOCUMENT_SINGLE_EXPANDABLE);
        new ExpandableElements().init();

        const expandable: JQuery = $(".expandable");
        const header: HTMLElement = $(".expandable span")[0];
        header.click();
        header.click();
        expect(expandable).toMatchHTML(GOLDEN_SAMPLE_SINGLE_EXPANDABLE_EXPANDED);
    });
});