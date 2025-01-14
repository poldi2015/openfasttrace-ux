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

export function sameArrayValues<T>(a: Array<T>, b: Array<T>): boolean {
    const setA: Set<T> = new Set(a);
    const setB: Set<T> = new Set(b);
    return a.length == b.length && [...setA].every(value => setB.has(value));
}