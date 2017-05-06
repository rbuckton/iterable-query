import { mustBeQueryable, mustBeFunction, mustBePositiveFiniteNumber, mustBePositiveNonZeroFiniteNumber, mustBeOrderedIterable, mustBeInteger, mustBeObjectOrNull, mustBeFiniteNumber, mustBeIterator, mustBeQueryableOrUndefined, mustBeObject } from "./assert";
import { FilterIterable, MapIterable, Queryable, FlatMapIterable, ExpandIterable, TapIterable, ReverseIterable, SkipIterable, SkipRightIterable, SkipWhileIterable, TakeIterable, TakeRightIterable, TakeWhileIterable, IntersectIterable, UnionIterable, ExceptIterable, ConcatIterable, DistinctIterable, AppendIterable, PrependIterable, PatchIterable, DefaultIfEmptyIterable, PageByIterable, ZipIterable, OrderByIterable, SpanMapIterable, GroupByIterable, GroupJoinIterable, JoinIterable, FullJoinIterable, ScanIterable, ScanRightIterable, ConsumeIterable, EmptyIterable, OrderedIterable, DefaultSequenceIfEmptyIterable, OnceIterable, RepeatIterable, RangeIterable, ReverseRangeIterable, ContinuousIterable, GenerateIterable, BranchIterable, ChooseIterable } from "./core";
import { ToIterable, CompareValues, Identity, GetIterator, IteratorClose, True, SameValue, CreateGroupings, MakeTuple, ToGrouping, GetUnorderedIterable, IsIterable } from "./utils";
import { Page, Grouping, Lookup } from "./query";

/**
 * Produce a sequence with no elements.
 */
export function empty<T>(): Iterable<T> {
    return new EmptyIterable<T>();
}

/**
 * Produce a sequence over a single element.
 *
 * @param value The only element for the query.
 */
export function once<T>(value: T): Iterable<T> {
    return new OnceIterable<T>(value);
}

/**
 * Produce a sequence for a value repeated a provided number of times.
 *
 * @param value The value for each element of the Query.
 * @param count The number of times to repeat the value.
 */
export function repeat<T>(value: T, count: number): Iterable<T> {
    mustBePositiveFiniteNumber(count, "count");
    return new RepeatIterable(value, count);
}

/**
 * Produce a sequence over a range of numbers.
 *
 * @param start The starting number of the range.
 * @param end The ending number of the range.
 * @param increment The amount by which to change between each itereated value.
 */
export function range(start: number, end: number, increment?: number): Iterable<number> {
    if (increment === undefined) increment = 1;
    mustBeFiniteNumber(start, "start");
    mustBeFiniteNumber(end, "end");
    mustBePositiveNonZeroFiniteNumber(increment, "increment");
    if (start < end) {
        return new RangeIterable(start, end, increment);
    }
    else {
        return new ReverseRangeIterable(start, end, increment);
    }
}

/**
 * Produce a sequence that repeats the provided value forever.
 *
 * @param value The value for each element of the Query.
 */
export function continuous<T>(value: T): Iterable<T> {
    return new ContinuousIterable(value);
}

/**
 * Produce a sequence whose values are provided by a callback executed a provided number of
 * times.
 *
 * @param count The number of times to execute the callback.
 * @param generator The callback to execute.
 */
export function generate<T>(count: number, generator: (offset: number) => T): Iterable<T> {
    mustBePositiveFiniteNumber(count, "count");
    mustBeFunction(generator, "generator");
    return new GenerateIterable(count, generator);
}

/**
 * Produce a sequence that when iterated consumes the provided Iterator.
 *
 * @param iterator An Iterator.
 */
export function consume<T>(iterator: Iterator<T>): Iterable<T> {
    mustBeIterator(iterator, "iterator");
    return new ConsumeIterable(iterator);
}

/**
 * Produce a sequence that iterates the elements from one of two sources based on the result of a
 * lazily evaluated condition.
 *
 * @param condition A callback used to choose a source.
 * @param thenQueryable The source to use when the callback evaluates to `true`.
 * @param elseQueryable The source to use when the callback evaluates to `false`.
 */
export function branch<T>(condition: () => boolean, thenQueryable: Queryable<T>, elseQueryable: Queryable<T>) {
    mustBeFunction(condition, "condition");
    mustBeQueryable(thenQueryable, "thenQueryable");
    mustBeQueryable(elseQueryable, "elseQueryable");
    return new BranchIterable(condition, ToIterable(thenQueryable), ToIterable(elseQueryable));
}

export { branch as if };

/**
 * Produce a sequence that iterates the elements from sources picked from a list based on the
 * result of a lazily evaluated choice.
 *
 * @param chooser A callback used to choose a source.
 * @param choices A list of sources
 * @param otherwise A default source to use when another choice could not be made.
 */
export function choose<K, T>(chooser: () => K, choices: Queryable<[K, Queryable<T>]>, otherwise?: Queryable<T>) {
    mustBeFunction(chooser, "chooser");
    mustBeQueryable(choices, "choices");
    mustBeQueryableOrUndefined(otherwise, "otherwise");
    return new ChooseIterable(chooser, ToIterable(choices), otherwise !== undefined ? ToIterable(otherwise) : undefined);
}

/**
 * Produce a sequence for the own property keys of an object.
 *
 * @param source An object.
 */
export function objectKeys<T>(source: T): Iterable<keyof T> {
    mustBeObject(source, "source");
    const keys = Object.keys(source);
    return <Iterable<keyof T>><Iterable<string>>keys;
}

/**
 * Produce a sequence for the own property values of an object.
 *
 * @param source An object.
 */
export function objectValues<T>(source: T): Iterable<T[keyof T]> {
    mustBeObject(source, "source");
    const keys = Object.keys(source);
    return new MapIterable(keys, (key: keyof T) => source[key]);
}

/**
 * Produce a sequence for the own property key-value pairs of an object.
 *
 * @param source An object.
 */
export function objectEntries<T>(source: T): Iterable<[keyof T, T[keyof T]]> {
    mustBeObject(source, "source");
    const keys = Object.keys(source);
    return new MapIterable(keys, (key: keyof T) => MakeTuple(key, source[key]));
}

/**
 * Produce a sequence of values containing only those elements of a source sequence that match the supplied predicate.
 *
 * @param source The sequence to filter.
 * @param predicate A function used to test each element.
 */
export function filter<T, U extends T>(source: Queryable<T>, predicate: (element: T, offset: number) => element is U): Iterable<U>

/**
 * Produce a sequence of values containing only those elements of a source sequence that match the supplied predicate.
 *
 * @param source The sequence to filter.
 * @param predicate A function used to test each element.
 */
export function filter<T>(source: Queryable<T>, predicate: (element: T, offset: number) => boolean): Iterable<T>

/**
 * Produce a sequence of values containing only those elements of a source sequence that match the supplied predicate.
 *
 * @param source The sequence to filter.
 * @param predicate A function used to test each element.
 */
export function filter<T>(source: Queryable<T>, predicate: (element: T, offset: number) => boolean): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    return new FilterIterable(ToIterable(source), predicate);
}

export { filter as where }

/**
 * Produce a sequence of values by projecting each element of a source sequence.
 *
 * @param source The sequence to map.
 * @param selector A function used to map each element.
 */
export function map<T, U>(source: Queryable<T>, selector: (element: T, offset: number) => U): Iterable<U> {
    mustBeQueryable(source, "source");
    mustBeFunction(selector, "selector");
    return new MapIterable(ToIterable(source), selector);
}

export { map as select }

/**
 * Produce a sequence of values by flattening the results from projecting each element of a source sequence.
 *
 * @param source The sequence to project.
 * @param projection A function used to map each element into an iterable.
 */
export function flatMap<T, U>(source: Queryable<T>, projection: (element: T) => Queryable<U>): Iterable<U> {
    mustBeQueryable(source, "source");
    mustBeFunction(projection, "projection");
    return new FlatMapIterable(ToIterable(source), projection);
}

export { flatMap as selectMany }

/**
 * Produce a sequence of values by recursively expanding each element of a source sequence.
 *
 * @param source The sequence to expand.
 * @param projection A function used to recusively expand each element.
 */
export function expand<T>(source: Queryable<T>, projection: (element: T) => Queryable<T>): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(projection, "projection");
    return new ExpandIterable(ToIterable(source), projection);
}

/**
 * Lazily invokes a function as each element of a source sequence is enumerated.
 *
 * @param source The sequence to tap.
 * @param callback The function to invoke.
 */
export function tap<T>(source: Queryable<T>, callback: (element: T, offset: number) => void): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(callback, "callback");
    return new TapIterable(ToIterable(source), callback);
}

export { tap as do }

/**
 * Pass the entire source sequence to the provided callback, producing a new sequence.
 *
 * @param source The sequence to pass.
 * @param callback A function function.
 */
export function through<T, U = T>(source: Queryable<T>, callback: (query: Iterable<T>) => Iterable<U>): Iterable<U> {
    mustBeQueryable(source, "source");
    mustBeFunction(callback, "callback");
    return callback(ToIterable(source));
}

/**
 * Produce a sequence of values in the reverse order of a source sequence.
 *
 * @param source The source sequence.
 */
export function reverse<T>(source: Queryable<T>): Iterable<T> {
    mustBeQueryable(source, "source");
    return new ReverseIterable(ToIterable(source));
}

/**
 * Skips a specified number of elements of a source sequence.
 *
 * @param source The source sequence.
 * @param count The number of elements to skip.
 */
export function skip<T>(source: Queryable<T>, count: number): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBePositiveFiniteNumber(count, "count");
    return new SkipIterable(ToIterable(source), count);
}

/**
 * Skips the specified number of trailing elements at the end of a source sequence.
 *
 * @param source The source sequence.
 * @param count The number of elements to skip.
 */
export function skipRight<T>(source: Queryable<T>, count: number): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBePositiveFiniteNumber(count, "count");
    return new SkipRightIterable(ToIterable(source), count);
}

/**
 * Skips elements from the beginning of a sequence that match the supplied predicate.
 *
 * @param source The source sequence.
 * @param predicate A function used to test each element.
 */
export function skipWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    return new SkipWhileIterable(ToIterable(source), predicate);
}

/**
 * Takes the specified number of elements from the beginning of a sequence.
 *
 * @param source The source sequence.
 * @param count The number of elements to take.
 */
export function take<T>(source: Queryable<T>, count: number): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBePositiveFiniteNumber(count, "count");
    return new TakeIterable(ToIterable(source), count);
}

/**
 * Takes the specified number of elements from the end of a sequence.
 *
 * @param source The source sequence.
 * @param count The number of elements to take from the right.
 */
export function takeRight<T>(source: Queryable<T>, count: number): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBePositiveFiniteNumber(count, "count");
    return new TakeRightIterable(ToIterable(source), count);
}

/**
 * Takes elements from the beginning of a sequence that match the supplied predicate.
 *
 * @param source The source sequence.
 * @param predicate A function used to test each element.
 */
export function takeWhile<T, U extends T>(source: Queryable<T>, predicate: (element: T) => element is U): Iterable<U>;

/**
 * Takes elements from the beginning of a sequence that match the supplied predicate.
 *
 * @param source The source sequence.
 * @param predicate A function used to test each element.
 */
export function takeWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): Iterable<T>;

/**
 * Takes elements from the beginning of a sequence that match the supplied predicate.
 *
 * @param source The source sequence.
 * @param predicate A function used to test each element.
 */
export function takeWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    return new TakeWhileIterable(ToIterable(source), predicate);
}

/**
 * Produce the set intersection of two sequences.
 *
 * @param first A sequence whose distinct elements form the first set of the intersection.
 * @param second A sequence whose distinct elements form the second set of the intersection.
 */
export function intersect<T>(first: Queryable<T>, second: Queryable<T>): Iterable<T> {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    return new IntersectIterable(ToIterable(first), ToIterable(second));
}

/**
 * Produce the set union of two sequences.
 *
 * @param first A sequence whose distinct elements form the first set of the union.
 * @param second A sequence whose distinct elements form the second set of the union.
 */
export function union<T>(first: Queryable<T>, second: Queryable<T>): Iterable<T> {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    return new UnionIterable(ToIterable(first), ToIterable(second));
}

/**
 * Produce the set difference between two sequences.
 *
 * @param first A sequence whose elements that are not also in `second` will be returned.
 * @param second A sequence whose elements that also occur in `first` will cause those elements to
 * be removed from the sequence.
 */
export function except<T>(first: Queryable<T>, second: Queryable<T>): Iterable<T> {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    return new ExceptIterable(ToIterable(first), ToIterable(second));
}

/**
 * Concatenates two sequences.
 *
 * @param first The first sequence to concatenate.
 * @param second The second sequence to concatenate to the first sequence.
 */
export function concat<T>(first: Queryable<T>, second: Queryable<T>): Iterable<T> {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    return new ConcatIterable(ToIterable(first), ToIterable(second));
}

/**
 * Produce a sequence of distinct elements.
 *
 * @param source The sequence from which distinct elements are to be returned.
 */
export function distinct<T>(source: Queryable<T>): Iterable<T> {
    mustBeQueryable(source, "source");
    return new DistinctIterable(ToIterable(source));
}

/**
 * Produce a sequence of elements that also has the provided value at the end.
 *
 * @param source The source sequence.
 * @param value The value to append.
 */
export function append<T>(source: Queryable<T>, value: T): Iterable<T> {
    mustBeQueryable(source, "source");
    return new AppendIterable(ToIterable(source), value);
}

/**
 * Produce a sequence of values that also has the provided value at the beginning.
 *
 * @param source The source sequence.
 * @param value The value to prepend.
 */
export function prepend<T>(source: Queryable<T>, value: T): Iterable<T> {
    mustBeQueryable(source, "source");
    return new PrependIterable(value, ToIterable(source));
}

/**
 * Eagerly evaluate a sequence, returning a new sequence consisting of the same elements in the same order.
 *
 * @param source The source sequence.
 */
export function evaluate<T>(source: Queryable<T>): Iterable<T> {
    mustBeQueryable(source, "source");
    return toArray(source);
}

export { evaluate as exec }

/**
 * Produce a sequence with the provided range patched into the results.
 *
 * @param source The sequence to patch.
 * @param start The offset at which to patch the range.
 * @param skipCount The number of elements to skip from start.
 * @param range The range to patch into the result.
 */
export function patch<T>(source: Queryable<T>, start: number, skipCount: number, range: Queryable<T>): Iterable<T> {
    mustBeQueryable(source, "source");
    mustBePositiveFiniteNumber(start, "start");
    mustBePositiveFiniteNumber(skipCount, "skipCount");
    mustBeQueryable(range, "range");
    return new PatchIterable(ToIterable(source), start, skipCount, ToIterable(range));
}

/**
 * Produce a sequence that consists of the provided value if the source sequence contains no elements.
 *
 * @param source The source sequence.
 * @param defaultValue The default value.
 */
export function defaultIfEmpty<T>(source: Queryable<T>, defaultValue: T): Iterable<T> {
    mustBeQueryable(source, "source");
    return new DefaultIfEmptyIterable(ToIterable(source), defaultValue);
}

/**
 * Produce a sequence that consists of the provided value if the source sequence contains no elements.
 *
 * @param source The source sequence.
 * @param defaultValues The sequence to use if `source` contains no elements.
 */
export function defaultSequenceIfEmpty<T>(source: Queryable<T>, defaultValues: Queryable<T>): Iterable<T> {
    mustBeQueryable(source, "source");
    return new DefaultSequenceIfEmptyIterable(ToIterable(source), ToIterable(defaultValues));
}

/**
 * Produce a sequence of pages of elements subdivided from the source sequence.
 *
 * @param source The source sequence.
 * @param pageSize The number of elements per page.
 */
export function pageBy<T>(source: Queryable<T>, pageSize: number): Iterable<Page<T>> {
    mustBeQueryable(source, "source");
    mustBePositiveNonZeroFiniteNumber(pageSize, "pageSize");
    return new PageByIterable(ToIterable(source), pageSize);
}

/**
 * Produce a sequence of tuples from the corresponding elements of two sequences.
 *
 * @param first The first sequence to merge.
 * @param second The second sequence to merge.
 */
export function zip<T, U>(first: Queryable<T>, second: Queryable<U>): Iterable<[T, U]>;

/**
 * Produce a sequence by applying a function to the corresponding elements of two sequences.
 *
 * @param first The first sequence to merge.
 * @param second The second sequence to merge.
 * @param selector A function used to combine two elements.
 */
export function zip<T, U, R>(first: Queryable<T>, second: Queryable<U>, selector: (first: T, second: U) => R): Iterable<R>;

/**
 * Produce a sequence by applying a function to the corresponding elements of two sequences.
 *
 * @param first The first sequence to merge.
 * @param second The second sequence to merge.
 * @param selector A function used to combine two elements.
 */
export function zip<T, U, R>(first: Queryable<T>, second: Queryable<U>, selector: (first: T, second: U) => [T, U] | R = MakeTuple): Iterable<[T, U] | R> {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    mustBeFunction(selector, "selector");
    return new ZipIterable(ToIterable(first), ToIterable(second), selector);
}

/**
 * Produce a sequence whose elements are sorted in ascending order by the provided key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param comparison An optional function used to compare two keys.
 */
export function orderBy<T, K>(source: Queryable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedIterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(comparison, "comparison");
    return new OrderByIterable(GetUnorderedIterable(ToIterable(source)), keySelector, comparison, /*descending*/ false);
}

/**
 * Produce a sequence whose elements are sorted in descending order by the provided key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param comparison An optional function used to compare two keys.
 */
export function orderByDescending<T, K>(source: Queryable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedIterable<T> {
    mustBeQueryable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(comparison, "comparison");
    return new OrderByIterable(GetUnorderedIterable(ToIterable(source)), keySelector, comparison, /*descending*/ true);
}

/**
 * Produce a subsequent ordering of the elements in a sequence in ascending order by the provided key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param comparison An optional function used to compare two keys.
 */
export function thenBy<T, K>(source: OrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedIterable<T> {
    mustBeOrderedIterable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(comparison, "comparison");
    return new OrderByIterable(source.unordered(), keySelector, comparison, /*descending*/ false, source);
}

/**
 * Produce a subsequent ordering of the elements in a sequence in descending order by the provided key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param comparison An optional function used to compare two keys.
 */
export function thenByDescending<T, K>(source: OrderedIterable<T>, keySelector: (element: T) => K, comparison: (x: K, y: K) => number = CompareValues): OrderedIterable<T> {
    mustBeOrderedIterable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(comparison, "comparison");
    return new OrderByIterable(source.unordered(), keySelector, comparison, /*descending*/ true, source);
}

/**
 * Produce a sequence whose values are computed from each element of the contiguous ranges of elements that share the same key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param elementSelector A function used to select a value for an element.
 */
export function spanMap<T, K, V = T>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Iterable<Grouping<K, V>>;

/**
 * Produce a sequence whose values are computed from the contiguous ranges of elements that share the same key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param elementSelector A function used to select a value for an element.
 * @param resultSelector A function used to select a result from a contiguous range.
 */
export function spanMap<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<V>) => R): Iterable<R>;

/**
 * Produce a sequence whose values are computed from the contiguous ranges of elements that share the same key.
 *
 * @param source The sequence to order.
 * @param keySelector A function used to select the key for an element.
 * @param elementSelector An optional function used to select a value for an element.
 * @param resultSelector An optional function used to select a result from a contiguous range.
 */
export function spanMap<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity, resultSelector: (key: K, span: Iterable<V>) => Grouping<K, V> | R = ToGrouping): Iterable<Grouping<K, V> | R> {
    mustBeQueryable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(elementSelector, "elementSelector");
    mustBeFunction(resultSelector, "resultSelector");
    return new SpanMapIterable(ToIterable(source), keySelector, elementSelector, resultSelector);
}

/**
 * Groups each element by its key.
 *
 * @param source The sequence whose elements should be grouped.
 * @param keySelector A function used to select the key for an element.
 * @param elementSelector A function used to select a value for an element.
 */
export function groupBy<T, K, V = T>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Iterable<Grouping<K, V>>;

/**
 * Groups each element by its key.
 *
 * @param source The sequence whose elements should be grouped.
 * @param keySelector A function used to select the key for an element.
 * @param elementSelector A function used to select a value for an element.
 * @param resultSelector A function used to select a result from a group.
 */
export function groupBy<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V, resultSelector: (key: K, elements: Iterable<V>) => R): Iterable<R>;

/**
 * Groups each element by its key.
 *
 * @param source The sequence whose elements should be grouped.
 * @param keySelector A function used to select the key for an element.
 * @param elementSelector An optional function used to select a value for an element.
 * @param resultSelector An optional function used to select a result from a group.
 */
export function groupBy<T, K, V, R>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity, resultSelector: (key: K, elements: Iterable<V>) => Grouping<K, V> | R = ToGrouping): Iterable<Grouping<K, V> | R> {
    mustBeQueryable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(elementSelector, "elementSelector");
    mustBeFunction(resultSelector, "resultSelector");
    return new GroupByIterable(ToIterable(source), keySelector, elementSelector, resultSelector);
}

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys and groups the results.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 * @param resultSelector A function used to select the result for the correlated elements.
 */
export function groupJoin<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: Iterable<I>) => R): Iterable<R> {
    mustBeQueryable(outer, "outer");
    mustBeQueryable(inner, "inner");
    mustBeFunction(outerKeySelector, "outerKeySelector");
    mustBeFunction(innerKeySelector, "innerKeySelector");
    mustBeFunction(resultSelector, "resultSelector");
    return new GroupJoinIterable(ToIterable(outer), ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector);
}

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 */
export function join<O, I, K>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K): Iterable<[O, I]>;

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 * @param resultSelector A function used to select the result for the correlated elements.
 */
export function join<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: I) => R): Iterable<R>;

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 * @param resultSelector A function used to select the result for the correlated elements.
 */
export function join<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O, inner: I) => [O, I] | R = MakeTuple): Iterable<[O, I] | R> {
    mustBeQueryable(outer, "outer");
    mustBeQueryable(inner, "inner");
    mustBeFunction(outerKeySelector, "outerKeySelector");
    mustBeFunction(innerKeySelector, "innerKeySelector");
    mustBeFunction(resultSelector, "resultSelector");
    return new JoinIterable(ToIterable(outer), ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector);
}

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys. If
 * an element from either sequence cannot be correlated with an element from the other sequence, `undefined`
 * will be used in its place.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 */
export function fullJoin<O, I, K>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K): Iterable<[O | undefined, I | undefined]>;

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys. If
 * an element from either sequence cannot be correlated with an element from the other sequence, `undefined`
 * will be used in its place.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 * @param resultSelector A function used to select the result for the correlated elements.
 */
export function fullJoin<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => R): Iterable<R>;

/**
 * Produce a sequence for the correlated elements of two sequences based on the equality of their keys. If
 * an element from either sequence cannot be correlated with an element from the other sequence, `undefined`
 * will be used in its place.
 *
 * @param outer The outer sequence.
 * @param inner The inner sequence.
 * @param outerKeySelector A function used to select the key for an element in `outer`
 * @param innerKeySelector A function used to select the key for an element in `inner`.
 * @param resultSelector A function used to select the result for the correlated elements.
 */
export function fullJoin<O, I, K, R>(outer: Queryable<O>, inner: Queryable<I>, outerKeySelector: (element: O) => K, innerKeySelector: (element: I) => K, resultSelector: (outer: O | undefined, inner: I | undefined) => [O | undefined, I | undefined] | R = MakeTuple): Iterable<[O | undefined, I | undefined] | R> {
    mustBeQueryable(outer, "outer");
    mustBeQueryable(inner, "inner");
    mustBeFunction(outerKeySelector, "outerKeySelector");
    mustBeFunction(innerKeySelector, "innerKeySelector");
    mustBeFunction(resultSelector, "resultSelector");
    return new FullJoinIterable(ToIterable(outer), ToIterable(inner), outerKeySelector, innerKeySelector, resultSelector);
}

/**
 * Produce a sequence of the cumulative results of applying the provided callback to each element.
 *
 * @param source The sequence to scan.
 * @param accumulator The function used to compute each result.
 */
export function scan<T>(source: Queryable<T>, accumulator: (current: T, element: T, offset: number) => T): Iterable<T>;

/**
 * Produce a sequence of the cumulative results of applying the provided callback to each element.
 *
 * @param source The sequence to scan.
 * @param accumulator The function used to compute each result.
 * @param seed A seed value.
 */
export function scan<T, U = T>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U): Iterable<U>;

/**
 * Produce a sequence of the cumulative results of applying the provided callback to each element.
 *
 * @param source The sequence to scan.
 * @param accumulator The function used to compute each result.
 * @param seed An optional seed value.
 */
export function scan<T, U>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed?: U): Iterable<U> {
    mustBeQueryable(source, "source");
    mustBeFunction(accumulator, "accumulator");
    return new ScanIterable(ToIterable(source), accumulator, /*isSeeded*/ arguments.length >= 2, seed);
}

/**
 * Produce a sequence of the cumulative results of applying the provided callback to each element in reverse.
 *
 * @param source The sequence to scan.
 * @param accumulator The function used to compute each result.
 */
export function scanRight<T>(source: Queryable<T>, accumulator: (current: T, element: T, offset: number) => T): Iterable<T>;

/**
 * Produce a sequence of the cumulative results of applying the provided callback to each element in reverse.
 *
 * @param source The sequence to scan.
 * @param accumulator The function used to compute each result.
 * @param seed An optional seed value.
 */
export function scanRight<T, U = T>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U): Iterable<U>;

/**
 * Produce a sequence of the cumulative results of applying the provided callback to each element in reverse.
 *
 * @param source The sequence to scan.
 * @param accumulator The function used to compute each result.
 * @param seed An optional seed value.
 */
export function scanRight<T, U>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed?: U): Iterable<U> {
    mustBeQueryable(source, "source");
    mustBeFunction(accumulator, "accumulator");
    return new ScanRightIterable(ToIterable(source), accumulator, /*isSeeded*/ arguments.length >= 2, seed);
}

/**
 * Computes a scalar value by applying an accumulator function to each element.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 */
export function reduce<T>(source: Queryable<T>, accumulator: (current: T, element: T, offset: number) => T): T | undefined;

/**
 * Computes a scalar value by applying an accumulator function to each element.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 * @param seed A seed value.
 */
export function reduce<T, U = T>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U): U;

/**
 * Computes a scalar value by applying an accumulator function to each element.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 * @param seed A seed value.
 * @param resultSelector An optional function used to compute the final result.
 */
export function reduce<T, U = T, R = U>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

/**
 * Computes a scalar value by applying an accumulator function to each element.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 * @param seed An optional seed value.
 * @param resultSelector An optional function used to compute the final result.
 */
export function reduce<T, U, R>(source: Queryable<T>, accumulator: (current: T | U, element: T, offset: number) => U, seed?: T | U, resultSelector: (result: T | U, count: number) => R = Identity): R {
    mustBeQueryable(source, "source");
    mustBeFunction(accumulator, "accumulator");
    mustBeFunction(resultSelector, "resultSelector");
    let isSeeded = arguments.length >= 2;
    let current = seed;
    let offset = 0;
    for (const value of ToIterable(source)) {
        current = isSeeded ? accumulator(current, value, offset) : (isSeeded = true, value);
        offset++;
    }
    return resultSelector(current, offset);
}

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 */
export function reduceRight<T>(source: Queryable<T>, accumulator: (current: T, element: T, offset: number) => T): T | undefined;

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 * @param seed A seed value.
 */
export function reduceRight<T, U = T>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U): U;

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 * @param seed A seed value.
 * @param resultSelector An optional function used to compute the final result.
 */
export function reduceRight<T, U = T, R = U>(source: Queryable<T>, accumulator: (current: U, element: T, offset: number) => U, seed: U, resultSelector: (result: U, count: number) => R): R;

/**
 * Computes a scalar value by applying an accumulator callback over each element in reverse.
 *
 * @param source The sequence to reduce.
 * @param accumulator The function used to compute the result.
 * @param seed An optional seed value.
 * @param resultSelector An optional function used to compute the final result.
 */
export function reduceRight<T, U, R>(source: Queryable<T>, accumulator: (current: T | U, element: T, offset: number) => T | U, seed?: T | U, resultSelector: (result: T | U, count: number) => R = Identity): R {
    mustBeQueryable(source, "source");
    mustBeFunction(accumulator, "accumulator");
    mustBeFunction(resultSelector, "resultSelector");
    const array = toArray(ToIterable(source));
    let isSeeded = arguments.length >= 2;
    let current = seed;
    let count = 0;
    for (let offset = array.length - 1; offset >= 0; offset--) {
        const value = array[offset];
        current = isSeeded ? accumulator(current, value, offset) : (isSeeded = true, current = value);
        count++;
    }
    return resultSelector(current, count);
}

/**
 * Counts the number of elements in the sequence, optionally filtering elements using the supplied
 * callback.
 *
 * @param source The sequence to count.
 * @param predicate An optional function used to test each element.
 */
export function count<T>(source: Queryable<T>, predicate: (element: T) => boolean = True): number {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    if (predicate === True) {
        if (Array.isArray(source)) return source.length;
        if (source instanceof Set || source instanceof Map) return (<Set<any> | Map<any, any>>source).size;
    }
    let count = 0;
    for (const element of ToIterable(source)) {
        if (predicate(element)) count++;
    }
    return count;
}

/**
 * Gets the first element in the sequence that matches the supplied predicate function.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function first<T, U extends T>(source: Queryable<T>, predicate: (element: T) => element is U): U | undefined;

/**
 * Gets the first element in the sequence, optionally filtering elements using the supplied
 * callback.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function first<T>(source: Queryable<T>, predicate?: (element: T) => boolean): T | undefined;

/**
 * Gets the first element in the sequence, optionally filtering elements using the supplied
 * callback.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function first<T>(source: Queryable<T>, predicate: (element: T) => boolean = True): T | undefined {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    for (const element of ToIterable(source)) {
        if (predicate(element)) return element;
    }
    return undefined;
}

/**
 * Gets the last element in the sequence that matches the supplied predicate function.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function last<T, U extends T>(source: Queryable<T>, predicate: (element: T) => element is U): U | undefined;

/**
 * Gets the last element in the sequence, optionally filtering elements using the supplied
 * predicate function.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function last<T>(source: Queryable<T>, predicate?: (element: T) => boolean): T | undefined;

/**
 * Gets the last element in the sequence, optionally filtering elements using the supplied
 * predicate.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function last<T>(source: Queryable<T>, predicate: (element: T) => boolean = True): T | undefined {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    let result: T;
    for (const element of ToIterable(source)) {
        if (predicate(element)) result = element;
    }
    return result;
}

/**
 * Gets the only element in the sequence that matches the supplied predicate function.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function single<T, U extends T>(source: Queryable<T>, predicate: (element: T) => element is U): U | undefined;

/**
 * Gets the only element in the sequence, optionally filtering elements using the supplied
 * predicate function.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function single<T>(source: Queryable<T>, predicate?: (element: T) => boolean): T | undefined;

/**
 * Gets the only element in the sequence, optionally filtering elements using the supplied
 * predicate function.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function single<T>(source: Queryable<T>, predicate: (element: T) => boolean = True): T | undefined {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    let hasElements = false;
    let result: T;
    for (const element of ToIterable(source)) {
        if (predicate(element)) {
            if (hasElements) return undefined;
            hasElements = true;
            result = element;
        }
    }
    return hasElements ? result : undefined;
}

/**
 * Gets the minimum element in the sequence, optionally comparing elements using the supplied
 * callback.
 *
 * @param source The source sequence.
 * @param comparison An optional function used to compare two elements.
 */
export function min<T>(source: Queryable<T>, comparison: (x: T, y: T) => number = CompareValues): T | undefined {
    mustBeQueryable(source, "source");
    mustBeFunction(comparison, "comparison");
    let hasElements = false;
    let result: T;
    for (const element of ToIterable(source)) {
        if (!hasElements) {
            result = element;
            hasElements = true;
        }
        else if (comparison(element, result) < 0) {
            result = element;
        }
    }
    return result;
}

/**
 * Gets the maximum element in the sequence, optionally comparing elements using the supplied
 * callback.
 *
 * @param source The source sequence.
 * @param comparison An optional function used to compare two elements.
 */
export function max<T>(source: Queryable<T>, comparison: (x: T, y: T) => number = CompareValues): T | undefined {
    mustBeQueryable(source, "source");
    mustBeFunction(comparison, "comparison");
    let hasElements = false;
    let result: T;
    for (const element of ToIterable(source)) {
        if (!hasElements) {
            result = element;
            hasElements = true;
        }
        else if (comparison(element, result) > 0) {
            result = element;
        }
    }
    return result;
}

/**
 * Computes a scalar value indicating whether the sequence contains any elements,
 * optionally filtering the elements using the supplied callback.
 *
 * @param source The source sequence.
 * @param predicate An optional function used to match each element.
 */
export function some<T>(source: Queryable<T>, predicate: (element: T) => boolean = True): boolean {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    for (const element of ToIterable(source)) {
        if (predicate(element)) {
            return true;
        }
    }
    return false;
}

export { some as any }

/**
 * Computes a scalar value indicating whether all elements of a sequence
 * match the supplied callback.
 *
 * @param source The source sequence.
 * @param predicate A function used to match each element.
 */
export function every<T, U extends T = T>(source: Queryable<T>, predicate: (element: T) => element is T): source is Queryable<U>;

/**
 * Computes a scalar value indicating whether all elements of a sequence
 * match the supplied callback.
 *
 * @param source The source sequence.
 * @param predicate A function used to match each element.
 */
export function every<T>(source: Queryable<T>, predicate: (element: T) => boolean): boolean;

/**
 * Computes a scalar value indicating whether all elements of a sequence
 * match the supplied callback.
 *
 * @param source The source sequence.
 * @param predicate A function used to match each element.
 */
export function every<T>(source: Queryable<T>, predicate: (element: T) => boolean): boolean {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    let hasMatchingElements = false;
    for (const element of ToIterable(source)) {
        if (!predicate(element)) {
            return false;
        }
        hasMatchingElements = true;
    }
    return hasMatchingElements;
}

export { every as all }

/**
 * Computes the average of a sequence of numbers.
 *
 * @param source The sequence from which the average should be calculated.
 */
export function average(source: Queryable<number | undefined | null>): number | undefined;

/**
 * Computes the average of a sequence of elements after converting them to numbers.
 *
 * @param source The sequence from which the average should be calculated.
 * @param selector The function to use to convert each element to a number.
 */
export function average<T>(source: Queryable<T>, selector: (element: T) => number | undefined | null): number | undefined;

/**
 * Computes the average of a sequence of elements after converting them to numbers.
 *
 * @param source The sequence from which the average should be calculated.
 * @param selector The function to use to convert each element to a number.
 */
export function average<T>(source: Queryable<T>, selector: (element: T) => number | undefined | null = Identity): number | undefined {
    mustBeQueryable(source, "source");
    mustBeFunction(selector, "selector");
    let sum = 0;
    let count = 0;
    for (const element of ToIterable(source)) {
        const value = selector(element);
        if (value !== undefined && value !== null) {
            sum += +value;
            count++;
        }
    }
    return count > 0 ? sum / count : undefined;
}

/**
 * Computes the sum of a sequence of numbers.
 *
 * @param source The sequence from which the sum should be calculated.
 */
export function sum(source: Queryable<number | undefined | null>): number;

/**
 * Computes the sum of a sequence of elements after converting them to numbers.
 *
 * @param source The sequence from which the sum should be calculated.
 * @param selector The function to use to convert each element to a number.
 */
export function sum<T>(source: Queryable<T>, selector: (element: T) => number | undefined | null): number;

/**
 * Computes the sum of a sequence of elements after converting them to numbers.
 *
 * @param source The sequence from which the sum should be calculated.
 * @param selector The function to use to convert each element to a number.
 */
export function sum<T>(source: Queryable<T>, selector: (element: T) => number | undefined | null = Identity): number {
    mustBeQueryable(source, "source");
    mustBeFunction(selector, "selector");
    let sum = 0;
    for (const element of ToIterable(source)) {
        const value = selector(element);
        if (value !== undefined && value !== null) {
            sum += +value;
        }
    }
    return sum;
}

/**
 * Computes a scalar value indicating whether the corresponding elements in two sequences have the same values.
 *
 * @param first The first sequence.
 * @param second The second sequence.
 */
export function corresponds<T>(first: Queryable<T>, second: Queryable<T>): boolean;

/**
 * Computes a scalar value indicating whether the corresponding elements in two sequences have the same values.
 *
 * @param first The first sequence.
 * @param second The second sequence.
 * @param equalityComparison A function used to compare the equality of two elements.
 */
export function corresponds<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison: (first: T, second: U) => boolean): boolean;

/**
 * Computes a scalar value indicating whether the corresponding elements in two sequences have the same values.
 *
 * @param first The first sequence.
 * @param second The second sequence.
 * @param equalityComparison An optional function used to compare the equality of two elements.
 */
export function corresponds<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison: (first: T, second: U) => boolean = SameValue): boolean {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    mustBeFunction(equalityComparison, "equalityComparison");
    let firstIterator = GetIterator(ToIterable(first));
    try {
        let secondIterator = GetIterator(ToIterable(second));
        try {
            while (true) {
                const { value: firstValue, done: firstDone } = firstIterator.next();
                const { value: secondValue, done: secondDone } = secondIterator.next();
                if (firstDone) firstIterator = undefined;
                if (secondDone) secondIterator = undefined;
                if (firstDone && secondDone) return true;
                if (Boolean(firstDone) !== Boolean(secondDone) || !equalityComparison(firstValue, secondValue)) return false;
            }
        }
        finally {
            IteratorClose(secondIterator);
        }
    }
    finally {
        IteratorClose(firstIterator);
    }
}

export { corresponds as sequenceEquals }

/**
 * Computes a scalar value indicating whether the provided value is included in the sequence.
 *
 * @param source The source sequence.
 * @param value A value.
 */
export function includes<T>(source: Queryable<T>, value: T): boolean {
    mustBeQueryable(source, "source");
    for (const element of ToIterable(source)) {
        if (SameValue(value, element)) return true;
    }
    return false;
}

/**
 * Computes a scalar value indicating whether the first sequence includes
 * the exact sequence of elements from a second sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence which should be included in the first.
 */
export function includesSequence<T>(first: Queryable<T>, second: Queryable<T>): boolean;

/**
 * Computes a scalar value indicating whether the first sequence includes
 * the exact sequence of elements from a second sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence which should be included in the first.
 * @param equalityComparison A function used to compare the equality of two elements.
 */
export function includesSequence<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison: (first: T, second: U) => boolean): boolean;

/**
 * Computes a scalar value indicating whether the first sequence includes
 * the exact sequence of elements from a second sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence which should be included in the first.
 * @param equalityComparison An optional function used to compare the equality of two elements.
 */
export function includesSequence<T, U>(first: Queryable<T>, second: Iterable<U>, equalityComparison: (first: T, second: U) => boolean = SameValue): boolean {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    mustBeFunction(equalityComparison, "equalityComparison");
    const secondArray = Array.from(second);
    const numElements = secondArray.length;
    if (numElements <= 0) return true;
    const span: T[] = [];
    let leftIterator = GetIterator(ToIterable(first));
    try {
        while (true) {
            const { value: leftValue, done: leftDone } = leftIterator.next();
            if (leftDone) {
                leftIterator = undefined;
                return false;
            }
            while (true) {
                const rightValue = secondArray[span.length];
                if (equalityComparison(leftValue, rightValue)) {
                    if (span.length + 1 >= numElements) {
                        return true;
                    }
                    span.push(leftValue);
                }
                else if (span.length > 0) {
                    span.shift();
                    continue;
                }
                break;
            }
        }
    }
    finally {
        IteratorClose(leftIterator);
    }
}

/**
 * Computes a scalar value indicating whether the elements of a one sequence start
 * with the same sequence of elements of a another sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence whose elements should match the initial elements of `first`.
 */
export function startsWith<T>(first: Queryable<T>, second: Queryable<T>): boolean;

/**
 * Computes a scalar value indicating whether the elements of a one sequence start
 * with the same sequence of elements of a another sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence whose elements should match the initial elements of `first`.
 * @param equalityComparison A function used to compare the equality of two elements.
 */
export function startsWith<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison: (first: T, second: U) => boolean): boolean;

/**
 * Computes a scalar value indicating whether the elements of a one sequence start
 * with the same sequence of elements of a another sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence whose elements should match the initial elements of `first`.
 * @param equalityComparison An optional function used to compare the equality of two elements.
 */
export function startsWith<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison?: (first: T, second: U) => boolean): boolean {
    if (equalityComparison === undefined) equalityComparison = SameValue;
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    mustBeFunction(equalityComparison, "equalityComparison");
    let firstIterator = GetIterator(ToIterable(first));
    try {
        let secondIterator = GetIterator(ToIterable(second));
        try {
            while (true) {
                const { value: firstValue, done: firstDone } = firstIterator.next();
                const { value: secondValue, done: secondDone } = secondIterator.next();
                if (firstDone) firstIterator = undefined;
                if (secondDone) secondIterator = undefined;
                if (secondDone) return true;
                if (firstDone) return false;
                if (!equalityComparison(firstValue, secondValue)) return false;
            }
        }
        finally {
            IteratorClose(secondIterator);
        }
    }
    finally {
        IteratorClose(firstIterator);
    }
}

/**
 * Computes a scalar value indicating whether the elements of a one sequence end
 * with the same sequence of elements of a another sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence whose elements should match the final elements of `first`.
 */
export function endsWith<T>(first: Queryable<T>, second: Queryable<T>): boolean;

/**
 * Computes a scalar value indicating whether the elements of a one sequence end
 * with the same sequence of elements of a another sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence whose elements should match the final elements of `first`.
 * @param equalityComparison A function used to compare the equality of two elements.
 */
export function endsWith<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison: (first: T, second: U) => boolean): boolean;

/**
 * Computes a scalar value indicating whether the elements of a one sequence end
 * with the same sequence of elements of a another sequence.
 *
 * @param first The first sequence.
 * @param second The second sequence whose elements should match the final elements of `first`.
 * @param equalityComparison An optional function used to compare the equality of two elements.
 */
export function endsWith<T, U = T>(first: Queryable<T>, second: Queryable<U>, equalityComparison: (first: T, second: U) => boolean = SameValue): boolean {
    mustBeQueryable(first, "first");
    mustBeQueryable(second, "second");
    mustBeFunction(equalityComparison, "equalityComparison");
    const firstArray = Array.from(second);
    const numElements = firstArray.length;
    if (numElements <= 0) return true;
    const secondArray = toArray(takeRight(ToIterable(first), numElements));
    if (secondArray.length < numElements) return false;
    for (let i = 0; i < numElements; i++) {
        if (!equalityComparison(secondArray[i], firstArray[i])) return false;
    }
    return true;
}

/**
 * Finds the value in the sequence at the provided offset. A negative offset starts from the
 * last element.
 *
 * @param source A sequence.
 * @param offset An offset.
 */
export function elementAt<T>(source: Queryable<T>, offset: number): T | undefined {
    mustBeQueryable(source, "source");
    mustBeInteger(offset, "offset");
    if (offset === -1) return last(ToIterable(source));
    if (offset < 0) {
        offset = Math.abs(offset);
        const array: T[] = [];
        for (const element of ToIterable(source)) {
            if (array.length >= offset) array.shift();
            array.push(element);
        }
        return array.length - offset >= 0 ? array[array.length - offset] : undefined;
    }
    for (const element of ToIterable(source)) {
        if (offset === 0) return element;
        offset--;
    }
}

/**
 * Creates a tuple whose first element is a sequence containing the first span of
 * elements that match the supplied predicate, and whose second element is a sequence
 * containing the remaining elements.
 *
 * The first sequence is eagerly evaluated, while the second sequence is lazily
 * evaluated.
 *
 * @param source A sequence.
 * @param predicate The predicate used to match elements.
 */
export function spanWhile<T, U extends T = T>(source: Queryable<T>, predicate: (element: T) => element is U): [Iterable<U>, Iterable<T>];

/**
 * Creates a tuple whose first element is a sequence containing the first span of
 * elements that match the supplied predicate, and whose second element is a sequence
 * containing the remaining elements.
 *
 * The first sequence is eagerly evaluated, while the second sequence is lazily
 * evaluated.
 *
 * @param source A sequence.
 * @param predicate The predicate used to match elements.
 */
export function spanWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): [Iterable<T>, Iterable<T>];

/**
 * Creates a tuple whose first element is a sequence containing the first span of
 * elements that match the supplied predicate, and whose second element is a sequence
 * containing the remaining elements.
 *
 * The first sequence is eagerly evaluated, while the second sequence is lazily
 * evaluated.
 *
 * @param source A sequence.
 * @param predicate The predicate used to match elements.
 */
export function spanWhile<T>(source: Queryable<T>, predicate: (element: T) => boolean): [Iterable<T>, Iterable<T>] {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    const prefix: T[] = [];
    let iterator = GetIterator(ToIterable(source));
    try {
        while (true) {
            const { value, done } = iterator.next();
            if (done) {
                iterator = undefined;
                break;
            }
            if (!predicate(value)) {
                const remaining = new PrependIterable(value, new ConsumeIterable(iterator));
                iterator = undefined;
                return [prefix, remaining];
            }
            prefix.push(value);
        }
    }
    finally {
        IteratorClose(iterator);
    }
    return [prefix, new EmptyIterable<T>()];
}

export { spanWhile as span }

/**
 * Creates a tuple whose first element is a sequence containing the first span of
 * elements that do not match the supplied predicate, and whose second element is a sequence
 * containing the remaining elements.
 *
 * The first sequence is eagerly evaluated, while the second sequence is lazily
 * evaluated.
 *
 * @param source A sequence.
 * @param predicate The predicate used to match elements.
 */
export function spanUntil<T>(source: Queryable<T>, predicate: (element: T) => boolean): [Iterable<T>, Iterable<T>] {
    mustBeQueryable(source, "source");
    mustBeFunction(predicate, "predicate");
    const prefix: T[] = [];
    let iterator = GetIterator(ToIterable(source));
    try {
        while (true) {
            const { value, done } = iterator.next();
            if (done) {
                iterator = undefined;
                break;
            }
            if (predicate(value)) {
                const remaining = new PrependIterable(value, new ConsumeIterable(iterator));
                iterator = undefined;
                return [prefix, remaining];
            }
            prefix.push(value);
        }
    }
    finally {
        IteratorClose(iterator);
    }
    return [prefix, new EmptyIterable<T>()];
}

export { spanUntil as break }

/**
 * Invokes a function for each element of a sequence.
 *
 * @param source A sequence.
 * @param callback The function to invoke.
 */
export function forEach<T>(source: Queryable<T>, callback: (element: T, offset: number) => void): void {
    mustBeQueryable(source, "source");
    mustBeFunction(callback, "callback");
    let offset = 0;
    for (const element of ToIterable(source)) {
        callback(element, offset++);
    }
}

/**
 * Iterates over all of the elements in a sequence, ignoring the results.
 *
 * @param source A sequence.
 */
export function drain<T>(source: Queryable<T>): void {
    mustBeQueryable(source, "source");
    for (const element of ToIterable(source)) ;
}

/**
 * Creates an Array for the elements of a sequence.
 *
 * @param source A sequence.
 */
export function toArray<T>(source: Queryable<T>): T[];

/**
 * Creates an Array for the elements of a sequence.
 *
 * @param source A sequence.
 * @param elementSelector A function that selects a value for each element.
 */
export function toArray<T, V = T>(source: Queryable<T>, elementSelector: (element: T) => V): V[];

/**
 * Creates an Array for the elements of a sequence.
 *
 * @param source A sequence.
 * @param elementSelector An optional function that selects a value for each element.
 */
export function toArray<T, V = T>(source: Queryable<T>, elementSelector: (element: T) => V = Identity): V[] {
    mustBeQueryable(source, "source");
    mustBeFunction(elementSelector, "elementSelector");
    return Array.from<T, V>(ToIterable(source), elementSelector);
}

/**
 * Creates a Set for the elements of a sequence.
 *
 * @param source A sequence.
 */
export function toSet<T>(source: Queryable<T>): Set<T>;

/**
 * Creates a Set for the elements of a sequence.
 *
 * @param source A sequence.
 * @param elementSelector A function that selects a value for each element.
 */
export function toSet<T, V = T>(source: Queryable<T>, elementSelector: (element: T) => V): Set<V>;

/**
 * Creates a Set for the elements of a sequence.
 *
 * @param source A sequence.
 * @param elementSelector An optional function that selects a value for each element.
 */
export function toSet<T, V = T>(source: Queryable<T>, elementSelector: (element: T) => V = Identity): Set<V> {
    mustBeQueryable(source, "source");
    mustBeFunction(elementSelector, "elementSelector");
    const set = new Set<V>();
    for (const item of ToIterable(source)) {
        const element = elementSelector(item);
        set.add(element);
    }
    return set;
}

/**
 * Creates a Map for the elements of a sequence.
 *
 * @param source A sequence.
 * @param keySelector A function used to select a key for each element.
 */
export function toMap<T, K>(source: Queryable<T>, keySelector: (element: T) => K): Map<K, T>;

/**
 * Creates a Map for the elements of a sequence.
 *
 * @param source A sequence.
 * @param keySelector A function used to select a key for each element.
 * @param elementSelector A function that selects a value for each element.
 */
export function toMap<T, K, V = T>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Map<K, V>;

/**
 * Creates a Map for the elements of a sequence.
 *
 * @param source A sequence.
 * @param keySelector A function used to select a key for each element.
 * @param elementSelector An optional function that selects a value for each element.
 */
export function toMap<T, K, V = T>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity): Map<K, V> {
    mustBeQueryable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(elementSelector, "elementSelector");
    const map = new Map<K, V>();
    for (const item of ToIterable(source)) {
        const key = keySelector(item);
        const element = elementSelector(item);
        map.set(key, element);
    }
    return map;
}

/**
 * Creates a Lookup for the elements of a sequence.
 *
 * @param source A sequence.
 * @param keySelector A function used to select a key for each element.
 */
export function toLookup<T, K>(source: Queryable<T>, keySelector: (element: T) => K): Lookup<K, T>;

/**
 * Creates a Lookup for the elements of a sequence.
 *
 * @param source A sequence.
 * @param keySelector A function used to select a key for each element.
 * @param elementSelector A function that selects a value for each element.
 */
export function toLookup<T, K, V = T>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V): Lookup<K, V>;

/**
 * Creates a Lookup for the elements of a sequence.
 *
 * @param source A sequence.
 * @param keySelector A function used to select a key for each element.
 * @param elementSelector An optional function that selects a value for each element.
 */
export function toLookup<T, K, V = T>(source: Queryable<T>, keySelector: (element: T) => K, elementSelector: (element: T) => V = Identity): Lookup<K, V> {
    mustBeQueryable(source, "source");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(elementSelector, "elementSelector");
    const map = CreateGroupings(ToIterable(source), keySelector, elementSelector);
    return new Lookup<K, V>(map);
}

/**
 * Creates an Object for the elements of a sequence.
 *
 * @param prototype The prototype for the object.
 * @param keySelector A function used to select a key for each element.
 */
export function toObject<T>(source: Queryable<T>, prototype: object | null, keySelector: (element: T) => string | symbol): any;

/**
 * Creates an Object for the elements of a sequence.
 *
 * @param prototype The prototype for the object.
 * @param keySelector A function used to select a key for each element.
 * @param elementSelector A function that selects a value for each element.
 */
export function toObject<T, V = T>(source: Queryable<T>, prototype: object | null, keySelector: (element: T) => string | symbol, elementSelector: (element: T) => V): any;

/**
 * Creates an Object for the elements of a sequence.
 *
 * @param prototype The prototype for the object.
 * @param keySelector A function used to select a key for each element.
 * @param elementSelector An optional function that selects a value for each element.
 */
export function toObject<T, V = T>(source: Queryable<T>, prototype: object | null, keySelector: (element: T) => string | symbol, elementSelector: (element: T) => V = Identity): any {
    mustBeQueryable(source, "source");
    mustBeObjectOrNull(prototype, "prototype");
    mustBeFunction(keySelector, "keySelector");
    mustBeFunction(elementSelector, "elementSelector");
    const obj = Object.create(prototype);
    for (const item of ToIterable(source)) {
        const key = keySelector(item);
        const element = elementSelector(item);
        obj[key] = element;
    }
    return obj;
}