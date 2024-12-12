import {pushTo} from "@main/utils/collections";
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