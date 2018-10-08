import "source-map-support/register";
import "../augmentations";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component } from "typedoc/dist/lib/utils";
import { ConverterNodeComponent } from "typedoc/dist/lib/converter/components";
import { ComponentHost } from "typedoc/dist/lib/utils/component";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { ReflectionKind } from "typedoc";
import { createDeclaration } from "typedoc/dist/lib/converter/factories";
import { ExportBinding } from "../model/exportBinding";

@Component({ name: "node:exportdeclaration" })
export class ExportDeclarationConverter extends ConverterNodeComponent<ts.ExportDeclaration> {
    supports: ts.SyntaxKind[];

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
        this.supports = [ts.SyntaxKind.ExportDeclaration];
    }

    convert(context: Context, node: ts.ExportDeclaration) {
        if (node.exportClause) {
            for (const specifier of node.exportClause.elements) {
                const exportedName = ts.unescapeLeadingUnderscores(specifier.name.escapedText);
                const localName = specifier.propertyName ? ts.unescapeLeadingUnderscores(specifier.propertyName.escapedText) : exportedName;
                const symbol = getTargetSymbol(context, context.checker.getExportSpecifierLocalTargetSymbol(specifier));
                // const kind = !symbol ? ReflectionKind.Variable :
                //     symbol.flags & ts.SymbolFlags.Function ? ReflectionKind.Function :
                //     symbol.flags & ts.SymbolFlags.Class ? ReflectionKind.Class :
                //     symbol.flags & ts.SymbolFlags.Interface ? ReflectionKind.Interface :
                //     symbol.flags & ts.SymbolFlags.Enum ? ReflectionKind.Enum :
                //     symbol.flags & ts.SymbolFlags.TypeAlias ? ReflectionKind.TypeAlias :
                //     symbol.flags & ts.SymbolFlags.Variable ? ReflectionKind.Variable :
                //     // symbol.flags & ts.SymbolFlags.Module ? ReflectionKind.Module :
                //     ReflectionKind.Variable;
                const kind = ReflectionKind.Export;
                const reflection = createDeclaration(context, specifier, kind, exportedName);
                if (reflection) {
                    reflection.exportOf = new ExportBinding(localName, symbol && context.getSymbolID(symbol));
                }
            }
        }
        return context.scope;
    }
}

function getTargetSymbol(context: Context, symbol: ts.Symbol | undefined) {
    return symbol && symbol.flags & ts.SymbolFlags.Alias ? context.checker.getAliasedSymbol(symbol) : symbol;
}