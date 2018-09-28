[Back to Index](#index.md)



### In This Section

* [Interface: AsyncOrderedIterable](#interface-asyncorderediterable)
    * [AsyncOrderedIterable.thenBy](#asyncorderediterablethenby)
    * [iterable\[AsyncOrderedIterable.thenBy\](keySelector, comparison, descending)](#iterableasyncorderediterablethenbykeyselector-comparison-descending)



# Interface: AsyncOrderedIterable
Describes an [AsyncIterable][] object that has an inherent order.

```ts
export namespace AsyncOrderedIterable {
    const thenBy: unique symbol;
}

export interface AsyncOrderedIterable<T> extends AsyncIterable<T> {
    [AsyncOrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T>;
}
```

* Type Parameters:
  * <a name="asyncorderediterable-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [AsyncIterable][]
    * AsyncOrderedIterable



## AsyncOrderedIterable.thenBy
A [Symbol][] used as a unique method name on an [AsyncOrderedIterable](#interface-asyncorderediterable) object.

```ts
export namespace AsyncOrderedIterable {
    const thenBy: unique symbol;
}
```



## iterable[AsyncOrderedIterable.thenBy](keySelector, comparison, descending)
Creates a subsequent [AsyncOrderedIterable](#interface-asyncorderediterable) whose elements are also ordered by the provided key.

```ts
export interface AsyncOrderedIterable<T> {
    [AsyncOrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): AsyncOrderedIterable<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; A callback used to compare two keys.
  * `descending` <samp>[Boolean][]</samp> &mdash; A value indicating whether to sort in descending (`true`) or ascending (`false`) order.
* Returns: <samp>[AsyncOrderedIterable](#interface-asyncorderediterable)&lt;[T](#asyncorderediterable-t)&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



[AsyncIterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.asynciterator
[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Symbol]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor