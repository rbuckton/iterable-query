import "../augmentations";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { ComponentHost } from "typedoc/dist/lib/utils/component";
import { Reflection, ReflectionKind, DeclarationReflection } from "typedoc/dist/lib/models";
import { ModuleConverter } from "typedoc/dist/lib/converter/nodes";

// patch ModuleConverter#convert to support inheritance (due to modules merging with classes)
const savedConvert = ModuleConverter.prototype.convert;
ModuleConverter.prototype.convert = function (context, node) {
    if (context.isInherit && context.inheritParent === node) {
        const reflection = <DeclarationReflection>context.scope;
        context.withScope(reflection, () => {
            if (node.body) {
                this.owner.convertNode(context, node.body);
            }
        });
        return reflection;
    }
    return savedConvert.call(this, context, node);
};

@Component({ name: "merge" })
export class MergePlugin extends ConverterComponent {
    private reflectionsToRemove!: Set<Reflection>;

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, Converter.EVENT_BEGIN, this.onBegin);
        this.listenTo(this.owner, Converter.EVENT_CREATE_DECLARATION, this.onCreateDeclaration);
        this.listenTo(this.owner, Converter.EVENT_END, this.onEnd);
    }

    private onBegin() {
        this.reflectionsToRemove = new Set();
    }

    private onEnd(context: Context) {
        context.removeReflections(this.reflectionsToRemove);
        this.reflectionsToRemove = undefined!;
    }

    private onCreateDeclaration(_context: Context, reflection: DeclarationReflection, node: ts.Node | undefined) {
        if (!node) return;

        // typedoc incorrectly chooses "Module" as the reflection for an interface
        // that merges with a module, resulting in "Module Foo<T>" in output documentation.
        if (reflection.kindOf(ReflectionKind.Module) &&
            node.symbol &&
            node.symbol.flags & ts.SymbolFlags.Interface) {
            reflection.kind = ReflectionKind.Interface;
        }

        // typedoc incorrectly merges type parameters when merging classes and interfaces.
        if (reflection.kindOf(ReflectionKind.Class)) {
            if (reflection.typeParameters) {
                const typeParameterNames = new Set<string>();
                for (const typeParameter of reflection.typeParameters) {
                    if (typeParameterNames.has(typeParameter.name)) {
                        this.reflectionsToRemove.add(typeParameter);
                    }
                    else {
                        typeParameterNames.add(typeParameter.name);
                    }
                }
            }
        }
    }
}