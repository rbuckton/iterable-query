import "../augmentations";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { Reflection, ReflectionKind, ReflectionFlag, DeclarationReflection, SignatureReflection } from "typedoc/dist/lib/models";
import { ComponentHost } from "typedoc/dist/lib/utils/component";
import { ExportBinding } from "../model/exportBinding";

@Component({ name: "exports" })
export class ExportsPlugin extends ConverterComponent {
    private excludeNotExported!: boolean;
    private notExported!: Set<Reflection>;
    private deferResolution!: Set<DeclarationReflection>;
    private renames!: { symbolID: number, renameTo: string }[];

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, Converter.EVENT_BEGIN, this.onBegin);
        this.listenTo(this.owner, Converter.EVENT_CREATE_DECLARATION, this.onCreateDeclaration, 100);
        this.listenTo(this.owner, Converter.EVENT_RESOLVE, this.onResolve, 100); // must run before external-module-name
        this.listenTo(this.owner, Converter.EVENT_RESOLVE_END, this.onResolveEnd, 100);
        this.listenTo(this.owner, Converter.EVENT_END, this.onEnd);
        this.listenTo(this.owner, Converter.EVENT_RESOLVE_BEGIN, this.onResolveBegin, -100); // must run after external-module-name
    }

    private onBegin() {
        this.excludeNotExported = this.application.options.getValue("excludeNotExported");
        this.application.options.setValue("excludeNotExported", false);
        this.notExported = new Set();
        this.deferResolution = new Set();
        this.renames = [];
    }

    private onEnd(context: Context) {
        if (this.excludeNotExported) {
            context.removeReflections(this.notExported);
            this.notExported = undefined!;
        }
        this.application.options.setValue("excludeNotExported", this.excludeNotExported);
    }

    private onCreateDeclaration(context: Context, reflection: DeclarationReflection, node: ts.Node | undefined) {
        if (node && ts.isExportSpecifier(node)) {
            return;
        }
        if (node && node.parent && ts.isSourceFile(node.parent) && !ts.isExternalModule(node.parent)) {
            // ignore globals
            return;
        }
        if (reflection.kindOf(ReflectionKind.ExternalModule) && node && ts.isSourceFile(node) && node.symbol) {
            const renameTo = getRename(node);
            if (renameTo) {
                this.renames.push({ symbolID: context.getSymbolID(node.symbol), renameTo });
            }
        }
        if (reflection.kindOf(ReflectionKind.Method) && reflection.flags.isExported && node && ts.isFunctionDeclaration(node) && !(ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export)) {
            // A function in a module that merges with a class declaration should *not* be explicitly exported.
            reflection.setFlag(ReflectionFlag.Exported, false);
        }
        if (reflection.kindOf(ReflectionKind.ModuleMember | ReflectionKind.ClassMember) && !reflection.flags.isExported) {
            this.notExported.add(reflection);
        }
    }

    private onResolveBegin(context: Context) {
        // module renames can cause us a headache, so we must fix them.
        if (this.renames.length === 0) return;
        const reflections = new Map(Object
            .keys(context.project.reflections)
            .map(key => context.project.reflections[+key])
            .filter(reflection => reflection.kindOf(ReflectionKind.ExternalModule))
            .map(reflection => [reflection.name, reflection] as [string, Reflection]));
        for (const { symbolID, renameTo } of this.renames) {
            const reflection = reflections.get(renameTo);
            if (reflection) {
                context.project.symbolMapping[symbolID] = reflection.id;
            }
        }
    }

    private onResolve(context: Context, reflection: DeclarationReflection) {
        const project = context.project;
        const binding = reflection.exportOf;
        if (!binding) return;
        if (!binding.reflection && binding.symbolID !== undefined) {
            const boundReflection = project.reflections[project.symbolMapping[binding.symbolID]];
            if (boundReflection instanceof DeclarationReflection) {
                binding.reflection = boundReflection;
                if (binding.reflection.parent !== reflection.parent && reflection.parent.kindOf(ReflectionKind.Class)) {
                    const localReflection = reflection.parent.findReflectionByName(binding.reflection.originalName);
                    if (localReflection instanceof DeclarationReflection) {
                        binding.reflection = localReflection;
                    }
                }
                if (binding.reflection.parent !== reflection.parent) {
                    this.deferResolution.add(reflection);
                }
                else {
                    this.finishResolution(context, reflection);
                }
            }
        }
    }

    private onResolveEnd(context: Context) {
        for (const reflection of this.deferResolution) {
            this.finishResolution(context, reflection);
        }
    }

    private finishResolution(context: Context, reflection: DeclarationReflection) {
        const binding = reflection.exportOf;
        if (!binding || !binding.reflection) return;
        binding.isExportStar = binding.reflection.kindOf(ReflectionKind.ExternalModule);
        if (!binding.reflection.flags.isExported && reflection.parent === binding.reflection.parent) {
            // take on the name of the first export binding.
            context.updateReflection(binding.reflection, { name: reflection.name });
            binding.reflection.setFlag(ReflectionFlag.Exported, true);
            this.notExported.delete(binding.reflection);
            this.notExported.add(reflection);
        }
        else {
            if (reflection.kind !== binding.reflection.kind && reflection.parent.kind === binding.reflection.parent.kind) {
                context.updateReflection(reflection, { kind: binding.reflection.kind });
                if (binding.reflection instanceof DeclarationReflection) {
                    if (binding.reflection.comment) reflection.comment = binding.reflection.comment;
                    if (binding.reflection.defaultValue) reflection.defaultValue = binding.reflection.defaultValue;
                    if (binding.reflection.getSignature) reflection.getSignature = binding.reflection.getSignature;
                    if (binding.reflection.setSignature) reflection.setSignature = binding.reflection.setSignature;
                    if (binding.reflection.indexSignature) reflection.indexSignature = binding.reflection.indexSignature;
                    if (binding.reflection.type) reflection.type = binding.reflection.type;
                    if (binding.reflection.typeParameters) reflection.typeParameters = binding.reflection.typeParameters;
                    if (binding.reflection.overwrites) reflection.overwrites = binding.reflection.overwrites;
                    if (binding.reflection.inheritedFrom) reflection.inheritedFrom = binding.reflection.inheritedFrom;
                    if (binding.reflection.implementationOf) reflection.implementationOf = binding.reflection.implementationOf;
                    if (binding.reflection.extendedTypes) reflection.extendedTypes = binding.reflection.extendedTypes;
                    if (binding.reflection.extendedBy) reflection.extendedBy = binding.reflection.extendedBy;
                    if (binding.reflection.implementedTypes) reflection.implementedTypes = binding.reflection.implementedTypes;
                    if (binding.reflection.implementedBy) reflection.implementedBy = binding.reflection.implementedBy;
                    if (binding.reflection.typeHierarchy) reflection.typeHierarchy = binding.reflection.typeHierarchy;
                    if (binding.reflection.signatures) reflection.signatures = binding.reflection.signatures.map(sig => cloneSignatureReflectionWithName(sig, reflection, binding));
                    if (binding.reflection.sources) reflection.sources = binding.reflection.sources;
                }
            }
        }
    }
}

function cloneSignatureReflectionWithName(reflection: SignatureReflection, parent: DeclarationReflection, binding: ExportBinding) {
    if (reflection.name === "__call") return reflection;
    const signature = new SignatureReflection(parent, parent.name, reflection.kind);
    signature.sources = reflection.sources;
    signature.comment = reflection.comment;
    signature.parameters = reflection.parameters;
    signature.typeParameters = reflection.typeParameters;
    signature.type = reflection.type;
    signature.overwrites = reflection.overwrites;
    signature.inheritedFrom = reflection.inheritedFrom;
    signature.implementationOf = reflection.implementationOf;
    signature.exportOf = new ExportBinding(binding.name, undefined, binding.reflection);
    return signature;

}

function getRename(sourceFile: ts.SourceFile) {
    const rawComment = sourceFile.text.slice(0, sourceFile.getLeadingTriviaWidth());
    if (!rawComment) return undefined;
    const re = /\/\*\*((?:.|[\r\n])*)\*\//g;
    
    let match: RegExpExecArray | null;
    while (match = re.exec(rawComment)) {
        match = /@module\s+([\w\u4e00-\u9fa5\.\-_/@"]+)/.exec(match[1]);
        if (match) {
            return match[1];
        }
    }

    return undefined;
}