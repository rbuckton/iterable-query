[Back to Index](index.md)



### In This Section
* [Interface: HierarchyIterable](#interface-hierarchyiterable)



# Interface: HierarchyIterable

Describes an object that is both [Iterable][] and [Hierarchical](interface-hierarchical.md).

```ts
export interface HierarchyIterable<TNode, T extends TNode = T> extends Iterable<T>, Hierarchical<TNode> {
}
```

* Type Parameters:
  * <a name="hierarchyiterable-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
  * <a name="hierarchyiterable-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [Iterable][]
    * HierarchyIterable
* [Hierarchical](interface-hierarchical.md)
    * HierarchyIterable



[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator