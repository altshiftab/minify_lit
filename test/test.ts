import {strict as assert} from 'node:assert';
import minify from '../dist/index.js';

const input = [
    "import {css, html} from 'lit';",
    "const styles = css`",
    "  .a { color: red; }",
    "`;",
    "const styles2 = css`",
    '  .b { color: ${"black"}; }',
    "`;",
    "const tpl = html`",
    "  <div>",
    "    Test",
    "  </div>",
    "`;",
].join('\n');

const output = minify(input);

assert(
    output.includes("css`.a{color:red}`"),
    'Output should contain minified CSS inside css`` template.'
);

assert(
    output.includes('css`.b{color:${"black"}}`'),
    'Output should contain minified CSS inside css`` template.'
);


assert(
    output.includes("html`<div>Test</div>`"),
    'Output should contain minified HTML inside html`` template.'
);

console.log('All tests passed.');
