/*!
  Copyright 2018 Ron Buckton (rbuckton@chronicles.org)

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
 */
/**
 * @module "iterable-query/fn"
 * @preferred
 */

// queries
export * from "./choose";
export * from "./chooseAsync";
export * from "./consume";
export * from "./consumeAsync";
export * from "./continuous";
export * from "./continuousAsync";
export * from "./empty";
export * from "./emptyAsync";
export * from "./generate";
export * from "./generateAsync";
export * from "./hierarchy";
export * from "./hierarchyAsync";
export * from "./if";
export * from "./ifAsync";
export * from "./conditional";
export * from "./conditionalAsync";
export * from "./objectKeys";
export * from "./objectKeysAsync";
export * from "./objectValues";
export * from "./objectValuesAsync";
export * from "./objectEntries";
export * from "./objectEntriesAsync";
export * from "./once";
export * from "./onceAsync";
export * from "./repeat";
export * from "./repeatAsync";
export * from "./range";
// subqueries
export * from "./append";
export * from "./appendAsync";
export * from "./concat";
export * from "./concatAsync";
export * from "./defaultIfEmpty";
export * from "./defaultIfEmptyAsync";
export * from "./distinct";
export * from "./distinctAsync";
export * from "./do";
export * from "./doAsync";
export * from "./tap";
export * from "./tapAsync";
export * from "./except";
export * from "./exceptAsync";
export * from "./relativeComplement";
export * from "./relativeComplementAsync";
export * from "./exceptBy";
export * from "./exceptByAsync";
export * from "./relativeComplementBy";
export * from "./relativeComplementByAsync";
export * from "./exclude";
export * from "./excludeAsync";
export * from "./expand";
export * from "./expandAsync";
export * from "./eval";
export * from "./evalAsync";
export * from "./filter";
export * from "./filterAsync";
export * from "./filterBy";
export * from "./filterByAsync";
export * from "./filterDefined";
export * from "./filterDefinedAsync";
export * from "./where";
export * from "./whereAsync";
export * from "./whereBy";
export * from "./whereByAsync";
export * from "./whereDefined";
export * from "./whereDefinedAsync";
export * from "./intersect";
export * from "./intersectAsync";
export * from "./intersectBy";
export * from "./intersectByAsync";
export * from "./map";
export * from "./mapAsync";
export * from "./select";
export * from "./selectAsync";
export * from "./flatMap";
export * from "./flatMapAsync";
export * from "./selectMany";
export * from "./selectManyAsync";
export * from "./pageBy";
export * from "./pageByAsync";
export * from "./patch";
export * from "./patchAsync";
export * from "./prepend";
export * from "./prependAsync";
export * from "./reverse";
export * from "./reverseAsync";
export * from "./skip";
export * from "./skipAsync";
export * from "./skipRight";
export * from "./skipRightAsync";
export * from "./skipUntil";
export * from "./skipUntilAsync";
export * from "./skipWhile";
export * from "./skipWhileAsync";
export * from "./spanMap";
export * from "./spanMapAsync";
export * from "./groupBy";
export * from "./groupByAsync";
export * from "./groupJoin";
export * from "./groupJoinAsync";
export * from "./join";
export * from "./joinAsync";
export * from "./fullJoin";
export * from "./fullJoinAsync";
export * from "./scan";
export * from "./scanAsync";
export * from "./scanRight";
export * from "./scanRightAsync";
export * from "./symmetricDifference";
export * from "./symmetricDifferenceAsync";
export * from "./symmetricDifferenceBy";
export * from "./symmetricDifferenceByAsync";
export * from "./xor";
export * from "./xorAsync";
export * from "./xorBy";
export * from "./xorByAsync";
export * from "./take";
export * from "./takeAsync";
export * from "./takeRight";
export * from "./takeRightAsync";
export * from "./takeWhile";
export * from "./takeWhileAsync";
export * from "./takeUntil";
export * from "./takeUntilAsync";
export * from "./union";
export * from "./unionAsync";
export * from "./unionBy";
export * from "./unionByAsync";
export * from "./zip";
export * from "./zipAsync";
export * from "./through";
export * from "./throughAsync";
export * from "./toHierarchy";
export * from "./toHierarchyAsync";
export * from "./toLookup";
export * from "./toLookupAsync";
export * from "./orderBy";
export * from "./orderByAsync";
// hierarchy
export * from "./traversal";
export * from "./traversalAsync";
export * from "./nthChild";
export * from "./nthChildAsync";
export * from "./topMost";
export * from "./topMostAsync";
export * from "./bottomMost";
export * from "./bottomMostAsync";
// scalars
export * from "./average";
export * from "./averageAsync";
export * from "./break";
export * from "./breakAsync";
export * from "./corresponds";
export * from "./correspondsAsync";
export * from "./correspondsBy";
export * from "./correspondsByAsync";
export * from "./count";
export * from "./countAsync";
export * from "./drain";
export * from "./drainAsync";
export * from "./elementAt";
export * from "./elementAtAsync";
export * from "./nth";
export * from "./nthAsync";
export * from "./endsWith";
export * from "./endsWithAsync";
export * from "./every";
export * from "./everyAsync";
export * from "./first";
export * from "./firstAsync";
export * from "./forEach";
export * from "./forEachAsync";
export * from "./includes";
export * from "./includesAsync";
export * from "./includesSequence";
export * from "./includesSequenceAsync";
export * from "./last";
export * from "./lastAsync";
export * from "./max";
export * from "./maxAsync";
export * from "./maxBy";
export * from "./maxByAsync";
export * from "./min";
export * from "./minAsync";
export * from "./minBy";
export * from "./minByAsync";
export * from "./reduce";
export * from "./reduceAsync";
export * from "./reduceRight";
export * from "./reduceRightAsync";
export * from "./single";
export * from "./singleAsync";
export * from "./some";
export * from "./someAsync";
export * from "./span";
export * from "./spanAsync";
export * from "./startsWith";
export * from "./startsWithAsync";
export * from "./sum";
export * from "./sumAsync";
export * from "./toArray";
export * from "./toArrayAsync";
export * from "./toMap";
export * from "./toMapAsync";
export * from "./toObject";
export * from "./toObjectAsync";
export * from "./toSet";
export * from "./toSetAsync";
export * from "./unzip";
export * from "./unzipAsync";
export * from "./copyTo";
export * from "./copyToAsync";
// utils
export * from "./common";