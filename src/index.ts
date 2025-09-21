import estraverse from 'estraverse';
import esprima from 'esprima-next';
import escodegen from 'escodegen';
import postcss from 'postcss';
// @ts-ignore
import postcssMinify from 'postcss-minify';

import type {
    Program,
    Node,
    TaggedTemplateExpression,
    Identifier,
} from 'estree';

const postCssProcessor = postcss(postcssMinify());

export default function(source: string) {
    const parsedProgram = esprima.parse(source, {sourceType: "module"}) as Program;

    estraverse.replace(parsedProgram, {
        enter(node: Node, parent: Node | null) {
            if (node.type === "TaggedTemplateExpression") {
                const taggedNode = node as TaggedTemplateExpression;

                if (taggedNode.tag.type !== "Identifier")
                    return;

                const tagIdentifier = taggedNode.tag as Identifier;

                switch (tagIdentifier.name) {
                case "css":
                    node.quasi.quasis = node.quasi.quasis.map(q => {
                        q.value = {raw: postCssProcessor.process(q.value.raw).css.trim()};
                        return q;
                    });
                    break;
                case "html":
                    node.quasi.quasis = node.quasi.quasis.map(q => {
                        q.value = {
                            raw: q.value.raw.replace(/(\n\s+|\s+\n)/gm, '')
                        };
                        return q;
                    });
                }
            }

            return node;
        },
        fallback: "iteration"
    });

    return escodegen.generate(parsedProgram);
}

