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
import {init} from "@main/view/expandables";
import {$} from "@test/fixtures/dom";

const SAMPLE_DOCUMENT_SINGLE_EXPANDABLE = '<div class="expandable-widget" data-title="Title"></div>';
const GOLDEN_SAMPLE_SINGLE_EXPANDABLE = `
    <div class="_expandable-widget-header">
        <span onclick="window.Expandables.toggleExpansion(this.parentNode)">Title</span>            
    </div>
    <div class="_expandable-widget-content visible"></div>`;

describe("Tests for expandable elements", () => {
    test("Initialize expandable elements", () => {
        $("body").append(SAMPLE_DOCUMENT_SINGLE_EXPANDABLE);
        init();
        expect($(".expandable-widget")).toMatchHTML(GOLDEN_SAMPLE_SINGLE_EXPANDABLE);
    });
});