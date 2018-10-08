import "../augmentations";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { Reflection, DeclarationReflection } from "typedoc/dist/lib/models";
import { ComponentHost } from "typedoc/dist/lib/utils/component";

@Component({ name: "stripInternal" })
export class StripInternalPlugin extends ConverterComponent {
    private shouldStripInternal!: boolean;
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

    private onBegin(context: Context) {
        this.shouldStripInternal = context.getCompilerOptions().stripInternal === true;
        this.reflectionsToRemove = new Set();
    }

    private onEnd(context: Context) {
        context.removeReflections(this.reflectionsToRemove);
        this.shouldStripInternal = false;
        this.reflectionsToRemove = undefined!;
    }

    private onCreateDeclaration(_context: Context, reflection: DeclarationReflection, node: ts.Node | undefined) {
        if (!node) return;
        if (this.shouldStripInternal && isInternal(node)) {
            this.reflectionsToRemove.add(reflection);
        }
    }
}

function isInternal(node: ts.Node) {
    const sourceFile = node.getSourceFile();
    const text = sourceFile.text;
    const comments = ts.getLeadingCommentRanges(text, node.pos);
    if (comments) {
        for (const comment of comments) {
            if (text.slice(comment.pos, comment.end).includes("@internal")) {
                return true;
            }
        }
    }
    return false;
}
