// NOTE: The typing of these dependencies is a mess. Not sure anything can be done about it from my side.

import {parse} from "@babel/parser";
import generateModule from "@babel/generator";
import traverseModule, {NodePath} from "@babel/traverse";
import type {Identifier, TaggedTemplateExpression, TemplateElement} from "@babel/types";
import postcss from "postcss";
// @ts-ignore
import postcssMinify from "postcss-minify";

const traverse = (traverseModule as any).default ?? (traverseModule as unknown as Function);
const generate = (generateModule as any).default ?? (generateModule as unknown as Function);

const postCssProcessor = postcss(postcssMinify());

export default function(source: string) {
    const fileAst = parse(source, {
        sourceType: "module",
    });

    traverse(fileAst as any, {
        TaggedTemplateExpression(path: NodePath<TaggedTemplateExpression>) {
            const {node} = path;
            if (node.tag.type !== "Identifier")
                return;

            const name = (node.tag as Identifier).name;
            if (name !== "css" && name !== "html")
                return;

            // TODO: I believe there is a problem with the trimming around expressions. Fix later?
            node.quasi.quasis = node.quasi.quasis.map((q: TemplateElement) => {
                const raw = q.value.raw || "";
                const min = name === "css"
                    ? postCssProcessor.process(raw).css.trim()
                    : raw.replace(/(\n\s+|\s+\n)/gm, "")
                ;
                // Update both raw and cooked so generator emits desired text
                q.value.raw = min;
                // cooked can be null in Babel types; ensure it's a string here
                (q.value as any).cooked = min;

                return q;
            });
        },
    });

    const {code} = generate(fileAst as any, {comments: true});
    return code;
}
