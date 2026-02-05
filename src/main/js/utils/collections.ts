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

import {Filter} from "@main/model/filter";
import {FilterName} from "@main/model/oft_state";

/**
 * Add an entry to a possible undefined array.
 *
 * @param array The possible undefined array
 * @param entry The item to add
 */
export function pushTo<T>(array: Array<T> | undefined, entry: T): Array<T> {
    array = array ?? [];
    array.push(entry);

    return array;
}

/**
 * Returns true if two arrays have the same values independent of the order of the entries.
 *
 * @param a First array
 * @param b Second array
 */
export function sameArrayValues<T>(a: Array<T>, b: Array<T>): boolean {
    const setA: Set<T> = new Set(a);
    const setB: Set<T> = new Set(b);
    return a.length == b.length && [...setA].every(value => setB.has(value));
}

type EnumType = Record<number, string>;

/**
 *
 * @param enumType an enum type
 * @return Array of strings of the names of the enum entries
 */
export function enumNames<T extends EnumType>(enumType: T): (T[keyof T])[] {
    return Object.values(enumType).filter(name => typeof name === "string") as (T[keyof T])[];
}

/**
 * @param enumType an enum type
 * @return Array of number ids of the enum entries
 */
export function enumIds<T extends EnumType>(enumType: T): Array<number> {
    return Object.keys(enumType).filter(key => !isNaN(Number(key))).map((entry: string) => Number(entry));
}

/**
 * Makes a shallow copy of a Map.
 * Note: The Map is copied but the values (Filter objects) are shared references.
 * This is intentional as Filter objects are treated as immutable.
 */
export function copyMap(original: Map<FilterName, Filter>): Map<FilterName, Filter> {
    return new Map(original);
}

/**
 * Privates an array of numbers from start to end (inclusive).
 */
export function range(start: number, end: number): Array<number> {
    return Array.from({length: (end - start + 1)}, (_, i) => i + start);
}