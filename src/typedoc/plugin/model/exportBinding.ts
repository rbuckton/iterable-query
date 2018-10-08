import { Reflection, DeclarationReflection } from "typedoc";

export class ExportBinding {
    name: string;
    symbolID?: number;
    reflection?: Reflection;
    isExportStar?: boolean;

    constructor(name: string, symbolID?: number, reflection?: Reflection) {
        this.name = name;
        this.symbolID = symbolID;
        this.reflection = reflection;
    }

    toObject() {
        const result = {} as any;
        result.name = this.name;
        if (this.reflection) result.id = this.reflection.id;
        return result;
    }

    toString() {
        return this.reflection ? this.reflection.name : this.name;
    }
}
