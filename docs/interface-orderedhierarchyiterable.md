[Back to Index](index.md)



### In This Section
* [Interface: OrderedHierarchyIterable](#interface-orderedhierarchyiterable)



# Interface: OrderedHierarchyIterable

Describes an object that is both an [OrderedIterable](interface-orderediterable.md) and a [HierarchyIterable](interface-hierarchyiterable.md).

```ts
export interface OrderedHierarchyIterable<TNode, T extends TNode = T> extends OrderedIterable<T>, HierarchyIterable<TNode, T> {
}
```

* Type Parameters:
  * <a name="orderedhierarchyiterable-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
  * <a name="orderedhierarchyiterable-t"></a><samp>T</samp> &mdash; The type for each element in the iterable.

### Inheritance hierarchy
* [Iterable][]
    * [OrderedIterable](interface-orderediterable.md)
        * OrderedHierarchyIterable
    * [HierarchyIterable](interface-hierarchyiterable.md)
        * OrderedHierarchyIterable
* [Hierarchical](interface-hierarchical.md)
    * [HierarchyIterable](interface-hierarchyiterable.md)
        * OrderedHierarchyIterable

[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator