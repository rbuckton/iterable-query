[Back to Index](#index.md)



### In This Section

* [Interface: Grouping](#interface-grouping)
    * [grouping.key](#groupingkey)
* [Interface: HierarchyGrouping](#interface-hierarchygrouping)



# Interface: Grouping
A group of values related by the same key.

```ts
export interface Grouping<K, V> extends Iterable<V> {
    readonly key: K;
}
```

* Type Parameters:
    * <a name="grouping-k"></a><samp>K</samp> &mdash; The type for the group's key.
    * <samp>V</samp> &mdash; The type for each element in the group.

### Inheritance hierarchy
* [Iterable][]
  * Grouping



## group.key
Gets the key for the group.

```ts
export interface Grouping<K, V> extends Iterable<V> {
    readonly key: K;
}
```

* Returns: <samp>[K](#grouping-k)</samp>



# Interface: HierarchyGrouping
A group of values with an inherent hierarchy related by the same key.

```ts
export interface HierarchyGrouping<K, VNode, V extends VNode = VNode> extends Grouping<K, V>, HierarchyIterable<VNode, V> {
}
```

* Type Parameters:
    * <a name="hierarchygrouping-k"></a><samp>K</samp> &mdash; The type for the group's key.
    * <a name="hierarchygrouping-vnode"></a><samp>VNode</samp> &mdash; The base type for each element in the hierarchy.
    * <a name="hierarchygrouping-v"></a><samp>V</samp> &mdash; The type for each element in the group.

### Inheritance hierarchy
* [Iterable][]
  * [Grouping](#interface-grouping)
    * HierarchyGrouping
  * [HierarchyIterable](interface-hierarchyiterable.md)
    * HierarchyGrouping
* [Hierarchical](#interface-hierarchical)
  * [HierarchyIterable](interface-hierarchyiterable.md)
    * HierarchyGrouping



[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator