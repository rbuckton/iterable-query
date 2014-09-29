/*!
   Copyright 2014 Ron Buckton (rbuckton@outlook.com)

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
(function (definition) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        module["exports"] = definition(module["exports"] || exports);
    }
    else if (typeof define === "function" && define["amd"]) {
        define(['exports'], definition);
    }
    else {
        self.Query = definition();
    }
})
(function (exports) {

    // private
    const defaultSelector = (value) => value;
    const defaultPredicate = () => true;
    const defaultResultSelector = (key, values) => values;
    const defaultEqualityComparison = (x, y) => x === y;
    const defaultComparison = (x, y) => (x < y) ? -1 : (x > y) ? +1 : 0;

    // symbols for private state
    const symQuerySource = Symbol();
    const symOrderedSource = Symbol();
    const symOrderedKeySelector = Symbol();
    const symOrderedComparison = Symbol();
    const symOrderedDescending = Symbol();
    const symOrderedParent = Symbol();
    const symLookupMap = Symbol();
    const symLookupGetGrouping = Symbol();
    const symLookupCreate = Symbol();
    const symLookupCreateForJoin = Symbol();
    const symGroupingData = Symbol();
    const symGroupingAdd = Symbol();
    const symGroupingKey = Symbol();
    const symGroupingItems = Symbol();
    const symSingletonIterableValue = Symbol();
    const symRepeatIterableValue = Symbol();
    const symRepeatIterableCount = Symbol();
    const symRangeIterableStart = Symbol();
    const symRangeIterableEnd = Symbol();
    const symOrderedIterableSource = Symbol();
    const symLookupIterableSource = Symbol();
    const symGroupingIterableSource = Symbol();
    const symFilterIterableSource = Symbol();
    const symFilterIterablePredicate = Symbol();
    const symMapIterableSource = Symbol();
    const symMapIterableProjection = Symbol();
    const symFlatMapIterableSource = Symbol();
    const symFlatMapIterableProjection = Symbol();
    const symSkipIterableSource = Symbol();
    const symSkipIterableCount = Symbol();
    const symSkipWhileIterableSource = Symbol();
    const symSkipWhileIterablePredicate = Symbol();
    const symTakeIterableSource = Symbol();
    const symTakeIterableCount = Symbol();
    const symTakeWhileIterableSource = Symbol();
    const symTakeWhileIterablePredicate = Symbol();
    const symIntersectIterableLeft = Symbol();
    const symIntersectIterableRight = Symbol();
    const symUnionIterableLeft = Symbol();
    const symUnionIterableRight = Symbol();
    const symExceptIterableLeft = Symbol();
    const symExceptIterableRight = Symbol();
    const symDistinctIterableSource = Symbol();
    const symConcatIterableLeft = Symbol();
    const symConcatIterableRight = Symbol();
    const symZipIterableLeft = Symbol();
    const symZipIterableRight = Symbol();
    const symZipIterableSelector = Symbol();
    const symGroupByIterableSource = Symbol();
    const symGroupByIterableKeySelector = Symbol();
    const symGroupByIterableElementSelector = Symbol();
    const symGroupByIterableResultSelector = Symbol();
    const symGroupJoinIterableOuter = Symbol();
    const symGroupJoinIterableInner = Symbol();
    const symGroupJoinIterableOuterKeySelector = Symbol();
    const symGroupJoinIterableInnerSelector = Symbol();
    const symGroupJoinIterableResultSelector = Symbol();
    const symJoinIterableOuter = Symbol();
    const symJoinIterableInner = Symbol();
    const symJoinIterableOuterKeySelector = Symbol();
    const symJoinIterableInnerSelector = Symbol();
    const symJoinIterableResultSelector = Symbol();
    const symLookupResultSelectorIterableMap = Symbol();
    const symLookupResultSelectorIterableSelector = Symbol();

    // private static
    function isFunction(value) {
        return typeof value === "function";
    }

    function isGenerator(value) {
        return isFunction(value) && /^\s*function\s*\*/.test(Function.prototype.toString.call(value));
    }

    function isIterable(value) {
        return value != null && Symbol.iterator in value;
    }

    function isMissing(value) {
        return value == null;
    }

    function checkSymbol(obj, sym) {
        if (obj == null || !(sym in obj)) throw new TypeError("Invalid calling object.");
        return obj[sym];
    }

    function checkIterable(value) {        
        if (!isIterable(value)) {
            if (isGenerator(value) && value.length === 0) {
                var iterable = {};
                iterable[Symbols.iterator] = value;
                return iterable;
            }

            throw new TypeError("Object does not support iteration.");
        }

        if (symQuerySource in value) {
            return checkIterable(value[symQuerySource]);
        }

        return value;
    }

    function checkFunction(value, defaultValue) {
        if (isMissing(value)) value = defaultValue;
        if (!isFunction(value)) throw new TypeError("Function expected.");
        return value;
    }

    function checkInteger(value) {
        if (isNaN(value |= 0)) throw new TypeError("Number expected.");
        return value;
    }

    function makeStatic(func) {
        return function (iterable) {
            var args = Array.prototype.slice.call(arguments, 1);
            return func.apply(Query.from(iterable), args);
        }
    }
    
    var Query = (function() {
        function Query(source) {
            if (!(this instanceof Query)) {
                if (source instanceof Query && symQuerySource in source) {
                    return source;
                }

                return new Query(source);
            }

            source = checkIterable(source);

            this[symQuerySource] = source;
        }

        // public static
        Query.from = from;
        function from(iterable) {
            if (iterable instanceof Query && symQuerySource in iterable) {
                return iterable;
            }

            return new Query(iterable);
        }

        Query.empty = empty;
        function empty() {
            return new Query(new EmptyIterable());
        }

        Query.once = once;
        function once(value) {
            return new Query(new SingletonIterable(value));
        }

        Query.repeat = repeat;
        function repeat(value, count) {
            count = checkInteger(count);

            return new Query(new RepeatIterable(value, count));
        }

        Query.range = range;
        function range(start, end) {
            start = checkInteger(start);
            end = checkInteger(end);

            return new Query(new RangeIterable(start, end));
        }

        // public 
        Query.filter = makeStatic(filter);
        Query.prototype.filter = filter;
        function filter(predicate) {
            const source = checkSymbol(this, symQuerySource);
            predicate = checkFunction(predicate);

            return new Query(new FilterIterable(source, predicate));
        }

        Query.map = makeStatic(map);
        Query.prototype.map = map;
        function map(projection) {
            const source = checkSymbol(this, symQuerySource);
            projection = checkFunction(projection);

            return new Query(new MapIterable(source, projection));
        }

        Query.flatMap = makeStatic(flatMap);
        Query.prototype.flatMap = flatMap;
        function flatMap(projection) {
            const source = checkSymbol(this, symQuerySource);
            projection = checkFunction(projection);

            return new Query(new FlatMapIterable(source, projection));
        }

        Query.skip = makeStatic(skip);
        Query.prototype.skip = skip;
        function skip(count) {
            const source = checkSymbol(this, symQuerySource);
            count = checkInteger(count);

            return new Query(new SkipIterable(source, count));
        }

        Query.skipWhile = makeStatic(skipWhile);
        Query.prototype.skipWhile = skipWhile;
        function skipWhile(condition) {
            const source = checkSymbol(this, symQuerySource);
            condition = checkFunction(condition);

            return new Query(new SkipWhileIterable(source, condition));
        }

        Query.take = makeStatic(take);
        Query.prototype.take = take;
        function take(count) {
            const source = checkSymbol(this, symQuerySource);
            count = checkInteger(count);

            return new Query(new TakeIterable(source, count));
        }

        Query.takeWhile = makeStatic(takeWhile);
        Query.prototype.takeWhile = takeWhile;
        function takeWhile(condition) {        
            const source = checkSymbol(this, symQuerySource);
            condition = checkFunction(condition);

            return new Query(new TakeWhileIterable(source, condition));
        }

        Query.intersect = makeStatic(intersect);
        Query.prototype.intersect = intersect;
        function intersect(other) {        
            const source = checkSymbol(this, symQuerySource);
            other = checkIterable(other);

            return new Query(new IntersectIterable(source, other));
        }

        Query.union = makeStatic(union);
        Query.prototype.union = union;
        function union(other) {        
            const source = checkSymbol(this, symQuerySource);
            other = checkIterable(other);

            return new Query(new UnionIterable(source, other));
        }

        Query.except = makeStatic(except);
        Query.prototype.except = except;
        function except(other) {        
            const source = checkSymbol(this, symQuerySource);
            other = checkIterable(other);

            return new Query(new ExceptIterable(source, other));
        }

        Query.distinct = makeStatic(distinct);
        Query.prototype.distinct = distinct;
        function distinct() {        
            const source = checkSymbol(this, symQuerySource);

            return new Query(new DistinctIterable(source));
        }

        Query.concat = makeStatic(concat);
        Query.prototype.concat = concat;
        function concat(other) {
            const source = checkSymbol(this, symQuerySource);
            other = checkIterable(other);

            return new Query(new ConcatIterable(source, other));
        }

        Query.zip = makeStatic(zip);
        Query.prototype.zip = zip;
        function zip(other, selector) {
            const source = checkSymbol(this, symQuerySource);
            other = checkIterable(other);
            selector = checkFunction(selector);

            return new Query(new ZipIterable(source, other, selector));
        }

        Query.orderBy = makeStatic(orderBy);
        Query.prototype.orderBy = orderBy;
        function orderBy(keySelector, comparison) {
            checkSymbol(this, symQuerySource);
            keySelector = checkFunction(keySelector);
            comparison = checkFunction(comparison, defaultComparison);

            return new Ordered(this, keySelector, comparison, /*descending*/ false);
        }

        Query.orderByDescending = makeStatic(orderByDescending);
        Query.prototype.orderByDescending = orderByDescending;
        function orderByDescending(keySelector, comparison) {
            checkSymbol(this, symQuerySource);
            keySelector = checkFunction(keySelector);
            comparison = checkFunction(comparison, defaultComparison);

            return new Ordered(this, keySelector, comparison, /*descending*/ true);
        }

        Query.groupBy = makeStatic(groupBy);
        Query.prototype.groupBy = groupBy;
        function groupBy(keySelector, elementSelector, resultSelector) {
            const source = checkSymbol(this, symQuerySource);        
            keySelector = checkFunction(keySelector);
            elementSelector = checkFunction(elementSelector, defaultSelector);
            resultSelector = checkFunction(resultSelector, defaultResultSelector);
            
            return new Query(new GroupByIterable(source, keySelector, elementSelector, resultSelector));
        }

        Query.groupJoin = makeStatic(groupJoin);
        Query.prototype.groupJoin = groupJoin;
        function groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector) {
            const source = checkSymbol(this, symQuerySource);
            inner = checkIterable(inner);
            outerKeySelector = checkFunction(outerKeySelector);
            innerKeySelector = checkFunction(innerKeySelector);
            resultSelector = checkFunction(resultSelector);

            return new Query(new GroupJoinIterable(source, inner, outerKeySelector, innerKeySelector, resultSelector));
        }

        Query.join = makeStatic(join);
        Query.prototype.join = join;
        function join(inner, outerKeySelector, innerKeySelector, resultSelector) {        
            const source = checkSymbol(this, symQuerySource);
            inner = checkIterable(inner);
            outerKeySelector = checkFunction(outerKeySelector);
            innerKeySelector = checkFunction(innerKeySelector);
            resultSelector = checkFunction(resultSelector);

            return new Query(new JoinIterable(source, inner, outerKeySelector, innerKeySelector, resultSelector));
        }

        Query.reverse = makeStatic(reverse);
        Query.prototype.reverse = reverse;
        function reverse() {
            const source = Query.prototype.toArray.call(this);
            source.reverse();

            return new Query(source);
        }

        Query.min = makeStatic(min);
        Query.prototype.min = min;
        function min(selector) {
            const source = checkSymbol(this, symQuerySource);
            selector = checkFunction(this, defaultSelector);

            var min;
            var hasRead = false;
            for (var item of source) {
                var value;
                if (selector === defaultSelector) {
                    value = item;
                }
                else {
                    value = selector(item);
                }

                if (!hasRead) {
                    min = value;
                    hasRead = true;
                }
                else {
                    min = value < min ? value : min;
                }
            }

            return min;
        }

        Query.max = makeStatic(max);
        Query.prototype.max = max;
        function max(selector) {
            const source = checkSymbol(this, symQuerySource);
            selector = checkFunction(this, defaultSelector);

            var max;
            var hasRead = false;
            for (var item of source) {
                var value;
                if (selector === defaultSelector) {
                    value = item;
                }
                else {
                    value = selector(item);
                }

                if (!hasRead) {
                    max = value;
                    hasRead = true;
                }
                else {
                    max = value > max ? value : max;
                }
            }

            return max;
        }

        Query.sum = makeStatic(sum);
        Query.prototype.sum = sum;
        function sum(selector) {
            const source = checkSymbol(this, symQuerySource);
            selector = checkFunction(this, defaultSelector);

            var result = 0;
            for (var item of source) {
                var value;
                if (selector === defaultSelector) {
                    value = item;
                }
                else {
                    value = selector(item);
                }

                if (!isMissing(value)) {
                    result += +value;
                }
            }

            return result;
        }

        Query.average = makeStatic(average);
        Query.prototype.average = average;
        function average(selector) {
            const source = checkSymbol(this, symQuerySource);
            selector = checkFunction(this, defaultSelector);

            var sum = 0;
            var count = 0;
            for (var item of source) {
                
                var value;
                if (selector === defaultSelector) {
                    value = item;
                }
                else {
                    value = selector(item);
                }

                if (!isMissing(value)) {
                    sum += +value;
                    count++;
                }
            }

            if (count > 0) {
                return sum / count;
            }
        }

        Query.has = makeStatic(has);
        Query.prototype.has = has;
        function has(value, equalityComparison) {
            const source = checkSymbol(this, symQuerySource);
            equalityComparison = checkFunction(equalityComparison, defaultEqualityComparison);

            for (var item of source) {
                if (equalityComparison === defaultEqualityComparison) {
                    if (item === value) {
                        return true;
                    }
                }
                else {
                    if (equalityComparison(value, item)) {
                        return true;
                    }
                }
            }

            return false;
        }

        Query.sequenceEquals = makeStatic(sequenceEquals);
        Query.prototype.sequenceEquals = sequenceEquals;
        function sequenceEquals(other) {
            const source = checkSymbol(this, symQuerySource);
            other = checkIterable(other);

            var leftIterator = source[Symbol.iterator]();
            var rightIterator = other[Symbol.iterator]();
            while (true) {
                var leftResult = leftIterator.next();
                var rightResult = rightIterator.next();

                if (leftResult.done || rightResult.done) {
                    return leftResult.done === rightResult.done;
                }

                if (leftResult.value !== rightResult.value) {
                    return false;
                }
            }
        }

        Query.reduce = makeStatic(reduce);
        Query.prototype.reduce = reduce;
        function reduce(accumulator, seed) {
            const source = checkSymbol(this, symQuerySource);
            accumulator = checkFunction(accumulator);
            
            var hasInitialValue = arguments.length >= 2;
            var aggregate = seed;
            for (var item of source) {
                if (!hasInitialValue) {
                    aggregate = item;
                    hasInitialValue = true;
                }
                else {
                    aggregate = accumulator(aggregate, item);
                }
            }

            return aggregate;
        }

        Query.reduceRight = makeStatic(reduceRight);
        Query.prototype.reduceRight = reduceRight;
        function reduceRight(accumulator, seed) {
            const source = Query.prototype.reverse.call(this);
            
            accumulator = checkFunction(accumulator);            
            var hasInitialValue = arguments.length >= 2;
            var aggregate = seed;
            for (var item of source) {
                if (!hasInitialValue) {
                    aggregate = item;
                    hasInitialValue = true;
                }
                else {
                    aggregate = accumulator(aggregate, item);
                }
            }

            return aggregate;
        }

        Query.forEach = makeStatic(forEach);
        Query.prototype.forEach = forEach;
        function forEach(callback) {
            const source = checkSymbol(this, symQuerySource);
            callback = checkFunction(callback);

            var index = 0;
            for (var item of source) {
                callback(item, index++);
            }
        }

        Query.first = makeStatic(first);
        Query.prototype.first = first;
        function first(filter) {
            const source = checkSymbol(this, symQuerySource);
            filter = checkFunction(filter, defaultPredicate);
            
            if (filter === defaultPredicate && Array.isArray(source)) {
                return source[0];
            }

            for (var item of source) {
                if (filter(item)) {
                    return item;
                }
            }
        }

        Query.last = makeStatic(last);
        Query.prototype.last = last;
        function last(filter) {
            const source = checkSymbol(this, symQuerySource);
            filter = checkFunction(filter, defaultPredicate);
            
            if (filter === defaultPredicate && Array.isArray(source)) {
                return source[source.length - 1];
            }

            var last;
            for (var item of source) {
                if (filter(item)) {
                    last = item;
                }
            }

            return last;
        }

        Query.item = makeStatic(item);
        Query.prototype.item = item;
        function item(index) {
            const source = checkSymbol(this, symQuerySource);
            index = checkInteger(index);

            if (Array.isArray(source)) {
                return source[index];
            }

            var offset = 0;
            for (var item of source) {
                if (offset === index) {
                    return item;
                }

                offset++;
            }
        }

        Query.single = makeStatic(single);
        Query.prototype.single = single;
        function single() {
            const source = checkSymbol(this, symQuerySource);

            var value;
            var hasRead = false;
            for (var item of source) {
                if (hasRead) {
                    return;
                }

                value = item;
                hasRead = true;
            }

            if (hasRead) {
                return value;
            }
        }

        Query.count = makeStatic(count);
        Query.prototype.count = count;
        function count(filter) {
            const source = checkSymbol(this, symQuerySource);
            filter = checkFunction(filter, defaultPredicate);
            
            if (filter === defaultPredicate) {
                if (Array.isArray(source)) {
                    return source.length;
                }
                else if (source instanceof Map || source instanceof Set) {
                    return source.size;
                }
            }

            var count = 0;
            for (var item of source) {
                if (filter(item)) {
                    count++;
                }
            }

            return count;
        }

        Query.some = makeStatic(some);
        Query.prototype.some = some;
        function some(filter) {
            const source = checkSymbol(this, symQuerySource);
            filter = checkFunction(filter, defaultPredicate);

            if (filter === defaultPredicate) {
                if (Array.isArray(source)) {
                    return source.length > 0;
                }
                else if (source instanceof Map || source instanceof Set) {
                    return source.size > 0;
                }
            }

            for (var item of source) {
                if (filter(item)) {
                    return true;
                }
            }

            return false;
        }

        Query.every = makeStatic(every);
        Query.prototype.every = every;
        function every(filter) {
            const source = checkSymbol(this, symQuerySource);
            filter = checkFunction(filter);

            for (var item of source) {
                if (!filter(item)) {
                    return false;
                }
            }

            return true;
        }

        Query.toArray = makeStatic(toArray);
        Query.prototype.toArray = toArray;
        function toArray(selector) {
            const source = checkSymbol(this, symQuerySource);
            selector = checkFunction(selector, defaultSelector);
            
            if (Array.isArray(source)) {
                if (selector === defaultSelector) {
                    return source.slice(0);
                }
                else {
                    return source.map(selector);
                }
            }

            var result;
            if (source instanceof Map || source instanceof Set) {
                result = new Array(source.size);
            }
            
            var offset = 0;
            for (var item of source) {
                if (!result) {
                    result = new Array(4);
                }
                else if (result.length === offset) {
                    result.length *= 2;
                }

                result[offset++] = selector(item);
            }

            result.length = offset;
            return result;
        }

        Query.toLookup = makeStatic(toLookup);
        Query.prototype.toLookup = toLookup;
        function toLookup(keySelector, elementSelector) {
            const source = checkSymbol(this, symQuerySource);
            keySelector = checkFunction(keySelector);
            elementSelector = checkFunction(elementSelector, defaultSelector);

            return Lookup[symLookupCreate](source, keySelector, elementSelector);
        }

        Query.toSet = makeStatic(toSet);
        Query.prototype.toSet = toSet;
        function toSet(selector) {
            const source = checkSymbol(this, symQuerySource);
            selector = checkFunction(selector, defaultSelector);
            
            if (selector === defaultSelector) {
                return new Set(source);
            }

            var result = new Set();
            for (var item of source) {
                result.add(selector(item));
            }

            return result;
        }

        Query.toMap = makeStatic(toMap);
        Query.prototype.toMap = toMap;
        function toMap(keySelector, valueSelector) {
            const source = checkSymbol(this, symQuerySource);
            keySelector = checkFunction(keySelector);
            valueSelector = checkFunction(valueSelector, defaultSelector);

            var result = new Map();
            for (var item of source) {
                var key = keySelector(item);
                var value = valueSelector(item);
                result.set(key, value);
            }

            return result;
        }

        Query.prototype.valueOf = valueOf;
        function valueOf() {
            const array = Query.prototype.toArray.call(this);
            return array;
        }

        Query.prototype.toJSON = toJSON;
        function toJSON() {
            const array = Query.prototype.toArray.call(this);
            return array;
        }

        Query.prototype.toString = toString;
        function toString() {
            const array = Query.prototype.toArray.call(this);
            return array.toString.call(array, arguments);
        }

        Query.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symQuerySource);

            yield* source;
        }

        return Query;
    })();

    var Ordered = (function() {
        Ordered.__proto__ = Query;
        Ordered.prototype.__proto__ = Query.prototype;
        Ordered.prototype.constructor = Query;

        function Ordered(source, keySelector, comparison, descending, parent) {
            Query.call(this, new OrderedIterable(this));

            this[symOrderedSource] = source;
            this[symOrderedKeySelector] = keySelector;
            this[symOrderedComparison] = comparison;
            this[symOrderedDescending] = descending;
            this[symOrderedParent] = parent;
        }

        Ordered.prototype.thenBy = thenBy;
        function thenBy(keySelector, comparison) {
            const source = checkSymbol(this, symOrderedSource);
            keySelector = checkFunction(keySelector);
            comparison = checkFunction(comparison, defaultComparison);

            return new Ordered(source, keySelector, comparison, /*descending*/ false, this);
        }

        Ordered.prototype.thenByDescending = thenByDescending;
        function thenByDescending(keySelector, comparison) {
            const source = checkSymbol(this, symOrderedSource);
            keySelector = checkFunction(keySelector);
            comparison = checkFunction(comparison, defaultComparison);

            return new Ordered(source, keySelector, comparison, /*descending*/ true, this);
        }

        return Ordered;
    })();

    var Lookup = (function() {
        Lookup.__proto__ = Query;
        Lookup.prototype.__proto__ = Query.prototype;
        Lookup.prototype.constructor = Query;

        function Lookup() {
            Query.call(this, new LookupIterable(this));

            this[symLookupMap] = new Map();
        } 

        Lookup[symLookupCreate] = create;
        function create(source, keySelector, elementSelector) {
            const lookup = new Lookup();
            for (var item of source) {
                lookup[symLookupGetGrouping](keySelector(item), true)[symGroupingAdd](elementSelector(item));
            }

            return lookup;
        }

        Lookup[symLookupCreateForJoin] = createForJoin;
        function createForJoin(source, keySelector) {
            const lookup = new Lookup();
            for (var item of source) {
                var key = keySelector(item);
                if (key != null) {
                    lookup[symLookupGetGrouping](key, true)[symGroupingAdd](item);
                }
            }

            return lookup;
        }

        Object.defineProperty(Lookup.prototype, "size", { enumerable: true, configurable: true, get: get_size });
        function get_size() {
            const map = checkSymbol(this, symLookupMap);

            return map.size;
        }

        Lookup.prototype[symLookupGetGrouping] = getGrouping;
        function getGrouping(key, create) {
            const map = checkSymbol(this, symLookupMap);

            var grouping = map.get(key);
            if (grouping == null && create) {
                grouping = new Grouping(key);
                map.set(key, grouping);
            }

            return grouping;
        }

        Lookup.prototype.has = has;
        function has(key) {
            const map = checkSymbol(this, symLookupMap);

            return map.has(key);
        }

        Lookup.prototype.get = get;
        function get(key) {
            const map = checkSymbol(this, symLookupMap);

            var grouping = map.get(key);
            if (grouping) {
                return Query.from(grouping);
            }

            return Query.empty();
        }

        Lookup.prototype.applyResultSelector = applyResultSelector;
        function applyResultSelector(selector) {
            const map = checkSymbol(this, symLookupMap);
            selector = checkFunction(selector);

            return new Query(new LookupResultSelectorIterable(map, selector));
        }

        return Lookup;
    })();

    var Grouping = (function() {
        Grouping.__proto__ = Query;
        Grouping.prototype.__proto__ = Query.prototype;
        Grouping.prototype.constructor = Query;

        function Grouping(key) {
            Query.call(this, new GroupingIterable(this));

            this[symGroupingKey] = key;
            this[symGroupingItems] = [];
        } 

        Object.defineProperty(Grouping.prototype, "key", { enumerable: true, configurable: true, get: get_key });
        function get_key() {
            const key = checkSymbol(this, symGroupingKey);
            return key;
        }

        Grouping.prototype[symGroupingAdd] = add;
        function add(value) {
            const items = checkSymbol(this, symGroupingItems);
            items.push(value);
        }

        return Grouping;
    })();

    var EmptyIterable = (function() {
        function EmptyIterable() {
        }

        EmptyIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
        }

        return EmptyIterable;
    })();

    var SingletonIterable = (function() {
        function SingletonIterable(value) {
            this[symSingletonIterableValue] = value;
        }

        SingletonIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const value = checkSymbol(this, symSingletonIterableValue);

            yield value;
        }

        return SingletonIterable;
    })();

    var RepeatIterable = (function() {
        function RepeatIterable(value, count) {
            this[symRepeatIterableValue] = value;
            this[symRepeatIterableCount] = count;
        }

        RepeatIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const value = checkSymbol(this, symRepeatIterableValue);
            const count = checkSymbol(this, symRepeatIterableCount);

            for (var i = 0; i < count; i++) {
                yield value;
            }
        }

        return RepeatIterable;
    })();

    var RangeIterable = (function() {
        function RangeIterable(start, end) {
            this[symRangeIterableStart] = start;
            this[symRangeIterableEnd] = end;
        }

        RangeIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const start = checkSymbol(this, symRangeIterableStart);
            const end = checkSymbol(this, symRangeIterableEnd);

            if (start <= end) {
                for (var index = start; index <= end; index++) {
                    yield index;
                }
            }
            else {
                for (var index = start; index >= end; index--) {
                    yield index;
                }
            }
        }

        return RangeIterable;
    })();

    var FilterIterable = (function() {
        function FilterIterable(source, predicate) {
            this[symFilterIterableSource] = source;
            this[symFilterIterablePredicate] = predicate;
        }

        FilterIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symFilterIterableSource);
            const predicate = checkSymbol(this, symFilterIterablePredicate);
            
            var index = 0;
            for (var item of source) {
                if (predicate(item, index++)) {
                    yield item;
                }
            } 
        }

        return FilterIterable;
    })();

    var MapIterable = (function() {
        function MapIterable(source, projection) {
            this[symMapIterableSource] = source;
            this[symMapIterableProjection] = projection;
        }

        MapIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symMapIterableSource);
            const projection = checkSymbol(this, symMapIterableProjection);
            
            var index = 0;
            for (var item of source) {
                yield projection(item, index++);
            } 
        }

        return MapIterable;
    })();

    var FlatMapIterable = (function() {
        function FlatMapIterable(source, projection) {
            this[symFlatMapIterableSource] = source;
            this[symFlatMapIterableProjection] = projection;
        }

        FlatMapIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symFlatMapIterableSource);
            const projection = checkSymbol(this, symFlatMapIterableProjection);
            
            var index = 0;
            for (var item of source) {
                yield* projection(item, index++);
            } 
        }

        return FlatMapIterable;
    })();

    var SkipIterable = (function() {
        function SkipIterable(source, count) {
            this[symSkipIterableSource] = source;
            this[symSkipIterableCount] = count;
        }

        SkipIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symSkipIterableSource);
            var count = checkSymbol(this, symSkipIterableCount);
            
            for (var item of source) {
                if (count > 0) {
                    count--;
                    continue;
                }

                yield item;
            }
        }

        return SkipIterable;
    })();

    var SkipWhileIterable = (function() {
        function SkipWhileIterable(source, predicate) {
            this[symSkipWhileIterableSource] = source;
            this[symSkipWhileIterablePredicate] = predicate;
        }

        SkipWhileIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symSkipWhileIterableSource);
            const predicate = checkSymbol(this, symSkipWhileIterablePredicate);
            
            var skipping = true;
            var index = 0;
            for (var item of source) {
                if (skipping && (skipping = predicate(item, index++))) {
                    continue;
                }

                yield item;
            }
        }

        return SkipWhileIterable;
    })();

    var TakeIterable = (function() {
        function TakeIterable(source, count) {
            this[symTakeIterableSource] = source;
            this[symTakeIterableCount] = count;
        }

        TakeIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symTakeIterableSource);
            var count = checkSymbol(this, symTakeIterableCount);
            
            for (var item of source) {
                if (count > 0) {
                    count--;
                    yield item;
                }
                else {
                    break;
                }
            } 
        }

        return TakeIterable;
    })();

    var TakeWhileIterable = (function() {
        function TakeWhileIterable(source, predicate) {
            this[symTakeWhileIterableSource] = source;
            this[symTakeWhileIterablePredicate] = predicate;
        }

        TakeWhileIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symTakeWhileIterableSource);
            const predicate = checkSymbol(this, symTakeWhileIterablePredicate);
        
            var taking = true;
            var index = 0;
            for (var item of source) {
                if (taking && (taking = predicate(item, index++))) {
                    yield item;
                }
                else {
                    break;
                }
            }
        }

        return TakeWhileIterable;
    })();

    var IntersectIterable = (function() {
        function IntersectIterable(left, right) {
            this[symIntersectIterableLeft] = left;
            this[symIntersectIterableRight] = right;
        }

        IntersectIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const left = checkSymbol(this, symIntersectIterableLeft);
            const right = checkSymbol(this, symIntersectIterableRight);

            const set = new Set(right);
            if (set.size <= 0) {
                return;
            } 
           
            for (var item of left) {
                if (set.delete(item)) {
                    yield item;
                }
            }
        }

        return IntersectIterable;
    })();

    var UnionIterable = (function() {
        function UnionIterable(left, right) {
            this[symUnionIterableLeft] = left;
            this[symUnionIterableRight] = right;
        }

        UnionIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const left = checkSymbol(this, symUnionIterableLeft);
            const right = checkSymbol(this, symUnionIterableRight);
            
            const set = new Set();
            for (var item of left) {
                var size = set.size;
                set.add(item);
                if (set.size > size) {
                    yield item;
                }
            } 

            for (var item of right) {
                var size = set.size;
                set.add(item);
                if (set.size > size) {
                    yield item;
                }
            }
        }

        return UnionIterable;
    })();

    var ExceptIterable = (function() {
        function ExceptIterable(left, right) {
            this[symExceptIterableLeft] = left;
            this[symExceptIterableRight] = right;
        }

        ExceptIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const left = checkSymbol(this, symExceptIterableLeft);
            const right = checkSymbol(this, symExceptIterableRight);

            const set = new Set(right);           
            for (var item of left) {
                var size = set.size;
                set.add(item);
                if (set.size > size) {
                    yield item;
                }
            }
        }

        return ExceptIterable;
    })();

    var DistinctIterable = (function() {
        function DistinctIterable(left, right) {
            this[symDistinctIterableSource] = left;
        }

        DistinctIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symDistinctIterableSource);
            
            const set = new Set();
            for (var item of source) {
                var size = set.size;
                set.add(item);
                if (set.size > size) {
                    yield item;
                }
            }
        }

        return DistinctIterable;
    })();

    var ConcatIterable = (function() {
        function ConcatIterable(left, right) {
            this[symConcatIterableLeft] = left;
            this[symConcatIterableRight] = right;
        }

        ConcatIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const left = checkSymbol(this, symConcatIterableLeft);
            const right = checkSymbol(this, symConcatIterableRight);

            yield* left;
            yield* right;
        }

        return ConcatIterable;
    })();

    var ZipIterable = (function() {
        function ZipIterable(left, right, selector) {
            this[symZipIterableLeft] = left;
            this[symZipIterableRight] = right;
            this[symZipIterableSelector] = selector;
        }

        ZipIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const left = checkSymbol(this, symZipIterableLeft);
            const right = checkSymbol(this, symZipIterableRight);
            const selector = checkSymbol(this, symZipIterableSelector);
            const leftIterator = left[Symbol.iterator]();
            const rightIterator = right[Symbol.iterator]();
            while (true) {
                var leftResult = leftIterator.next();
                if (leftResult.done) {
                    break;
                }

                var rightResult = rightIterator.next();
                if (rightResult.done) {
                    break;
                }

                yield selector(leftResult.value, rightResult.value);
            }
        }

        return ZipIterable;
    })();

    var GroupByIterable = (function() {
        function GroupByIterable(source, keySelector, elementSelector, resultSelector) {
            this[symGroupByIterableSource] = source;
            this[symGroupByIterableKeySelector] = keySelector;
            this[symGroupByIterableElementSelector] = elementSelector;
            this[symGroupByIterableResultSelector] = resultSelector;
        }

        GroupByIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const source = checkSymbol(this, symGroupByIterableSource);
            const keySelector = checkSymbol(this, symGroupByIterableKeySelector);
            const elementSelector = checkSymbol(this, symGroupByIterableElementSelector);
            const resultSelector = checkSymbol(this, symGroupByIterableResultSelector);

            const lookup = Lookup[symLookupCreate](source, keySelector, elementSelector);
            if (resultSelector === defaultResultSelector) {
                yield* lookup;
            }
            else {
                yield* lookup.applyResultSelector(resultSelector);
            }
        }

        return GroupByIterable;
    })();

    var GroupJoinIterable = (function() {
        function GroupJoinIterable(outer, inner, outerKeySelector, innerKeySelector, resultSelector) {
            this[symGroupJoinIterableOuter] = outer;
            this[symGroupJoinIterableInner] = inner;
            this[symGroupJoinIterableOuterKeySelector] = outerKeySelector;
            this[symGroupJoinIterableInnerSelector] = innerKeySelector;
            this[symGroupJoinIterableResultSelector] = resultSelector;
        }

        GroupJoinIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const outer = checkSymbol(this, symGroupJoinIterableOuter);
            const inner = checkSymbol(this, symGroupJoinIterableInner);
            const outerKeySelector = checkSymbol(this, symGroupJoinIterableOuterKeySelector);
            const innerKeySelector = checkSymbol(this, symGroupJoinIterableInnerSelector);
            const resultSelector = checkSymbol(this, symGroupJoinIterableResultSelector);

            const lookup = Lookup[symLookupCreateForJoin](inner, innerKeySelector);
            for (var item of outer) {
                yield resultSelector(item, lookup.get(outerKeySelector(item)));
            }
        }

        return GroupJoinIterable;
    })();

    var JoinIterable = (function() {
        function JoinIterable(outer, inner, outerKeySelector, innerKeySelector, resultSelector) {
            this[symJoinIterableOuter] = outer;
            this[symJoinIterableInner] = inner;
            this[symJoinIterableOuterKeySelector] = outerKeySelector;
            this[symJoinIterableInnerSelector] = innerKeySelector;
            this[symJoinIterableResultSelector] = resultSelector;
        }

        JoinIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const outer = checkSymbol(this, symJoinIterableOuter);
            const inner = checkSymbol(this, symJoinIterableInner);
            const outerKeySelector = checkSymbol(this, symJoinIterableOuterKeySelector);
            const innerKeySelector = checkSymbol(this, symJoinIterableInnerSelector);
            const resultSelector = checkSymbol(this, symJoinIterableResultSelector);

            const lookup = Lookup[symLookupCreateForJoin](inner, innerKeySelector);
            for (var item of outer) {
                var grouping = lookup[symLookupGetGrouping](outerKeySelector(item), false);
                if (grouping != null) {
                    for (var nested of grouping) {
                        yield resultSelector(item, nested);
                    }
                }
            }
        }

        return JoinIterable;
    })();

    var OrderedIterable = (function() {
        function OrderedIterable(lookup) {
            this[symOrderedIterableSource] = lookup;
        }

        function getSorter(ordered, next) {
            const comparison = ordered[symOrderedComparison];
            const keySelector = ordered[symOrderedKeySelector];
            const descending = ordered[symOrderedDescending];
            const parent = ordered[symOrderedParent];
            const sorter = (x, y) => {
                const result = comparison(keySelector(x), keySelector(y));
                if (result === 0 && next) {
                    return next(x, y);
                }

                if (descending) {
                    return -result;
                }

                return result;
            };

            if (parent) {
                return getSorter(parent, sorter);
            }

            return sorter;
        }

        OrderedIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const ordered = checkSymbol(this, symOrderedIterableSource);
            const source = checkSymbol(ordered, symOrderedSource);
            const array = source.toArray();
            const sorter = getSorter(ordered);
            array.sort(sorter);
            yield* array;
        }

        return OrderedIterable;
    })();

    var LookupIterable = (function() {
        function LookupIterable(lookup) {
            this[symLookupIterableSource] = lookup;
        }

        LookupIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const lookup = checkSymbol(this, symLookupIterableSource);
            const map = checkSymbol(lookup, symLookupMap);
            yield* map.values();
        }

        return LookupIterable;
    })();

    var LookupResultSelectorIterable = (function() {
        function LookupResultSelectorIterable(map, selector) {
            this[symLookupResultSelectorIterableMap] = map;
            this[symLookupResultSelectorIterableSelector] = selector;
        }

        LookupResultSelectorIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const map = checkSymbol(this, symLookupResultSelectorIterableMap);
            const selector = checkSymbol(this, symLookupResultSelectorIterableSelector);
            for (var grouping of map.values()) {
                yield selector(grouping.key, grouping);
            }
        }

        return LookupResultSelectorIterable;
    })();

    var GroupingIterable = (function() {
        function GroupingIterable(grouping) {
            this[symGroupingIterableSource] = grouping;
        }

        GroupingIterable.prototype[Symbol.iterator] = iterator;
        function* iterator() {
            const grouping = checkSymbol(this, symGroupingIterableSource);
            const items = checkSymbol(grouping, symGroupingItems);
            yield* items;
        }

        return GroupingIterable;
    })();
    
    if (exports) {
        for (var p in Query) {
            exports[p] = Query[p];
        }
    }
    
    return Query;    
});