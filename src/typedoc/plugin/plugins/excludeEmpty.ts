import "../augmentations";
import { Component, ConverterComponent } from "typedoc/dist/lib/converter/components";
import { Converter, Context } from "typedoc/dist/lib/converter";
import { Reflection, ReflectionKind, ContainerReflection, DeclarationReflection, SourceDirectory, SourceFile } from "typedoc/dist/lib/models";
import { ComponentHost, Option } from "typedoc/dist/lib/utils/component";
import { ReflectionCategory } from "typedoc/dist/lib/models/ReflectionCategory";
import { ReflectionGroup } from "typedoc/dist/lib/models/ReflectionGroup";
import { ParameterType } from "typedoc/dist/lib/utils/options/declaration";
import { removeAt } from "../utils";

@Component({ name: "excludeEmpty" })
export class ExcludeEmptyPlugin extends ConverterComponent {
    @Option({
        name: "excludeEmpty",
        help: "Exclude empty modules with no exports.",
        type: ParameterType.Boolean
    })
    excludeEmpty!: boolean;

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Converter)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, Converter.EVENT_END, this.onEnd, -200);
    }

    private onEnd(context: Context) {
        function removeEmptyDirectories(directories: Record<string, SourceDirectory>) {
            // deleteWhere(directories, removeEmptyDirectory);
            // return isEmptyObject(directories);
            let empty = true;
            for (let key in directories) {
                if (!directories.hasOwnProperty(key)) {
                    continue;
                }
                if (removeEmptyDirectory(directories[key])) {
                    delete directories[key];
                    continue;
                }
                empty = false;
            }
            return empty;
        }

        function removeEmptyDirectory(directory: SourceDirectory) {
            return removeEmptyGroups(directory.groups)
                && removeEmptyCategories(directory.categories)
                && removeEmptyFiles(directory.files)
                && removeEmptyDirectories(directory.directories);
        }

        function removeEmptyFiles(files: SourceFile[]) {
            return removeEmptyList(files, removeEmptyFile);
        }

        function removeEmptyFile(file: SourceFile) {
            return removeEmptyGroups(file.groups)
                && removeEmptyCategories(file.categories)
                && removeEmptyReflections(file.reflections);
        }

        function removeEmptyGroups(groups: ReflectionGroup[]) {
            if (removeEmptyList(groups, removeEmptyGroup)) return true;
            for (const group of groups) {
                let someExported = false, allInherited = true, allPrivate = true, allProtected = true, allExternal = true;
                for (const child of group.children) {
                    someExported = child.flags.isExported || someExported;
                    allPrivate = child.flags.isPrivate! && allPrivate;
                    allProtected = (child.flags.isPrivate! || child.flags.isProtected!) && allProtected;
                    allExternal = child.flags.isExternal! && allExternal;
                    if (child instanceof DeclarationReflection) {
                        allInherited = child.inheritedFrom && allInherited;
                    }
                    else {
                        allInherited = false;
                    }
                }
                group.someChildrenAreExported = someExported;
                group.allChildrenAreInherited = allInherited;
                group.allChildrenArePrivate = allPrivate;
                group.allChildrenAreProtectedOrPrivate = allProtected;
                group.allChildrenAreExternal = allExternal;
            }
            return false;
        }

        function removeEmptyGroup(group: ReflectionGroup) {
            return removeEmptyCategories(group.categories)
                && removeEmptyReflections(group.children);
        }

        function removeEmptyCategories(categories: ReflectionCategory[] | undefined) {
            return removeEmptyList(categories, removeEmptyCategory);
        }

        function removeEmptyCategory(category: ReflectionCategory) {
            return removeEmptyReflections(category.children);
        }

        function removeEmptyReflections(reflections: Reflection[]) {
            return removeEmptyList(reflections, removeEmptyReflection);
        }

        function removeEmptyReflection(reflection: Reflection) {
            if (reflection.kindOf(ReflectionKind.SomeModule) && reflection instanceof ContainerReflection) {
                if (!reflection.comment || !reflection.comment.hasTag("preferred")) {
                    if (!reflection.children || reflection.children.length === 0) {
                        if (!(reflection instanceof DeclarationReflection && reflection.exportOf)) {
                            context.removeReflection(reflection);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function removeEmptyList<T>(list: T[] | undefined, removeEmptyElement: (element: T) => boolean) {
            if (!list) return true;
            for (let i = list.length - 1; i >= 0; i--) {
                if (removeEmptyElement(list[i])) {
                    removeAt(list, i);
                }
            }
            return list.length === 0;
        }

        const project = context.project;
        if (this.excludeEmpty) {
            removeEmptyReflection(project);
            removeEmptyDirectory(project.directory);
            removeEmptyFiles(project.files);
        }
    }
}