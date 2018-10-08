import "../augmentations";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { ComponentHost, Option } from "typedoc/dist/lib/utils/component";
import { Reflection, ReflectionKind, ParameterReflection } from "typedoc/dist/lib/models";
import { GroupPlugin } from "typedoc/dist/lib/converter/plugins";
import { ParameterType } from "typedoc/dist/lib/utils/options/declaration";

let enableRename = false;

// Rename "Module" to "Namespace"
// Rename "External Module" to "Module"
const savedGetKindSingular = GroupPlugin.getKindSingular;
GroupPlugin.getKindSingular = function (kind) {
    if (enableRename) {
        if (kind === ReflectionKind.Module) return "Namespace";
        if (kind === ReflectionKind.ExternalModule) return "Module";
    }
    return savedGetKindSingular.call(GroupPlugin, kind);
};

// Rename "Modules" to "Namespaces"
// Rename "External Modules" to "Modules"
const savedGetKindPlural = GroupPlugin.getKindPlural;
GroupPlugin.getKindPlural = function (kind) {
    if (enableRename) {
        if (kind === ReflectionKind.Module) return "Namespaces";
        if (kind === ReflectionKind.ExternalModule) return "Modules";
    }
    return savedGetKindPlural.call(GroupPlugin, kind);
};

@Component({ name: "naming" })
export class NamingPlugin extends ConverterComponent {
    @Option({
        name: "renameModuleToNamespace",
        help: "Replaces 'Module' with 'Namespace' and 'External module' with 'Module' in documentation output.",
        type: ParameterType.Boolean
    })
    renameModuleToNamespace!: boolean;

    private reflectionsToRemove!: Set<Reflection>;

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, Converter.EVENT_BEGIN, this.onBegin);
        this.listenTo(this.owner, Converter.EVENT_END, this.onEnd);
        this.listenTo(this.owner, Converter.EVENT_CREATE_DECLARATION, this.onCreateDeclaration);
        this.listenTo(this.owner, Converter.EVENT_CREATE_PARAMETER, this.onCreateParameter);
    }

    private onBegin() {
        enableRename = this.renameModuleToNamespace;
        this.reflectionsToRemove = new Set();
    }

    private onEnd(context: Context) {
        context.removeReflections(this.reflectionsToRemove);
        this.reflectionsToRemove = undefined!;
        enableRename = false;
    }

    private onCreateDeclaration(context: Context, reflection: Reflection, node: ts.Node | undefined) {
        // rename built-in symbols
        const match = /^__@(\w+)$/.exec(reflection.name);
        if (match) {
            context.updateReflection(reflection, { name: `[Symbol.${match[1]}]` });
        }

        // rename computed properties
        if (reflection.kindOf(ReflectionKind.ClassMember) && reflection.name === "__computed" && node && ts.isDeclaration(node)) {
            const name = ts.getNameOfDeclaration(node);
            const symbol = name && context.checker.getSymbolAtLocation(name); // get the late-bound symbol
            if (name || symbol) {
                context.updateReflection(reflection, {
                    name: symbol
                        ? context.checker.symbolToString(symbol, /*node*/ undefined, ts.SymbolFlags.ClassMember)
                        : node.getText()
                });
            }
            else {
                this.reflectionsToRemove.add(reflection);
            }
        }
    }

    private onCreateParameter(context: Context, parameter: ParameterReflection, node: ts.ParameterDeclaration | undefined) {
        if (node && (ts.isObjectBindingPattern(node.name) || ts.isArrayBindingPattern(node.name)) && parameter.type) {
            parameter.type = context.converter.convertType(context, node.type, context.getTypeAtLocation(node));
        }
    }
}