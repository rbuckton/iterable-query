[Back to Index](#index.md)



### In This Section

* [Interface: Hierarchical](#interface-hierarchical)
    * [Hierarchical.hierarchy](#hierarchicalhierarchy)
    * [hierarchical\[Hierarchical.hierarchy\]()](#hierarchicalhierarchicalhierarchy)



# Interface: Hierarchical
Describes an object that has an inherent hierarchy.

```ts
export namespace Hierarchical {
    const hierarchy: unique symbol;
}

export interface Hierarchical<TNode> {
    [Hierarchical.hierarchy](): HierarchyProvider<TNode>;
}
```

* Type Parameters:
  * <a name="hierarchical-tnode"></a><samp>TNode</samp> &mdash; The base type for each element in the hierarchy.



## Hierarchical.hierarchy
A [Symbol][] used to as a unique method name on a [Hierarchical](#interface-hierarchical) object.

```ts
export namespace Hierarchical {
    const hierarchy: unique symbol;
}
```



## hierarchical[Hierarchical.hierarchy]()
Gets the [HierarchyProvider](#interface-hierarchyprovider) associated with this [Hierarchical](#interface-hierarchical) object.

```ts
export interface Hierarchical<TNode> {
    [Hierarchical.hierarchy](): HierarchyProvider<TNode>;
}
```

* Parameters: _none_.
* Returns: <samp>[HierarchyProvider](interface-hierarchyprovider.md)&lt;[TNode](#hierarchical-tnode)&gt; | `undefined`</samp> &mdash; An object that describes the associated hierarchy.


[Symbol]: http://ecma-international.org/ecma-262/6.0/index.html#sec-symbol-constructor
