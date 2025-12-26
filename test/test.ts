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
    output.includes("html`<div> Test </div>`"),
    'Output should contain minified HTML inside html`` template.'
);

const multiLineInput = [
    "import {html} from 'lit';",
    "const tpl = html`",
    '  <div',
    '    class="foo',
    'bar">',
    "    Test",
    "  </div>",
    "`;",
].join('\n');

const multiLineOutput = minify(multiLineInput);

assert(
    multiLineOutput.includes('html`<div class="foobar"> Test </div>`'),
    'Output should contain minified HTML with multi-line attributes.'
);

console.log('All tests passed.');
