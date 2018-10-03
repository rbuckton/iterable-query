import "typedoc/dist/lib/ts-internal";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { Reflection, ReflectionKind, ReflectionFlag, ContainerReflection, DeclarationReflection, SourceDirectory } from "typedoc/dist/lib/models";
import { CommentPlugin, GroupPlugin, CategoryPlugin } from "typedoc/dist/lib/converter/plugins";
import { getRawComment, parseComment } from "typedoc/dist/lib/converter/factories/comment";
import { ReflectionCategory } from "typedoc/dist/lib/models/ReflectionCategory";
import { ReflectionGroup } from "typedoc/dist/lib/models/ReflectionGroup";

declare module "typedoc/dist/lib/models/reflections/abstract" {
    interface Reflection {
        otherNames?: string[];
        allKinds?: { kind: ReflectionKind, kindString: string }[];
    }
}
declare module "typedoc/dist/lib/models/ReflectionGroup" {
    interface ReflectionGroup {
        categories?: ReflectionCategory[];
    }
}

const moduleMemberKind =
    ReflectionKind.Class |
    ReflectionKind.Interface |
    ReflectionKind.Function |
    ReflectionKind.Enum |
    ReflectionKind.Variable |
    ReflectionKind.Module |
    ReflectionKind.TypeAlias;

const savedGetReflectionCategories = CategoryPlugin.getReflectionCategories;
CategoryPlugin.getReflectionCategories = (reflections: Reflection[]) => {
    const categories = savedGetReflectionCategories(reflections);
    if (categories.length > 0) {
        let uncategorized: ReflectionCategory | undefined;
        reflections.forEach((reflection) => {
            const childCat = CategoryPlugin.getCategory(reflection);
            if (childCat === '') {
                if (!uncategorized) {
                    uncategorized = categories.find(category => category.title === "Other");
                    if (!uncategorized) {
                        uncategorized = new ReflectionCategory("Other");
                        categories.push(uncategorized);
                    }
                }
                uncategorized.children.push(reflection);
            }
        });
    }
    return categories;
};

const WEIGHTS = [
    "Query",
    "Scalar",
    "Subquery",
    "Order",
    "Join",
    "Hierarchy",
];

const savedSortCatCallback = CategoryPlugin.sortCatCallback;
CategoryPlugin.sortCatCallback = (a, b) => {
    return a.title === "Other" ? 1 :
        b.title === "Other" ? -1 :
        (WEIGHTS.indexOf(a.title) - WEIGHTS.indexOf(b.title)) || savedSortCatCallback(a, b);
};


@Component({ name: "iterable-query-custom" })
export class CustomPlugin extends ConverterComponent {
    private removed!: Set<Reflection>;
    private modules!: ContainerReflection[];
    private exportSpecifiers!: Map<number, Map<string, string[]>>;
    private queryClasses!: Map<string, DeclarationReflection>;
    private queryModules!: DeclarationReflection[];
    private queryInterfaces!: DeclarationReflection[];
    private queryStaticMethods!: Map<string, DeclarationReflection[]>;
    private queryInstanceMethods!: Map<string, DeclarationReflection[]>;
    private overloads!: Map<number, Map<string, DeclarationReflection[]>>;

    initialize() {
        this.listenTo(this.owner, {
            [Converter.EVENT_BEGIN]: this.onBegin,
            [Converter.EVENT_CREATE_DECLARATION]: this.onDeclaration,
            [Converter.EVENT_RESOLVE]: this.onResolve,
            [Converter.EVENT_RESOLVE_BEGIN]: this.onBeginResolve,
            [Converter.EVENT_RESOLVE_END]: this.onEndResolve,
        });
    }

    private onBegin(context: Context) {
        this.removed = new Set<Reflection>();
        this.modules = [];
        this.exportSpecifiers = new Map<number, Map<string, string[]>>();
        this.queryClasses = new Map<string, DeclarationReflection>();
        this.queryModules = [];
        this.queryInterfaces = [];
        this.queryStaticMethods = new Map<string, DeclarationReflection[]>();
        this.queryInstanceMethods = new Map<string, DeclarationReflection[]>();
        this.overloads = new Map();
    }

    private onDeclaration(context: Context, reflection: Reflection, node?: ts.Node) {
        getComment(node, reflection);
        
        // remove items marked @internal
        if (isInternal(reflection)) {
            this.removed.add(reflection);
        }

        // skip the 'internal' and 'compat' folders
        if (reflection.kindOf(ReflectionKind.ExternalModule) &&
            /[\\/]((internal|compat)[\\/]|(index|axis)\.ts$)/.test(reflection.name)) {
            this.removed.add(reflection);
            return;
        }

        // track Query and subclasses
        if (reflection.kindOf(ReflectionKind.Class) &&
            reflection.parent.kindOf(ReflectionKind.ExternalModule) &&
            /^(Async)?(Ordered)?(Hierarchy)?Query$/.test(reflection.name)) {
            this.queryClasses.set(reflection.name, reflection as DeclarationReflection);
        }

        // track modules that merge with Query and subclasses
        if (reflection.kindOf(ReflectionKind.Module) &&
            reflection.parent.kindOf(ReflectionKind.ExternalModule) &&
            /^(Async)?(Ordered)?(Hierarchy)?Query$/.test(reflection.name)) {
            this.queryModules.push(reflection as DeclarationReflection);
        }

        // track interfaces that merge with query and subclasses
        if (reflection.kindOf(ReflectionKind.Interface) &&
            reflection.parent.kindOf(ReflectionKind.ExternalModule) &&
            /^(Async)?(Ordered)?(Hierarchy)?Query$/.test(reflection.name)) {
            this.queryInterfaces.push(reflection as DeclarationReflection);
        }

        // track functions that merge with the static shape of Query and its subclasses
        if (reflection.kindOf(ReflectionKind.Function) &&
            reflection.parent.kindOf(ReflectionKind.Module) &&
            /^(Async)?(Ordered)?(Hierarchy)?Query$/.test(reflection.parent.name)) {
            let staticMethods = this.queryStaticMethods.get(reflection.parent.name);
            if (!staticMethods) this.queryStaticMethods.set(reflection.parent.name, staticMethods = []);
            staticMethods.push(reflection as DeclarationReflection);
        }

        // track functions that merge with the instance shape of Query and its subclasses
        if (reflection.kindOf(ReflectionKind.Method) &&
            reflection.parent.kindOf(ReflectionKind.Interface) &&
            /^(Async)?(Ordered)?(Hierarchy)?Query$/.test(reflection.parent.name)) {
            let instanceMethods = this.queryInstanceMethods.get(reflection.parent.name);
            if (!instanceMethods) this.queryInstanceMethods.set(reflection.parent.name, instanceMethods = []);
            instanceMethods.push(reflection as DeclarationReflection);
        }

        // rename built-in symbols
        let match: RegExpExecArray | null;
        if (reflection.kindOf(ReflectionKind.Method) &&
            (match = /^__@(\w+)$/.exec(reflection.name))) {
            reflection.name = `[Symbol.${match[1]}]`;
        }

        // rename computed names
        if (reflection.kindOf(ReflectionKind.Method) &&
            reflection.name === "__computed" &&
            node) {
            const name = ts.getNameOfDeclaration(node as ts.Declaration);
            if (name) reflection.name = name.getText();
        }

        // fix reflections that merge declaration types
        if (reflection.kindOf(ReflectionKind.Module | ReflectionKind.Class | ReflectionKind.Enum) &&
            node &&
            node.symbol) {
            const flags = node.symbol.flags;
            const allKinds: { kind: ReflectionKind, kindString: string }[] = [];
            if (flags & ts.SymbolFlags.Class) allKinds.push({ kind: ReflectionKind.Class, kindString: GroupPlugin.getKindSingular(ReflectionKind.Class) });
            if (flags & ts.SymbolFlags.Interface) allKinds.push({ kind: ReflectionKind.Interface, kindString: GroupPlugin.getKindSingular(ReflectionKind.Interface) });
            if (flags & ts.SymbolFlags.Enum) allKinds.push({ kind: ReflectionKind.Enum, kindString: GroupPlugin.getKindSingular(ReflectionKind.Enum) });
            if (flags & ts.SymbolFlags.Namespace) allKinds.push({ kind: ReflectionKind.Module, kindString: GroupPlugin.getKindSingular(ReflectionKind.Module) });
            reflection.kind = allKinds[0].kind;
            reflection.kindString = allKinds[0].kindString;
            if (allKinds.length > 1) reflection.allKinds = allKinds;

            if (flags & ts.SymbolFlags.Class && flags & ts.SymbolFlags.Interface) {
                // when class and interface merge, we end up with duplicated type parameters
                const decl = reflection as DeclarationReflection;
                if (decl.typeParameters) {
                    const typeParameterNames = new Set<string>();
                    for (const typeParameter of decl.typeParameters) {
                        if (typeParameterNames.has(typeParameter.name)) {
                            this.removed.add(typeParameter);
                        }
                        else {
                            typeParameterNames.add(typeParameter.name);
                        }
                    }
                }
            }
        }

        if (reflection.kindOf(ReflectionKind.SomeModule) && node) {
            this.collectExportSpecifiers(reflection as ContainerReflection, node);
        }

        // fix _break not merging
        if (reflection.kindOf(ReflectionKind.FunctionOrMethod)) {
            this.collectOverloads(reflection as DeclarationReflection);
        }

        if (reflection.kindOf(moduleMemberKind) && reflection.parent && reflection.parent.kindOf(ReflectionKind.SomeModule)) {
            const exportSpecifiers = this.exportSpecifiers.get(reflection.parent.id);
            if (exportSpecifiers) {
                // has it been exported under a different name?
                const localName = reflection.name;
                const exportedNames = exportSpecifiers.get(localName);
                if (exportedNames) {
                    if (reflection.flags.isExported) {
                        reflection.otherNames = reflection.otherNames
                            ? reflection.otherNames.concat(exportedNames)
                            : exportedNames;
                    }
                    else {
                        reflection.name = exportedNames[0];
                        reflection.otherNames = reflection.otherNames
                            ? reflection.otherNames.concat(exportedNames.slice(1))
                            : exportedNames.slice(1);
                        reflection.setFlag(ReflectionFlag.Exported, true);
                    }
                    return;
                }
            }
            if (!reflection.flags.isExported) {
                this.removed.add(reflection);
            }
        }

        // fix reflections that have an alias
        if (reflection.comment && reflection.comment.hasTag("alias")) {
            const alias = reflection.comment.getTag("alias");
            const match = /^\s*([a-zA-Z$_][a-zA-Z0-9$_]*)/.exec(alias.text);
            if (match) {
                reflection.name = match[1];
            }
            CommentPlugin.removeTags(reflection.comment, "alias");
        }
    }

