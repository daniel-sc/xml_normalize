import {Builder, Parser} from 'xml2js';
import * as fs from 'fs';
import * as util from 'util';

import {Command} from 'commander';
import {getNestedAttribute, getNestedAttributes, splitOnLast} from './objectUtils';
import * as os from 'os';

const program = new Command();
program
    .requiredOption('-i, --input-file <inputFile>', 'input file')
    .option('-o, --output-file <outputFile>', 'output file - if not provided result is printed to stdout')
    .option('-s, --sort-path <sortPath>', 'path to sort of form: "ELEMENT.SUB_ELEMENT[INDEX].ATTRIBUTE" - e.g. "html.head[0].script.src"')
    .option('-r, --remove-path <removePath>', 'path to remove elements: "ELEMENT.SUB_ELEMENT[].SUB_SUB_ELEMENT" - e.g. "html.head[].script"')
    .option('-t, --trim', 'Trim the whitespace at the beginning and end of text nodes', true)
    .option('-n, --normalize-whitespace', 'Trim whitespaces inside text nodes', false)
    .option('-d, --debug', 'enable debug output', false);

program.parse();
const options = program.opts();

if (!options.debug) {
    console.debug = () => null;
}

execute(options.inputFile, options.outputFile, options.sortPath, options.removePath, options.trim, options.normalizeWhitespace).then(() => console.debug('done'));

async function execute(inFilename: string, outFilename: string | undefined, sortPath: string | undefined, removePath: string | undefined, trim: boolean, normalizeWhitespace: boolean): Promise<void> {
    console.debug(`parsing ${inFilename}..`);
    const inFileContent = fs.readFileSync(inFilename, {encoding: 'utf8'});
    const parser = new Parser({trim, normalize: normalizeWhitespace});
    const inParsed = await parser.parseStringPromise(inFileContent);

    console.debug(`parsed: ${util.inspect(inParsed, false, null)}`);

    let sorted: any;
    if (sortPath) {
        const [sortP, sortAttr] = splitOnLast(sortPath, '.');
        sorted = sort(inParsed, sortP, sortAttr);
    } else {
        sorted = inParsed;
    }

    let removed: any;
    if (removePath) {
        removed = remove(sorted, removePath);
    } else {
        removed = sorted;
    }

    const builder = new Builder({
        xmldec: {'version': '1.0', 'encoding': 'UTF-8'},
        renderOpts: {pretty: true, indent: ' ', newline: os.EOL}
    });
    const outString = builder.buildObject(removed);

    if (outFilename) {
        console.debug(`writing output to file ${outFilename}`);
        fs.writeFileSync(outFilename, outString, {encoding: 'utf8'});
    } else {
        console.log(outString);
    }
}


function sort(parsed: any, sortPath: string, sortAttribute: string) {
    console.debug(`sorting path=${sortPath} attribute=${sortAttribute}`);
    const sortArray: any[] = getNestedAttribute(parsed, sortPath);
    console.debug(`sort: ${util.inspect(sortArray, false, null)}`);
    sortArray.sort((a, b) => `${a.$[sortAttribute]}`.localeCompare(`${b.$[sortAttribute]}`))
    console.debug(`sorted: ${util.inspect(sortArray, false, null)}`);
    return parsed;
}

function remove(parsed: any, removePath: string) {
    const [path, element] = splitOnLast(removePath, '.');
    console.debug(`removing path=${path} element=${element}`);
    const elements = getNestedAttributes(parsed, path);
    console.debug('elements: ' + util.inspect(elements, false, null));
    elements.forEach(e => delete e[element]);
    console.debug('elements deleted: ' + util.inspect(elements, false, null));
    return parsed;
}
