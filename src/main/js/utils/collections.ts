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