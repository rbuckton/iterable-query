import "source-map-support/register";
import { PluginHost } from "typedoc/dist/lib/utils";
import { ExportDeclarationConverter } from "./nodes/exportDeclaration";
import { ReflectionEventsPlugin } from "./plugins/reflectionEvents";
import { ExcludeEmptyPlugin } from "./plugins/excludeEmpty";
import { StripInternalPlugin } from "./plugins/stripInternal";
import { ExportsPlugin } from "./plugins/exports";
import { UncategorizedPlugin } from "./plugins/uncategorized";
import { GroupCategoriesPlugin } from "./plugins/groupCategories";
import { MergePlugin } from "./plugins/merge";
import { NamingPlugin } from "./plugins/naming";
import { BiblioPlugin } from "./plugins/biblio";
import { NoJekyllPlugin } from "./plugins/noJekyll";

function load(host: PluginHost) {
    const app = host.owner;
    app.converter.addComponent("reflectionEvents", ReflectionEventsPlugin);
    app.converter.addComponent("excludeEmpty", ExcludeEmptyPlugin);
    app.converter.addComponent("stripInternal", StripInternalPlugin);
    app.converter.addComponent("exports", ExportsPlugin);
    app.converter.addComponent("uncategorized", UncategorizedPlugin);
    app.converter.addComponent("groupCategories", GroupCategoriesPlugin);
    app.converter.addComponent("merge", MergePlugin);
    app.converter.addComponent("naming", NamingPlugin);
    app.converter.addComponent("biblio", BiblioPlugin);
    app.converter.addComponent("node:exportDeclaration", ExportDeclarationConverter);
    app.renderer.addComponent("no-jekyll", NoJekyllPlugin);
}

export = load;