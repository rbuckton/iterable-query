[Back to Index](index.md)



### In This Section
* [Interface: AsyncOrderedHierarchyIterable](#interface-asyncorderedhierarchyiterable)



# Interface: AsyncOrderedHierarchyIterable

Describes an object that is both an [AsyncOrderedIterable](interface-asyncorderediterable.md) and an [AsyncHierarchyIterable](interface-asynchierarchyiterable.md).

```ts
export interface AsyncOrderedHierarchyIterable<TNode, T extends TNode = T> extends AsyncOrderedIterable<T>, AsyncHierarchyIterable<TNode, T> {
}
```

* Type Parameters:
  * <a name="asyncorderedhierarchyiterable-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
  * <a name="asyncorderedhierarchyiterable-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [AsyncIterable][]
    * [AsyncOrderedIterable](interface-asyncorderediterable.md)
        * AsyncOrderedHierarchyIterable
    * [AsyncHierarchyIterable](interface-asynchierarchyiterable.md)
        * AsyncOrderedHierarchyIterable
* [Hierarchical](interface-hierarchical.md)
    * [AsyncHierarchyIterable](interface-asynchierarchyiterable.md)
        * AsyncOrderedHierarchyIterable



[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator