import "../augmentations";
import { Component, Event } from "typedoc/dist/lib/utils";
import { Reflection, ReflectionKind, DeclarationReflection, ContainerReflection } from "typedoc";
import { ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { CommentPlugin, GroupPlugin, CategoryPlugin } from "typedoc/dist/lib/converter/plugins";
import { ComponentHost } from "typedoc/dist/lib/utils/component";

// patch Context to add an improved removeReflection
declare module "typedoc/dist/lib/converter/context" {
    interface Context {
        removeReflection(reflection: Reflection): void;
        removeReflections(reflections: Iterable<Reflection>): void;
        updateReflection(reflection: Reflection, props?: { name?: string, kind?: ReflectionKind }): void;
    }
}

Context.prototype.removeReflection = function (reflection) {
    if (!this.converter.getComponent("reflectionEvents")) throw new TypeError("'reflectionEvents' plugin not loaded.");
    this.converter.trigger(new ReflectionEvent(ReflectionEvent.REMOVED, this, reflection));
};

Context.prototype.removeReflections = function (reflections) {
    if (!this.converter.getComponent("reflectionEvents")) throw new TypeError("'reflectionEvents' plugin not loaded.");
    for (const reflection of reflections) {
        this.converter.trigger(new ReflectionEvent(ReflectionEvent.REMOVED, this, reflection));
    }
};

Context.prototype.updateReflection = function (reflection, props) {
    if (!this.converter.getComponent("reflectionEvents")) throw new TypeError("'reflectionEvents' plugin not loaded.");
    if (props && props.name !== undefined) {
        reflection.name = props.name;
    }
    if (props && props.kind !== undefined) {
        reflection.kind = props.kind;
    }
    this.converter.trigger(new ReflectionEvent(ReflectionEvent.MODIFIED, this, reflection));
};

export class ReflectionEvent extends Event {
    static readonly REMOVED = "reflectionRemoved";
    static readonly MODIFIED = "reflectionModified";

    context: Context;
    reflection: Reflection;

    constructor(name: string, context: Context, reflection: Reflection) {
        super(name);
        this.context = context;
        this.reflection = reflection;
    }
}

@Component({ name: "reflectionEvents" })
export class ReflectionEventsPlugin extends ConverterComponent {
    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, ReflectionEvent.REMOVED, this.onReflectionRemoved);
        this.listenTo(this.owner, ReflectionEvent.MODIFIED, this.onReflectionModified);
    }

    private onReflectionRemoved({ context: { project }, reflection }: ReflectionEvent) {
        CommentPlugin.removeReflection(project, reflection);
    }

    private onReflectionModified({ reflection }: ReflectionEvent) {
        if (reflection.kindString) {
            reflection.kindString = GroupPlugin.getKindSingular(reflection.kind);
        }

        if (reflection instanceof DeclarationReflection && reflection.signatures) {
            for (const signature of reflection.signatures) {
                if (signature.name !== "__call") signature.name = reflection.name;
            }
        }

        const parent = reflection.parent;
        if (parent instanceof ContainerReflection) {
            if (parent.groups || parent.categories) {
                parent.children.sort(GroupPlugin.sortCallback);
                if (parent.groups) {
                    parent.groups = GroupPlugin.getReflectionGroups(parent.children);
                }
                if (parent.categories) {
                    parent.categories = CategoryPlugin.getReflectionCategories(parent.children);
                    if (parent.categories && parent.categories.length > 1) {
                        parent.categories.sort(CategoryPlugin.sortCatCallback);
                    }
                }
            }
        }
    }
}