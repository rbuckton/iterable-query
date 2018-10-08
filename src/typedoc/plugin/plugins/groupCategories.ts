import "../augmentations";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { Reflection, ContainerReflection } from "typedoc/dist/lib/models";
import { ComponentHost, Option } from "typedoc/dist/lib/utils/component";
import { CategoryPlugin, GroupPlugin } from "typedoc/dist/lib/converter/plugins";
import { ParameterType } from "typedoc/dist/lib/utils/options/declaration";
import { ReflectionGroup } from "typedoc/dist/lib/models/ReflectionGroup";
import { ReflectionCategory } from "typedoc/dist/lib/models/ReflectionCategory";
import { remove, removeAt } from "../utils";
import { ReflectionEvent } from "./reflectionEvents";

let groupCategoriesEnabled = false;

// patch GroupPlugin to fill in categories when we calculate groups
const savedGetReflectionGroups = GroupPlugin.getReflectionGroups;
GroupPlugin.getReflectionGroups = function (reflections) {
    const groups = savedGetReflectionGroups.call(this, reflections) as ReflectionGroup[];
    if (groupCategoriesEnabled) {
        for (const group of groups) {
            if (group.children && group.children.length > 0) {
                if (group.children.length > 1) {
                    group.children.sort(GroupPlugin.sortCallback);
                }
                group.categories = CategoryPlugin.getReflectionCategories(group.children);
            }
            if (group.categories && group.categories.length > 1) {
                group.categories.sort(CategoryPlugin.sortCatCallback);
            }
        }
    }
    return groups;
};

@Component({ name: "groupCategories" })
export class GroupCategoriesPlugin extends ConverterComponent {
    @Option({
        name: "groupCategories",
        help: "Support categories in groups",
        type: ParameterType.Boolean
    })
    groupCategories!: boolean;

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, Converter.EVENT_BEGIN, this.onBegin);
        this.listenTo(this.owner, Converter.EVENT_END, this.onEnd);
        this.listenTo(this.owner, ReflectionEvent.REMOVED, this.onReflectionRemoved);
    }

    private onBegin(_context: Context) {
        groupCategoriesEnabled = this.groupCategories;
    }

    private onEnd(_context: Context) {
        groupCategoriesEnabled = false;
    }


    private onReflectionRemoved({ reflection }: ReflectionEvent) {
        const parent = reflection.parent;
        if (parent instanceof ContainerReflection) {
            removeReflectionFromGroups(parent.groups, reflection);
            removeReflectionFromCategories(parent.categories, reflection)!;
        }
    }
}

function removeReflectionFromCategories(categories: ReflectionCategory[] | undefined, reflection: Reflection) {
    if (categories) {
        for (let i = categories.length - 1; i >= 0; i--) {
            const category = categories[i];
            if (remove(category.children, reflection) && category.children.length === 0) {
                removeAt(categories, i);
            }
        }
    }
}

function removeReflectionFromGroups(groups: ReflectionGroup[], reflection: Reflection) {
    if (groups) {
        for (let i = groups.length - 1; i >= 0; i--) {
            const group = groups[i];
            if (remove(group.children, reflection) && group.children.length === 0) {
                removeAt(groups, i);
                continue;
            }
            removeReflectionFromCategories(group.categories, reflection);
        }
    }
}
