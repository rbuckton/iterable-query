import { noConflict as noConflictCollections } from "./collections";
import { noConflict as noConflictSymbol } from "./symbol";
export * from "./query";
export function noConflict() {
    noConflictCollections();
    noConflictSymbol();
}