import * as path from "path";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component } from "typedoc/dist/lib/output/components";
import { Option } from "typedoc/dist/lib/utils";
import { ParameterType, ParameterHint } from "typedoc/dist/lib/utils/options/declaration";
import { ConverterComponent } from "typedoc/dist/lib/converter/components";
import { ComponentHost } from "typedoc/dist/lib/utils/component";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { DeclarationReflection, ReflectionKind, ReflectionFlag } from "typedoc";

export interface Biblio {
    [key: string]: string;
}

@Component({ name: "biblio" })
export class BiblioPlugin extends ConverterComponent {
    @Option({
        name: "biblio",
        help: "The path to a biblio JSON file, or a biblio object.",
        type: ParameterType.Mixed
    })
    biblio?: string | Biblio;

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, Converter.EVENT_RESOLVE_BEGIN, this.onResolveBegin);
    }

    private onResolveBegin(context: Context) {
        const biblio = typeof this.biblio === "string" ? this.loadBiblio(this.biblio) : this.biblio;
        if (!biblio) return;

        const checker = context.checker;
        for (const key in biblio) {
            createBiblioReflection(key, biblio[key]);
        }

        function createBiblioReflection(name: string, url: string) {
            const symbol = checker.resolveName(name, undefined, ts.SymbolFlags.Type, false);
            if (symbol) {
                for (const node of symbol.declarations) {
                    const kind = 
                        ts.isInterfaceDeclaration(node) ? ReflectionKind.Interface :
                        ts.isClassDeclaration(node) ? ReflectionKind.Class :
                        ts.isEnumDeclaration(node) ? ReflectionKind.Enum :
                        ts.isModuleDeclaration(node) ? ts.isStringLiteral(node.name) ? ReflectionKind.ExternalModule : ReflectionKind.Module :
                        ts.isTypeAliasDeclaration(node) ? ReflectionKind.TypeAlias :
                        ts.isVariableDeclaration(node) ? ReflectionKind.Variable :
                        undefined;
                    if (kind === undefined) continue;
                    const reflection = new DeclarationReflection(context.project, name, kind);
                    context.registerReflection(reflection, node, symbol);
                    context.trigger(Converter.EVENT_CREATE_DECLARATION, reflection, node);
                    if (ts.isClassDeclaration(node) || ts.isInterfaceDeclaration(node)) {
                        context.withScope(reflection, node.typeParameters!, () => {});
                    }
                    if (reflection) {
                        reflection.url = url;
                        reflection.urlTarget = "external";
                    }
                }
            }
        }
    }

    private loadBiblio(biblio: string) {
        try {
            return require(path.resolve(biblio));
        }
        catch (e) {
            this.application.logger.error("Could not load biblio '%s'.", biblio);
        }
    }
}