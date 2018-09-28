[Back to Index](index.md)



### In This Section
* [Interface: AsyncHierarchyIterable](#interface-asynchierarchyiterable)



# Interface: AsyncHierarchyIterable

Describes an object that is both [AsyncIterable][] and [Hierarchical](interface-hierarchical.md).

```ts
export interface AsyncHierarchyIterable<TNode, T extends TNode = T> extends AsyncIterable<T>, Hierarchical<TNode> {
}
```

* Type Parameters:
  * <a name="hierarchyiterable-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
  * <a name="hierarchyiterable-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [AsyncIterable][]
    * AsyncHierarchyIterable
* [Hierarchical](interface-hierarchical.md)
    * AsyncHierarchyIterable



[AsyncIterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.asynciterator