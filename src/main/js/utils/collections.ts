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