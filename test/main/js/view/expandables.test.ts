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