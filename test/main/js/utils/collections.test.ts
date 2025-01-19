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
import {enumIds, enumNames, pushTo, sameArrayValues} from "@main/utils/collections";
import {describe, expect} from "vitest";
import {test} from "@test/fixtures/fixtures";

describe("Test pushTo API", () => {
    test('pushTo() existing array', () => {
        expect(pushTo([1, 2, 3], 5)).toStrictEqual([1, 2, 3, 5]);
    });

    test('pushTo() undefined array', () => {
        expect(pushTo(undefined, 5)).toStrictEqual([5]);
    });
});

describe("test sameArrayValues", () => {
    test('samArrayValues returns true if both array contain same values', () => {
        expect(sameArrayValues(["A", "B", "C"], ["C", "A", "B"])).toBeTruthy();
    });

    test('samArrayValues returns false if both array contain different values', () => {
        expect(sameArrayValues([5, 3, 2], [3, 2])).toBeFalsy();
    });
});

describe(("enumNames"), () => {
    test("numNames returns the names of number indexed enum type as array", () => {
        enum A {
            B,
            C,
        }

        expect(enumNames(A)).toStrictEqual(["B", "C"]);
    });
});

describe(("enumIds"), () => {
    test("enumIds returns the numbered IDs of on an enum type as array", () => {
        enum A {
            B = 0,
            C = 5,
        }

        expect(enumIds(A)).toStrictEqual([0, 5]);
    });
});