import { PluginHost } from "typedoc/dist/lib/utils";
import { CustomPlugin } from "./plugin";
import { ContextAwareRendererComponent, Component } from "typedoc/dist/lib/output/components";
import * as Handlebars from "handlebars";

function main(host: PluginHost) {
    const app = host.owner;
    app.converter.addComponent('iterable-query-custom', CustomPlugin as any);
}

export = main;