    private collectExportSpecifiers(reflection: ContainerReflection, node: ts.Node) {
        this.modules.push(reflection as ContainerReflection);
        let statements: ts.NodeArray<ts.Statement> | undefined;
        if (node) {
            if (node && ts.isModuleDeclaration(node)) {
                if (node.body && ts.isModuleBlock(node.body)) {
                    statements = node.body.statements;
                }
            }
            else {
                statements = (node as ts.SourceFile).statements;
            }
        }
        if (!statements) return;
        for (const statement of statements) {
            if (ts.isExportDeclaration(statement) && statement.exportClause && !statement.moduleSpecifier) {
                let moduleExportSpecifiers = this.exportSpecifiers.get(reflection.id);
                if (!moduleExportSpecifiers) this.exportSpecifiers.set(reflection.id, moduleExportSpecifiers = new Map<string, string[]>());
                for (const specifier of statement.exportClause.elements) {
                    const exportedName = ts.unescapeLeadingUnderscores(specifier.name.escapedText);
                    const localName = specifier.propertyName ? ts.unescapeLeadingUnderscores(specifier.propertyName.escapedText) : exportedName;
                    let exportedNames = moduleExportSpecifiers.get(localName);
                    if (!exportedNames) moduleExportSpecifiers.set(localName, exportedNames = []);
                    exportedNames.push(exportedName);
                }
            }
        }
    }

