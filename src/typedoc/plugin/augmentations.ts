import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { DeclarationReflection, ReflectionKind } from "typedoc/dist/lib/models";
import { CategoryPlugin } from "typedoc/dist/lib/converter/plugins";
import { ReflectionCategory } from "typedoc/dist/lib/models/ReflectionCategory";
import { ExportBinding } from "./model/exportBinding";

declare module "typedoc/node_modules/typescript/lib/typescript" {
    interface Node {
        symbol?: ts.Symbol;
    }
    interface TypeChecker {
        getMergedSymbol(symbol: ts.Symbol): ts.Symbol;
        resolveName(name: string, location: ts.Node | undefined, meaning: ts.SymbolFlags, excludeGlobals: boolean): ts.Symbol | undefined;
    }
    function isDeclaration(node: ts.Node): node is ts.NamedDeclaration;
    function escapeLeadingUnderscores(identifier: string): ts.__String;
}

// patch ReflectionCategory to indicate whether it is the uncategorized category.
declare module "typedoc/dist/lib/models/ReflectionCategory" {
    interface ReflectionCategory {
        isUncategorized?: boolean;
    }
}

// patch ReflectionGroup to support categories
declare module "typedoc/dist/lib/models/ReflectionGroup" {
    interface ReflectionGroup {
        categories?: ReflectionCategory[];
    }
}

// patch ReflectionKind to add `Export` and `ModuleMember`
declare module "typedoc/dist/lib/models/reflections/abstract" {
    interface Reflection {
        urlTarget?: string;
    }
    enum ReflectionKind {
        Export = 16777216,
        ModuleMember = Class | Interface | Function | Enum | Variable | Module | TypeAlias | Export,
        ClassMember = Accessor | Constructor | Method | Property | Event,
    }
}
(function (ReflectionKind: any) {
    const exportKind = 16777216;
    const moduleMemberKind =
        ReflectionKind.Class |
        ReflectionKind.Interface |
        ReflectionKind.Function |
        ReflectionKind.Enum |
        ReflectionKind.Variable |
        ReflectionKind.Module |
        ReflectionKind.TypeAlias |
        ReflectionKind.Export;
    const classMemberKind = 
        ReflectionKind.Accessor |
        ReflectionKind.Constructor |
        ReflectionKind.Method |
        ReflectionKind.Property |
        ReflectionKind.Event;
    ReflectionKind[ReflectionKind["Export"] = exportKind] = "Export";
    ReflectionKind[ReflectionKind["ModuleMember"] = moduleMemberKind] = "ModuleMember";
    ReflectionKind[ReflectionKind["ClassMember"] = classMemberKind] = "ClassMember";
})(ReflectionKind);

// patch DeclarationReflection and CategoryPlugin to support `exportOf`
declare module "typedoc/dist/lib/models/reflections/declaration" {
    interface DeclarationReflection {
        exportOf?: ExportBinding;
    }
}
declare module "typedoc/dist/lib/models/reflections/signature" {
    interface SignatureReflection {
        exportOf?: ExportBinding;
    }
}
{
    const savedToObject = DeclarationReflection.prototype.toObject;
    DeclarationReflection.prototype.toObject = function () {
        const result = savedToObject.call(this);
        if (this.exportOf) result.exportOf = this.exportOf.toObject();
        return result;
    };

    const savedGetCategory = CategoryPlugin.getCategory;
    CategoryPlugin.getCategory = function (reflection) {
        if (!reflection.comment &&
            reflection instanceof DeclarationReflection &&
            reflection.exportOf &&
            reflection.exportOf.reflection &&
            reflection.exportOf.reflection !== reflection) {
            return this.getCategory(reflection.exportOf.reflection);
        }
        return savedGetCategory.call(this, reflection);
    };
}