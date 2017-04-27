export * from "./query";
export { Map, Set, WeakMap } from "./collections";
import { noConflict as noConflictCollections } from "./collections";
import { noConflict as noConflictSymbol } from "./symbol";

export function noConflict() {
    noConflictCollections();
    noConflictSymbol();
}