    private collectOverloads(reflection: DeclarationReflection) {
        if (reflection.name !== "_break" && reflection.name !== "_eval") return;
        let scope = this.overloads.get(reflection.parent.id);
        if (!scope) this.overloads.set(reflection.parent.id, scope = new Map());
        let overloads = scope.get(reflection.name);
        if (!overloads) scope.set(reflection.name, overloads = []);
        overloads.push(reflection);
    }

    private fixOverloads() {
        for (const scope of this.overloads.values()) {
            for (const reflections of scope.values()) {
                const mainFunction = reflections[0];
                if (reflections.length > 1) {
                    this.removed.add(reflections.pop()!);
                    for (const overload of reflections.slice(1)) {
                        mainFunction.signatures = mainFunction.signatures.concat(overload.signatures);
                        this.removed.add(overload);
                    }
                }
            }
        }
    }

    private onBeginResolve(context: Context) {
        this.fixOverloads();

        for (const [key, methods] of this.queryStaticMethods) {
            const queryClass = this.queryClasses.get(key);
            if (!queryClass) continue;
            for (const method of methods) {
                method.kind = ReflectionKind.Method;
                method.setFlag(ReflectionFlag.Static, true);
                method.setFlag(ReflectionFlag.Exported, false);
                const parent = method.parent as ContainerReflection;
                const index = parent.children.indexOf(method);
                if (index !== -1) parent.children.splice(index, 1);
                queryClass.children.push(method);
                method.parent = queryClass;
            }
        }
        for (const queryModule of this.queryModules) {
            if (!queryModule.children || queryModule.children.length === 0) {
                this.removed.add(queryModule);
            }
        }
        for (const [key, methods] of this.queryInstanceMethods) {
            const queryClass = this.queryClasses.get(key);
            if (!queryClass) continue;
            for (const method of methods) {
                method.kind = ReflectionKind.Method;
                method.setFlag(ReflectionFlag.Static, false);
                method.setFlag(ReflectionFlag.Exported, false);
                const parent = method.parent as ContainerReflection;
                const index = parent.children.indexOf(method);
                if (index !== -1) parent.children.splice(index, 1);
                queryClass.children.push(method);
                method.parent = queryClass;
            }
        }
        for (const queryInterface of this.queryModules) {
            if (!queryInterface.children || queryInterface.children.length === 0) {
                this.removed.add(queryInterface);
            }
        }
        for (const reflection of this.removed) {
            CommentPlugin.removeReflection(context.project, reflection);
        }
        for (const module of this.modules) {
            if (module.children && module.children.length === 0) {
                CommentPlugin.removeReflection(context.project, module);
            }
        }
    }

    private onEndResolve(context: Context) {
        function walkDirectory(directory: SourceDirectory) {
            categorizeGroups(directory);
            for (let key in directory.directories) {
                if (!directory.directories.hasOwnProperty(key)) {
                    continue;
                }
                walkDirectory(directory.directories[key]);
            }
        }

        const project = context.project;
        categorizeGroups(project);

        walkDirectory(project.directory);
        project.files.forEach(categorizeGroups);
    }

    private onResolve(context: Context, reflection: Reflection) {
        if (reflection instanceof ContainerReflection) {
            categorizeGroups(reflection);
        }
    }
}

function isInternal(reflection: Reflection) {
    while (reflection) {
        if (reflection.comment && reflection.comment.hasTag("internal")) {
            return true;
        }
        reflection = reflection.parent;
    }
    return false;
}

function getComment(node: ts.Node | undefined, reflection: Reflection) {
    if (reflection.comment) return reflection.comment;
    if (!node) return undefined;
    const rawComment = getRawComment(node);
    if (!rawComment) return undefined;
    const comment = parseComment(rawComment);
    return reflection.comment = comment;
}

function categorizeGroups(reflection: { groups: ReflectionGroup[] }) {
    if (!reflection.groups || reflection.groups.length === 0) return;
    reflection.groups.forEach((group) => {
        group.categories = CategoryPlugin.getReflectionCategories(group.children);
        if (group.categories && group.categories.length > 1) {
            group.categories.sort(CategoryPlugin.sortCatCallback);
        }
    });
}