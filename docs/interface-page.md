[Back to Index](#index.md)



### In This Section

* [Interface: Page](#interface-page)
    * [page.page](#pagepage)
    * [page.offset](#pageoffset)
* [Interface: HierarchyPage](#interface-hierarchypage)



# Interface: Page
Represents a page of results.

```ts
export interface Page<T> extends Iterable<T> {
    readonly page: number;
    readonly offset: number;
}
```

* Type Parameters:
    * <samp>T</samp> &mdash; The type for each element in the page.

### Inheritance hierarchy
* [Iterable][]
  * Page



## page.page
Gets the page number (zero-based).

```ts
export interface Page<T> extends Iterable<T> {
    readonly page: number;
}
```

* Returns: <samp>[Number][]</samp>



## page.offset
Gets the offset in the source at which the page begins (zero-based).

```ts
export interface Page<T> extends Iterable<T> {
    readonly offset: number;
}
```

* Returns: <samp>[Number][]</samp>



# Interface: HierarchyPage
Represents a page of results with an inherent hierarchy.

```ts
export interface HierarchyPage<TNode, T extends TNode = TNode> extends Page<T>, HierarchyIterable<TNode, T> {
}
```

* Type Parameters:
    * <a name="hierarchypage-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.
    * <a name="hierarchypage-t"></a><samp>T</samp> &mdash; The type for each element in the page.

### Inheritance hierarchy
* [Iterable][]
  * [Page](#interface-page)
    * HierarchyPage
  * [HierarchyIterable](interface-hierarchyiterable.md)
    * HierarchyPage
* [Hierarchical](#interface-hierarchical)
  * [HierarchyIterable](interface-hierarchyiterable.md)
    * HierarchyPage



[Iterable]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol.iterator
[Number]: http://ecma-international.org/ecma-262/6.0/index.html#sec-number-constructor
