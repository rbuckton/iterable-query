[Back to Index](#index.md)



### In This Section

* [Interface: OrderedIterable](#interface-orderediterable)
    * [OrderedIterable.thenBy](#orderediterablethenby)
    * [iterable\[OrderedIterable.thenBy\](keySelector, comparison, descending)](#iterableorderediterablethenbykeyselector-comparison-descending)



# Interface: OrderedIterable
Describes an [Iterable][] object that has an inherent order.

```ts
export namespace OrderedIterable {
    const thenBy: unique symbol;
}

export interface OrderedIterable<T> extends Iterable<T> {
    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedIterable<T>;
}
```

* Type Parameters:
  * <a name="orderediterable-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [Iterable][]
    * OrderedIterable



## OrderedIterable.thenBy
A [Symbol][] used as a unique method name on an [OrderedIterable](#interface-orderediterable) object.

```ts
export namespace OrderedIterable {
    const thenBy: unique symbol;
}
```



## iterable[OrderedIterable.thenBy](keySelector, comparison, descending)
Creates a subsequent [OrderedIterable](#interface-orderediterable) whose elements are also ordered by the provided key.

```ts
export interface OrderedIterable<T> {
    [OrderedIterable.thenBy]<K>(keySelector: (element: T) => K, comparison: (x: K, y: K) => number, descending: boolean): OrderedIterable<T>;
}
```

* Parameters:
  * `keySelector` <samp>[Function][]</samp> &mdash; A callback used to select the key for an element.
  * `comparison` <samp>[Function][]</samp> &mdash; A callback used to compare two keys.
  * `descending` <samp>[Boolean][]</samp> &mdash; A value indicating whether to sort in descending (`true`) or ascending (`false`) order.
* Returns: <samp>[OrderedIterable](#interface-orderediterable)&lt;[T](#orderediterable-t)&gt;</samp>
* Type Parameters:
    * <samp>K</samp> &mdash; The type for the key for each element.



[Function]: http://ecma-international.org/ecma-262/6.0/index.html#sec-function-constructor
[Symbol]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol-constructor
[Boolean]: http://ecma-international.org/ecma-262/6.0/index.html#sec-boolean-constructor
[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator