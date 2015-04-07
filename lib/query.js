"use strict";
var __decorate = this.__decorate || function (decorators, target, key, value) {
    var kind = typeof (arguments.length == 2 ? value = target : value);
    for (var i = decorators.length - 1; i >= 0; --i) {
        var decorator = decorators[i];
        switch (kind) {
            case "function": value = decorator(value) || value; break;
            case "number": decorator(target, key, value); break;
            case "undefined": decorator(target, key); break;
            case "object": value = decorator(target, key, value) || value; break;
        }
    }
    return value;
};
const symQuerySource = Symbol("Query.source");
const symGroupingKey = Symbol("GroupingQueryable.key");
const symLookupMap = Symbol("LookupQueryable.map");
const symHierarchyProvider = Symbol("Hierarchy.hierarchy");
class EmptyIterable {
    *[Symbol.iterator]() {
        return;
    }
}
const emptyIterable = new EmptyIterable();
class ArrayLikeIterable {
    constructor(source) {
        this.source = source;
    }
    *[Symbol.iterator]() {
        let source = this.source;
        for (let i = 0; i < source.length; ++i) {
            yield source[i];
        }
        return;
    }
}
class OnceIterable {
    constructor(value) {
        this.value = value;
    }
    *[Symbol.iterator]() {
        yield this.value;
        return;
    }
}
class RepeatIterable {
    constructor(value, count) {
        this.value = value;
        this.count = count;
    }
    *[Symbol.iterator]() {
        let { value, count } = this;
        for (let i = 0; i < count; i++) {
            yield value;
        }
        return;
    }
}
class RangeIterable {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    *[Symbol.iterator]() {
        let { start, end } = this;
        if (start <= end) {
            for (var i = start; i <= end; --i) {
                yield i;
            }
        }
        else {
            for (var i = start; i >= end; --i) {
                yield i;
            }
        }
        return;
    }
}
class FilterIterable {
    constructor(source, predicate) {
        this.source = source;
        this.predicate = predicate;
    }
    *[Symbol.iterator]() {
        let { source, predicate } = this;
        let offset = 0;
        for (let element of source) {
            if (predicate(element, offset++)) {
                yield element;
            }
        }
        return;
    }
}
class MapIterable {
    constructor(source, projection) {
        this.source = source;
        this.projection = projection;
    }
    *[Symbol.iterator]() {
        let { source, projection } = this;
        let offset = 0;
        for (let element of source) {
            yield projection(element, offset++);
        }
        return;
    }
}
class FlatMapIterable {
    constructor(source, projection) {
        this.source = source;
        this.projection = projection;
    }
    *[Symbol.iterator]() {
        let { source, projection } = this;
        for (let element of source) {
            yield* projection(element);
        }
        return;
    }
}
class ReverseIterable {
    constructor(source) {
        this.source = source;
    }
    *[Symbol.iterator]() {
        let list = Array.from(this.source);
        for (let i = list.length - 1; i >= 0; --i) {
            yield list[i];
        }
        return;
    }
}
class SkipIterable {
    constructor(source, count) {
        this.source = source;
        this.count = count;
    }
    *[Symbol.iterator]() {
        let { source, count } = this;
        let skipping = true;
        let offset = 0;
        for (let element of source) {
            if (skipping) {
                skipping = ++offset < count;
            }
            if (!skipping) {
                yield element;
            }
        }
        return;
    }
}
class SkipWhileIterable {
    constructor(source, predicate) {
        this.source = source;
        this.predicate = predicate;
    }
    *[Symbol.iterator]() {
        let { source, predicate } = this;
        let skipping = true;
        for (let element of source) {
            if (skipping) {
                skipping = predicate(element);
            }
            if (!skipping) {
                yield item;
            }
        }
        return;
    }
}
class TakeIterable {
    constructor(source, count) {
        this.source = source;
        this.count = count;
    }
    *[Symbol.iterator]() {
        let { source, count } = this;
        if (count <= 0) {
            return;
        }
        let offset = 0;
        for (let element of source) {
            yield element;
            if (offset++ < count) {
                break;
            }
        }
        return;
    }
}
class TakeWhileIterable {
    constructor(source, predicate) {
        this.source = source;
        this.predicate = predicate;
    }
    *[Symbol.iterator]() {
        let { source, predicate } = this;
        for (let element of source) {
            if (!predicate(element)) {
                break;
            }
            yield item;
        }
        return;
    }
}
class IntersectIterable {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    *[Symbol.iterator]() {
        let { left, right } = this;
        let set = new Set(right);
        if (set.size <= 0) {
            return;
        }
        for (let element of left) {
            if (set.delete(element)) {
                yield element;
            }
        }
        return;
    }
}
class UnionIterable {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    *[Symbol.iterator]() {
        let { left, right } = this;
        let set = new Set();
        for (let element of left) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        for (let element of right) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        return;
    }
}
class ExceptIterable {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    *[Symbol.iterator]() {
        let { left, right } = this;
        let set = new Set(right);
        for (let element of left) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        return;
    }
}
class DistinctIterable {
    constructor(source) {
        this.source = source;
    }
    *[Symbol.iterator]() {
        let set = new Set();
        for (let element of this.source) {
            if (SetAdd(set, element)) {
                yield element;
            }
        }
        return;
    }
}
class ConcatIterable {
    constructor(left, right) {
        this.left = left;
        this.right = right;
    }
    *[Symbol.iterator]() {
        let { left, right } = this;
        yield* left;
        yield* right;
        return;
    }
}
class ZipIterable {
    constructor(left, right, selector) {
        this.left = left;
        this.right = right;
        this.selector = selector;
    }
    *[Symbol.iterator]() {
        let { left, right, selector } = this;
        let leftIterator = GetIterator(left);
        try {
            let rightIterator = GetIterator(right);
            try {
                let leftIterResult = leftIterator.next();
                let rightIterResult = rightIterator.next();
                while (!leftIterResult.done && !rightIterResult.done) {
                    yield selector(leftIterResult.value, rightIterResult.value);
                    leftIterResult = leftIterator.next();
                    rightIterResult = rightIterator.next();
                }
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
        return;
    }
}
class OrderedIterable {
    constructor(source, keySelector, comparison, descending, parent) {
        this.source = source;
        this.keySelector = keySelector;
        this.comparison = comparison;
        this.descending = descending;
        this.parent = parent;
    }
    getSorter(elements, next) {
        let { keySelector, comparison, descending, parent } = this;
        let len = elements.length;
        let keys = elements.map(this.keySelector);
        const sorter = (x, y) => {
            let result = comparison(keys[x], keys[y]);
            if (result === 0) {
                return next ? next(x, y) : x - y;
            }
            return descending ? -result : result;
        };
        return parent ? parent.getSorter(elements, sorter) : sorter;
    }
    *[Symbol.iterator]() {
        let array = Array.from(this.source);
        let sorter = this.getSorter(array);
        let len = array.length;
        let indices = new Array(len);
        for (let i = 0; i < len; ++i) {
            indices[i] = i;
        }
        indices.sort(sorter);
        for (let index of indices) {
            yield array[index];
        }
        return;
    }
}
class GroupByIterable {
    constructor(source, keySelector, elementSelector, resultSelector) {
        this.source = source;
        this.keySelector = keySelector;
        this.elementSelector = elementSelector;
        this.resultSelector = resultSelector;
    }
    *[Symbol.iterator]() {
        let { resultSelector } = this;
        let map = CreateGroupings(this.source, this.keySelector, this.elementSelector);
        for (let [key, values] of map) {
            yield resultSelector(key, new Query(values));
        }
        return;
    }
}
class GroupJoinIterable {
    constructor(outer, inner, outerKeySelector, innerKeySelector, resultSelector) {
        this.outer = outer;
        this.inner = inner;
        this.outerKeySelector = outerKeySelector;
        this.innerKeySelector = innerKeySelector;
        this.resultSelector = resultSelector;
    }
    *[Symbol.iterator]() {
        let { outer, outerKeySelector, resultSelector } = this;
        let map = CreateGroupings(this.inner, this.innerKeySelector, Identity);
        for (let outerElement of outer) {
            let outerKey = outerKeySelector(outerElement);
            let innerElements = map.has(outerKey) ? map.get(outerKey) : emptyIterable;
            yield resultSelector(outerElement, new Query(innerElements));
        }
        return;
    }
}
class JoinIterable {
    constructor(outer, inner, outerKeySelector, innerKeySelector, resultSelector) {
        this.outer = outer;
        this.inner = inner;
        this.outerKeySelector = outerKeySelector;
        this.innerKeySelector = innerKeySelector;
        this.resultSelector = resultSelector;
    }
    *[Symbol.iterator]() {
        let { outer, outerKeySelector, resultSelector } = this;
        let map = CreateGroupings(this.inner, this.innerKeySelector, Identity);
        for (let outerElement of outer) {
            let outerKey = outerKeySelector(outerElement);
            let innerElements = map.get(outerKey);
            if (innerElements != null) {
                for (let innerElement of innerElements) {
                    yield resultSelector(outerElement, innerElements);
                }
            }
        }
        return;
    }
}
class LookupIterable {
    constructor(map, selector) {
        this.map = map;
        this.selector = selector;
    }
    *[Symbol.iterator]() {
        let { map, selector } = this;
        for (let [key, values] of map) {
            yield selector(key, new Query(values));
        }
        return;
    }
}
class DefaultIfEmptyIterable {
    constructor(source, defaultValue) {
        this.source = source;
        this.defaultValue = defaultValue;
    }
    *[Symbol.iterator]() {
        let iterator = GetIterator(this.source);
        try {
            let iterResult = iterator.next();
            if (iterResult.done) {
                yield this.defaultValue;
            }
            else {
                do {
                    yield iterResult.value;
                    iterResult = iterator.next();
                } while (!iterResult.done);
            }
        }
        finally {
            IteratorClose(iterator);
        }
        return;
    }
}
class AncestorHierarchyIterable {
    constructor(source, hierarchy, self) {
        this.source = source;
        this.hierarchy = hierarchy;
        this.self = self;
    }
    *[Symbol.iterator]() {
        let { source, hierarchy, self } = this;
        for (let element of source) {
            if (self) {
                yield element;
            }
            let current = hierarchy.parent(element);
            while (current !== undefined) {
                yield current;
                current = hierarchy.parent(current);
            }
        }
        return;
    }
}
class ParentHierarchyIterable {
    constructor(source, hierarchy) {
        this.source = source;
        this.hierarchy = hierarchy;
    }
    *[Symbol.iterator]() {
        let { source, hierarchy } = this;
        for (let element of source) {
            let parent = hierarchy.parent(element);
            if (parent !== undefined) {
                yield parent;
            }
        }
        return;
    }
}
class ChildHierarchyIterable {
    constructor(source, hierarchy) {
        this.source = source;
        this.hierarchy = hierarchy;
    }
    *[Symbol.iterator]() {
        let { source, hierarchy } = this;
        for (let element of source) {
            yield* hierarchy.children(element);
        }
        return;
    }
}
class DescendantHierarchyIterable {
    constructor(source, hierarchy, self) {
        this.source = source;
        this.hierarchy = hierarchy;
        this.self = self;
    }
    *[Symbol.iterator]() {
        let { source, hierarchy, self } = this;
        for (let element of source) {
            if (self) {
                yield element;
            }
            yield* new DescendantHierarchyIterable(hierarchy.children(element), hierarchy, true);
        }
        return;
    }
}
export let Query = class {
    constructor(source) {
        SetQuerySource(this, source);
    }
    static from(source) {
        if (IsIterable(source)) {
            return new Query(source);
        }
        else if (IsArrayLike(source)) {
            return new Query(new ArrayLikeIterable(source));
        }
        else {
            throw new TypeError();
        }
    }
    static of(...elements) {
        return new Query(elements);
    }
    static empty() {
        return new Query(emptyIterable);
    }
    static once(value) {
        return new Query(new OnceIterable(value));
    }
    static repeat(value, count) {
        return new Query(new RepeatIterable(value, count));
    }
    static range(start, end) {
        return new Query(new RangeIterable(start, end));
    }
    filter(predicate) {
        return new Query(new FilterIterable(this, predicate));
    }
    map(selector) {
        return new Query(new MapIterable(this, selector));
    }
    flatMap(projection) {
        return new Query(new FlatMapIterable(this, projection));
    }
    reverse() {
        return new Query(new ReverseIterable(this));
    }
    skip(count) {
        return new Query(new SkipIterable(this, count));
    }
    skipWhile(predicate) {
        return new Query(new SkipWhileIterable(this, predicate));
    }
    take(count) {
        return new Query(new TakeIterable(this, count));
    }
    takeWhile(predicate) {
        return new Query(new SkipWhileIterable(this, predicate));
    }
    intersect(other) {
        return new Query(new IntersectIterable(this, other));
    }
    union(other) {
        return new Query(new UnionIterable(this, other));
    }
    except(other) {
        return new Query(new ExceptIterable(this, other));
    }
    distinct() {
        return new Query(new DistinctIterable(this));
    }
    zip(right, selector) {
        return new Query(new ZipIterable(this, right, selector));
    }
    orderBy(keySelector, comparison = CompareValues) {
        return new OrderedQueryable(new OrderedIterable(this, keySelector, comparison, false));
    }
    orderByDescending(keySelector, comparison = CompareValues) {
        return new OrderedQueryable(new OrderedIterable(this, keySelector, comparison, true));
    }
    groupBy(keySelector, elementSelector = Identity, resultSelector = ToGrouping) {
        return new Query(new GroupByIterable(this, keySelector, elementSelector, resultSelector));
    }
    groupJoin(inner, outerKeySelector, innerKeySelector, resultSelector) {
        return new Query(new GroupJoinIterable(this, inner, outerKeySelector, innerKeySelector, resultSelector));
    }
    defaultIfEmpty(defaultValue) {
        return new Query(new DefaultIfEmptyIterable(this, defaultValue));
    }
    join(inner, outerKeySelector, innerKeySelector, resultSelector) {
        return new Query(new JoinIterable(this, inner, outerKeySelector, innerKeySelector, resultSelector));
    }
    reduce(aggregator, seed, resultSelector = Identity) {
        let result = seed;
        let seeded = arguments.length >= 2;
        let offset = 0;
        for (let element of this) {
            if (!seeded) {
                result = element;
                seeded = true;
            }
            else {
                result = aggregator(result, element, offset);
            }
            ++offset;
        }
        return resultSelector(result, offset);
    }
    reduceRight(aggregator, seed, resultSelector = Identity) {
        let result = seed;
        let seeded = arguments.length >= 2;
        let list = Array.from(this);
        const len = list.length;
        for (let offset = len - 1; offset >= 0; --offset) {
            let element = list[offset];
            if (!seeded) {
                result = element;
                seeded = true;
            }
            else {
                result = aggregator(result, element, offset);
            }
        }
        return resultSelector(result, len);
    }
    count(predicate) {
        let count = 0;
        if (predicate) {
            for (let element of this) {
                if (predicate(element)) {
                    count++;
                }
            }
        }
        else {
            for (let element of this) {
                count++;
            }
        }
        return count;
    }
    first(predicate) {
        for (let element of this) {
            if (!predicate || predicate(element)) {
                return element;
            }
        }
        return undefined;
    }
    last(predicate) {
        let last;
        for (let element of this) {
            if (!predicate || predicate(element)) {
                last = element;
            }
        }
        return last;
    }
    single() {
        let iterator = GetIterator(this);
        try {
            let { value, done } = iterator.next();
            if (!done) {
                let { done } = iterator.next();
                if (done) {
                    return value;
                }
            }
            return undefined;
        }
        finally {
            IteratorClose(iterator);
        }
    }
    min(selector) {
        let iterator = GetIterator(this);
        try {
            let iterResult = iterator.next();
            if (!iterResult.done) {
                let min = iterResult.value;
                if (selector) {
                    let minComparand = selector(min);
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        let valueComparand = selector(value);
                        if (valueComparand < minComparand) {
                            min = value;
                            minComparand = valueComparand;
                        }
                        iterResult = iterator.next();
                    }
                }
                else {
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        if (value < min) {
                            min = value;
                        }
                        iterResult = iterator.next();
                    }
                }
                return min;
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
    max(selector) {
        let iterator = GetIterator(this);
        try {
            let iterResult = iterator.next();
            if (!iterResult.done) {
                let max = iterResult.value;
                if (selector) {
                    let maxComparand = selector(max);
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        let valueComparand = selector(value);
                        if (valueComparand > maxComparand) {
                            max = value;
                            maxComparand = valueComparand;
                        }
                        iterResult = iterator.next();
                    }
                }
                else {
                    iterResult = iterator.next();
                    while (!iterResult.done) {
                        let value = iterResult.value;
                        if (value < max) {
                            max = value;
                        }
                        iterResult = iterator.next();
                    }
                }
                return max;
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
    some(predicate) {
        if (predicate) {
            for (let element of this) {
                if (predicate(element)) {
                    return true;
                }
            }
        }
        else {
            for (let element of this) {
                return true;
            }
        }
        return false;
    }
    every(predicate) {
        let any = false;
        for (let element of this) {
            if (!predicate(element)) {
                return false;
            }
            any = true;
        }
        return any;
    }
    sequenceEquals(other) {
        let leftIterator = GetIterator(this);
        try {
            let rightIterator = GetIterator(other);
            try {
                let leftIterResult = leftIterator.next();
                let rightIterResult = rightIterator.next();
                while (!leftIterResult.done && !rightIterResult.done) {
                    if (!SameValue(leftIterResult.value, rightIterResult.value)) {
                        return false;
                    }
                    leftIterResult = leftIterator.next();
                    rightIterResult = rightIterator.next();
                }
                return leftIterResult.done == rightIterResult.done;
            }
            finally {
                IteratorClose(rightIterator);
            }
        }
        finally {
            IteratorClose(leftIterator);
        }
    }
    includes(value) {
        for (let element of this) {
            if (SameValue(value, element)) {
                return true;
            }
        }
        return false;
    }
    elementAt(offset) {
        if (offset < 0) {
            return undefined;
        }
        let iterator = GetIterator(this);
        try {
            let iterResult = iterator.next();
            while (offset >= 0 && !iterResult.done) {
                if (offset === 0) {
                    return iterResult.value;
                }
                --offset;
                iterResult = iterator.next();
            }
        }
        finally {
            IteratorClose(iterator);
        }
    }
    forEach(callback) {
        let offset = 0;
        for (let element of this) {
            callback(element, offset++);
        }
    }
    toHierarchy(hierarchy) {
        return new HierarchyQueryable(this, hierarchy);
    }
    toArray(selector) {
        return Array.from(this, selector);
    }
    toSet(elementSelector = Identity) {
        let set = new Set();
        for (let item of this) {
            let element = elementSelector(item);
            set.add(element);
        }
        return set;
    }
    toMap(keySelector, elementSelector = Identity) {
        let map = new Map();
        for (let item of this) {
            let key = keySelector(item);
            let element = elementSelector(item);
            map.set(key, element);
        }
        return map;
    }
    toLookup(keySelector, elementSelector = Identity) {
        let map = CreateGroupings(this, keySelector, elementSelector);
        return new LookupQueryable(map);
    }
    toJSON() {
        return this.toArray();
    }
    *[Symbol.iterator]() {
        let source = GetQuerySource(this);
        yield* source;
        return;
    }
};
Object.defineProperty(Query, "name", { value: "Query", configurable: true });
Query = __decorate([ToStringTag("Query")], Query);
let OrderedQueryable = class extends Query {
    constructor(source) {
        super(source);
    }
    thenBy(keySelector, comparison = CompareValues) {
        let orderedIterable = GetQuerySource(this);
        return new OrderedQueryable(new OrderedIterable(orderedIterable.source, keySelector, comparison, false, orderedIterable));
    }
    thenByDescending(keySelector, comparison = CompareValues) {
        let orderedIterable = GetQuerySource(this);
        return new OrderedQueryable(new OrderedIterable(orderedIterable.source, keySelector, comparison, true, orderedIterable));
    }
};
Object.defineProperty(OrderedQueryable, "name", { value: "OrderedQueryable", configurable: true });
OrderedQueryable = __decorate([ToStringTag("OrderedQuery"), HideConstructor()], OrderedQueryable);
let GroupingQueryable = class extends Query {
    constructor(key, items) {
        super(items);
        SetGroupingKey(this, key);
    }
    get key() {
        return GetGroupingKey(this);
    }
};
Object.defineProperty(GroupingQueryable, "name", { value: "GroupingQueryable", configurable: true });
GroupingQueryable = __decorate([ToStringTag("Grouping"), HideConstructor()], GroupingQueryable);
let LookupQueryable = class extends Query {
    constructor(map) {
        super(new LookupIterable(map, ToGrouping));
        SetLookupMap(this, map);
    }
    get size() {
        let map = GetLookupMap(this);
        return map.size;
    }
    has(key) {
        let map = GetLookupMap(this);
        return map.has(key);
    }
    get(key) {
        let map = GetLookupMap(this);
        let grouping = map.has(key) ? map.get(key) : emptyIterable;
        return new Query(grouping);
    }
    applyResultSelector(selector) {
        let map = GetLookupMap(this);
        return new Query(new LookupIterable(map, selector));
    }
};
Object.defineProperty(LookupQueryable, "name", { value: "LookupQueryable", configurable: true });
LookupQueryable = __decorate([ToStringTag("Lookup"), HideConstructor()], LookupQueryable);
let HierarchyQueryable = class extends Query {
    constructor(source, hierarchy) {
        super(source);
        SetHierarchyProvider(this, hierarchy);
    }
    filter(predicate) {
        return super.filter(predicate).toHierarchy(GetHierarchyProvider(this));
    }
    reverse() {
        return super.reverse().toHierarchy(GetHierarchyProvider(this));
    }
    skip(count) {
        return super.skip(count).toHierarchy(GetHierarchyProvider(this));
    }
    skipWhile(predicate) {
        return super.skipWhile(predicate).toHierarchy(GetHierarchyProvider(this));
    }
    take(count) {
        return super.take(count).toHierarchy(GetHierarchyProvider(this));
    }
    takeWhile(predicate) {
        return super.takeWhile(predicate).toHierarchy(GetHierarchyProvider(this));
    }
    intersect(other) {
        return super.intersect(other).toHierarchy(GetHierarchyProvider(this));
    }
    union(other) {
        return super.union(other).toHierarchy(GetHierarchyProvider(this));
    }
    except(other) {
        return super.except(other).toHierarchy(GetHierarchyProvider(this));
    }
    distinct() {
        return super.distinct().toHierarchy(GetHierarchyProvider(this));
    }
    orderBy(keySelector, comparison = CompareValues) {
        return new OrderedHierarchyQueryable(new OrderedIterable(this, keySelector, comparison, false), GetHierarchyProvider(this));
    }
    orderByDescending(keySelector, comparison = CompareValues) {
        return new OrderedHierarchyQueryable(new OrderedIterable(this, keySelector, comparison, true), GetHierarchyProvider(this));
    }
    self() {
        return this;
    }
    parents() {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable(new ParentHierarchyIterable(this, hierarchy), hierarchy);
    }
    ancestors() {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable(new AncestorHierarchyIterable(this, hierarchy, false), hierarchy);
    }
    ancestorsOrSelf() {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable(new AncestorHierarchyIterable(this, hierarchy, true), hierarchy);
    }
    children() {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable(new ChildHierarchyIterable(this, hierarchy), hierarchy);
    }
    descendants() {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable(new DescendantHierarchyIterable(this, hierarchy, false), hierarchy);
    }
    descendantsOrSelf() {
        let hierarchy = GetHierarchyProvider(this);
        return new HierarchyQueryable(new DescendantHierarchyIterable(this, hierarchy, true), hierarchy);
    }
};
Object.defineProperty(HierarchyQueryable, "name", { value: "HierarchyQueryable", configurable: true });
HierarchyQueryable = __decorate([ToStringTag("HierarchyQuery"), HideConstructor()], HierarchyQueryable);
let OrderedHierarchyQueryable = class extends HierarchyQueryable {
    constructor(source, hierarchy) {
        super(source, hierarchy);
    }
    thenBy(keySelector, comparison = CompareValues) {
        let orderedIterable = GetQuerySource(this);
        let hierarchy = GetHierarchyProvider(this);
        return new OrderedHierarchyQueryable(new OrderedIterable(orderedIterable.source, keySelector, comparison, false, orderedIterable), hierarchy);
    }
    thenByDescending(keySelector, comparison = CompareValues) {
        let orderedIterable = GetQuerySource(this);
        let hierarchy = GetHierarchyProvider(this);
        return new OrderedHierarchyQueryable(new OrderedIterable(orderedIterable.source, keySelector, comparison, true, orderedIterable), hierarchy);
    }
};
Object.defineProperty(OrderedHierarchyQueryable, "name", { value: "OrderedHierarchyQueryable", configurable: true });
OrderedHierarchyQueryable = __decorate([ToStringTag("OrderedHierarchyQueryable"), HideConstructor()], OrderedHierarchyQueryable);
function SetQuerySource(query, source) {
    query[symQuerySource] = source;
}
function GetQuerySource(query) {
    return query[symQuerySource];
}
function SetGroupingKey(grouping, key) {
    grouping[symGroupingKey] = key;
}
function GetGroupingKey(grouping) {
    return grouping[symGroupingKey];
}
function SetLookupMap(lookup, map) {
    lookup[symLookupMap] = map;
}
function GetLookupMap(lookup) {
    return lookup[symLookupMap];
}
function GetHierarchyProvider(Hierarchy) {
    return Hierarchy[symHierarchyProvider];
}
function SetHierarchyProvider(Hierarchy, value) {
    Hierarchy[symHierarchyProvider] = value;
}
function Identity(x) {
    return x;
}
function CompareValues(x, y) {
    if (x < y) {
        return -1;
    }
    else if (x > y) {
        return +1;
    }
    return 0;
}
function SetAdd(set, value) {
    let size = set.size;
    set.add(value);
    return set.size > size;
}
function IsObject(x) {
    return x !== null && typeof x === "object";
}
function IsArrayLike(x) {
    return IsObject(x) && typeof x.length === "number";
}
function IsIterable(x) {
    return IsObject(x) && Symbol.iterator in x;
}
function GetIterator(iterable) {
    return iterable[Symbol.iterator]();
}
function IteratorClose(iterator) {
    let close = iterator.return;
    if (typeof close === "function") {
        return close.call(iterator);
    }
}
function CreateGroupings(source, keySelector, elementSelector) {
    let map = new Map();
    for (let item of source) {
        let key = keySelector(item);
        let element = elementSelector(item);
        let grouping = map.get(key);
        if (grouping == null) {
            grouping = [];
            map.set(key, grouping);
        }
        grouping.push(element);
    }
    return map;
}
function ToGrouping(key, elements) {
    return new GroupingQueryable(key, elements);
}
function SameValue(x, y) {
    return (x === y) ? (x !== 0 || 1 / x === 1 / y) : (x !== x && y !== y);
}
function ToStringTag(tag) {
    return function (target) {
        target.prototype[Symbol.toStringTag] = tag;
    };
}
function HideConstructor() {
    return function (target) {
        target.prototype.constructor = Object.getPrototypeOf(target.prototype).constructor;
    };
}
//# sourceMappingURL=query.js.map