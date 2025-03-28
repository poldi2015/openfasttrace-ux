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
import {SpecItem} from "@main/model/specitems";
import {IndexFilter, NameFilter, SelectionFilter} from "@main/model/filter";

const SampleSpecItem: SpecItem = {
    index: 1,
    type: 1,
    title: "sample-spec-item",
    name: "sample-spec-item",
    id: "req:sample-spect-item:2",
    tags: [],
    version: 2,
    content: "Sample SpecItem content",
    provides: [],
    needs: [],
    covered: [2, 3, 4],
    uncovered: [3, 4, 5],
    covering: [7, 8, 9],
    coveredBy: [1, 2, 3],
    depends: [],
    status: 0,
    path: ["sample", "spec", "item"],
    sourceFile: "",
    sourceLine: 0,
    comments: ""
}

describe("filters SelectionFilter", () => {
    test('test matching SelectionFilter matching type', () => {
        const typeFilterMatching: boolean = new SelectionFilter("type", [1, 2]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching SelectionFilter not matching type', () => {
        const typeFilterMatching: boolean = new SelectionFilter("type", [7]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });

    test('test matching SelectionFilter matching covered', () => {
        const typeFilterMatching: boolean = new SelectionFilter("covered", [2, 3]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching SelectionFilter not matching covered', () => {
        const typeFilterMatching: boolean = new SelectionFilter("covered", [6, 7]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });

    test('test matching SelectionFilter not matching unknown filter', () => {
        const typeFilterMatching: boolean = new SelectionFilter("any", [6, 7]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });

    test('test matching SelectionFilter empty list matches always', () => {
        const typeFilterMatching: boolean = new SelectionFilter("type", []).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });
});

describe("filters.ts IndexFilter", () => {
    test('test matching IndexFilter matching selected indexes', () => {
        const typeFilterMatching: boolean = new IndexFilter([1, 2]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching IndexFilter not matching selected indexes', () => {
        const typeFilterMatching: boolean = new IndexFilter([6, 7]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });

    test('test matching IndexFilter not matching empty index list', () => {
        const typeFilterMatching: boolean = new IndexFilter([]).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });

    test('test matching IndexFilter not matching no indexes', () => {
        const typeFilterMatching: boolean = new IndexFilter(null).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

});

describe("filters.ts NameFilter", () => {
    test('test matching NameFilter matching substring', () => {
        const typeFilterMatching: boolean = new NameFilter("-spec", false).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching NameFilter matching substring with version', () => {
        const typeFilterMatching: boolean = new NameFilter("-item:2", false).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching NameFilter matching empty string', () => {
        const typeFilterMatching: boolean = new NameFilter("", false).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching NameFilter not matching string', () => {
        const typeFilterMatching: boolean = new NameFilter("sample-spec-item:7", false).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });

    test('test matching NameFilter matching regexp', () => {
        const typeFilterMatching: boolean = new NameFilter("sample.*item", true).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeTruthy();
    });

    test('test matching NameFilter not matching regexp', () => {
        const typeFilterMatching: boolean = new NameFilter("samplers.*item", true).matches(SampleSpecItem);
        expect(typeFilterMatching).toBeFalsy();
    });
});