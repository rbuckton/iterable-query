import * as fs from "fs";
import * as path from "path";
import { RendererComponent, Component } from "typedoc/dist/lib/output/components";
import { Option, writeFile } from "typedoc/dist/lib/utils";
import { ParameterType } from "typedoc/dist/lib/utils/options/declaration";
import { ComponentHost } from "typedoc/dist/lib/utils/component";
import { Renderer } from "typedoc";
import { RendererEvent } from "typedoc/dist/lib/output/events";

@Component({
    name: "no-jekyll",
})
export class NoJekyllPlugin extends RendererComponent {
    @Option({
        name: "noJekyll",
        help: "Generates a .nojekyll file as part of the output",
        type: ParameterType.Boolean
    })
    noJekyll!: boolean;

    constructor(owner: ComponentHost) {
        if (!(owner instanceof Renderer)) throw new TypeError();
        super(owner);
    }

    initialize() {
        super.initialize();
        this.listenTo(this.owner, RendererEvent.END, this.onEnd);
    }

    private onEnd(event: RendererEvent) {
        if (this.noJekyll) {
            const filename = path.resolve(event.outputDirectory, ".nojekyll");
            try {
                writeFile(filename, "", /*writeByteOrderMark*/ false);
            }
            catch (e) {
                this.application.logger.error("Could not write file %s", filename);
            }
        }
    }
}