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

            // TODO: Support `svg`?
            switch ((node.tag as Identifier).name) {
                case "css":
                    const PLACEHOLDER = "@TEMPLATE_EXPRESSION"

                    const split = postCssProcessor.process(
                        node.quasi.quasis.map(q => q.value.raw ?? "").join(PLACEHOLDER)
                    ).css.trim().split(PLACEHOLDER);

                    node.quasi.quasis = node.quasi.quasis.map((q: TemplateElement, i: number) => {
                        const min = split[i] ?? "";
                        q.value.raw = min;
                        (q.value as any).cooked = min;
                        return q;
                    });

                    break;
                case "html":
                    node.quasi.quasis = node.quasi.quasis.map((q: TemplateElement, i: number) => {
                        const raw = q.value.raw || "";
                        let min = raw.replace(/"[^"]*"|'[^']*'|`[^`]*`/g, (match) => match.replace(/[\n\r]/g, '')).replace(/\s+/g, ' ');

                        if (i === 0)
                            min = min.trimStart();

                        if (i === node.quasi.quasis.length - 1)
                            min = min.trimEnd();

                        q.value.raw = min;
                        (q.value as any).cooked = min;

                        return q;
                    });
                    break;
                default:
                    return;

            }
        },
    });

    const {code} = generate(fileAst as any, {comments: true});
    return code;
}
