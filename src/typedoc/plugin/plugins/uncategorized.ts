import "../augmentations";
import * as ts from "typedoc/node_modules/typescript/lib/typescript";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { Reflection, ContainerReflection, SourceDirectory, SourceFile, DeclarationReflection } from "typedoc/dist/lib/models";
import { ComponentHost, Option } from "typedoc/dist/lib/utils/component";
import { ReflectionCategory } from "typedoc/dist/lib/models/ReflectionCategory";
import { CategoryPlugin, GroupPlugin } from "typedoc/dist/lib/converter/plugins";
import { ParameterType } from "typedoc/dist/lib/utils/options/declaration";
import { getRawComment, parseComment } from "typedoc/dist/lib/converter/factories/comment";

let uncategorizedName: string = "";

// patch CategoryPlugin to support uncategorized reflections
const savedGetReflectionCategories = CategoryPlugin.getReflectionCategories;
CategoryPlugin.getReflectionCategories = (reflections: Reflection[]) => {
    const categories = savedGetReflectionCategories(reflections);
    if (categories.length > 0) {
        let uncategorized: ReflectionCategory | undefined;
        reflections.forEach((reflection) => {
            const childCat = CategoryPlugin.getCategory(reflection);
            if (childCat === "") {
                if (!uncategorized) {
                    uncategorized = categories.find(category => category.isUncategorized === true);
                    if (!uncategorized) {
                        uncategorized = new ReflectionCategory(uncategorizedName);
                        uncategorized.isUncategorized = true;
                        categories.push(uncategorized);
                    }
                }
                uncategorized.children.push(reflection);
            }
        });
    }
    return categories;
};

// patch CategoryPlugin to support sorting categories by a configured weight
const savedSortCatCallback = CategoryPlugin.sortCatCallback;
CategoryPlugin.sortCatCallback = (a, b) => {
    if (a.isUncategorized) return +1;
    if (b.isUncategorized) return -1;
    let aIndex = CategoryPlugin.WEIGHTS.indexOf(a.title);
    let bIndex = CategoryPlugin.WEIGHTS.indexOf(b.title);
    if (aIndex === -1 || bIndex === -1) {
        let asteriskIndex = CategoryPlugin.WEIGHTS.indexOf("*");
        if (asteriskIndex === -1) asteriskIndex = CategoryPlugin.WEIGHTS.length;
        if (aIndex === -1) aIndex === asteriskIndex;
        if (bIndex === -1) bIndex === asteriskIndex;
    }
    return (aIndex - bIndex) || savedSortCatCallback(a, b);
};

@Component({ name: "uncategorized" })
export class UncategorizedPlugin extends ConverterComponent {
    @Option({
        name: "categoryOrder",
        help: "The in which categories should appear. '*' indicates the relative order for categories not found in the list.",
        type: ParameterType.Array
    })
    categoryOrder!: string[];

    @Option({
        name: "uncategorizedName",
        help: "The category name to use for uncategorized reflections.",
        defaultValue: "",
        type: ParameterType.String
    })
    uncategorizedName!: string;

    private savedWeights!: string[];

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
        uncategorizedName = this.uncategorizedName;
        this.savedWeights = CategoryPlugin.WEIGHTS;
        if (this.categoryOrder) {
            CategoryPlugin.WEIGHTS = this.categoryOrder;
        }
    }

    private onEnd() {
        uncategorizedName = "";
        CategoryPlugin.WEIGHTS = this.savedWeights;
    }

    private onCreateDeclaration(_context: Context, reflection: DeclarationReflection, node: ts.Node | undefined) {
        if (reflection.comment) return;
        const rawComment = node && getRawComment(node);
        if (rawComment) reflection.comment = parseComment(rawComment);
    }
}