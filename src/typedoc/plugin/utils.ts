import "./augmentations";
import { Reflection, DeclarationReflection, ContainerReflection } from "typedoc/dist/lib/models";
import { GroupPlugin, CategoryPlugin } from "typedoc/dist/lib/converter/plugins";

export function renameReflection_(reflection: Reflection, name: string) {
    if (name !== reflection.name) {
        const oldName = reflection.name;
        reflection.name = name;
        if (reflection instanceof DeclarationReflection) {
            for (const signature of reflection.getAllSignatures()) {
                if (signature.name = oldName) signature.name = name;
            }
        }
        return true;
    }
    return false;
}

export function updateReflectionParent_(reflection: Reflection) {
    const parent = reflection.parent;
    if (parent instanceof ContainerReflection) {
        if (parent.children && parent.children.length > 1) {
            parent.children.sort(GroupPlugin.sortCallback);
            parent.groups = GroupPlugin.getReflectionGroups(parent.children);
            parent.categories = CategoryPlugin.getReflectionCategories(parent.children);
            if (parent.categories && parent.categories.length > 1) {
                parent.categories.sort(CategoryPlugin.sortCatCallback);
            }
        }
        else {
            parent.groups = [];
            parent.categories = [];
        }
    }
}

export function removeAt<T>(array: T[], index: number) {
    if (index < 0 || index >= array.length) return false;
    while (index < array.length - 1) {
        array[index++] = array[index];
    }
    array.length--;
    return true;
}

export function remove<T>(array: T[], value: T) {
    return removeAt(array, array.indexOf(value));
}

export function removeWhere<T>(array: T[], filter: (value: T) => boolean) {
    const indices: number[] = [];
    for (let i = 0; i < array.length; i++) {
        if (filter(array[i])) indices.push(i);
    }
    if (indices.length) {
        do {
            removeAt(array, indices.pop()!);
        }
        while (indices.length);
        return true;
    }
    return false;
}

export function deleteWhere<K extends string, V>(record: Record<K, V>, filter: (value: V, key: K) => boolean) {
    let deletedAny = false;
    for (let key in record) {
        if (!record.hasOwnProperty(key)) {
            continue;
        }
        if (filter(record[key], key)) {
            delete record[key];
            deletedAny = true;
            continue;
        }
    }
    return deletedAny;
}

export function isEmptyObject(record: object) {
    for (let _ in record) return false;
    return true;
}