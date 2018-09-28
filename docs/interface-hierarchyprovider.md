[Back to Index][Index] | [Interface: HierarchyIterable][HierarchyIterable]



### In This Section
* [Interface: HierarchyProvider][HierarchyProvider]
    * [provider.owns?(element)][HierarchyProvider#owns]
    * [provider.parent(element)][HierarchyProvider#parent]
    * [provider.children(element)][HierarchyProvider#children]



# Interface: HierarchyProvider

Describes an object that defines the relationships between parents and children of an element.

```ts
export interface HierarchyProvider<TNode> {
    owns?(element: TNode): boolean;
    parent(element: TNode): TNode | undefined;
    children(element: TNode): Queryable<TNode> | undefined;
}
```

* Type Parameters:
  * <a name="tnode"></a><samp>TNode</samp> &mdash; The type for each element.



## provider.owns?(element)

If present, is used to determine whether an element belongs to the hierarchy.

```ts
export interface HierarchyProvider<TNode> {
    owns(element: TNode): boolean;
}
```

* Parameters:
  * `element` <samp>[TNode][]</samp> &mdash; The current element.
* Returns: <samp>`boolean`</samp> &mdash; Should return `true` if the element is contained within the hierarchy; otherwise, `false`.



## provider.parent(element)

Gets the parent element for the supplied element.

```ts
export interface HierarchyProvider<TNode> {
    parent(element: TNode): TNode | undefined;
}
```

* Parameters:
  * `element` <samp>[TNode][]</samp> &mdash; The current element.
* Returns: <samp>[TNode][] | `undefined`</samp> &mdash; The parent of `element` if present, or `undefined`.



## provider.children(element)
Gets the children elements for the supplied element.

```ts
export interface HierarchyProvider<TNode> {
    children(element: TNode): Queryable<TNode> | undefined;
}
```

* Parameters:
  * `element` <samp>[TNode][]</samp> &mdash; The current element.
* Returns: <samp>[Queryable][]&lt;[TNode][]&gt; | `undefined`</samp> &mdash; The children of `element` if present, or an empty sequence.



[HierarchyProvider]: #interface-hierarchyprovider
[HierarchyProvider#owns]: #providerownselement
[HierarchyProvider#parent]: #providerparentelement
[HierarchyProvider#children]: #providerchildrenelement
[TNode]: #tnode
[Index]: iterable-query.md
[Queryable]: type-queryable.md
[HierarchyIterable]: interface-hierarchyiterable.md