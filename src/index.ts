#!/usr/bin/env node

import * as fs from 'fs';

import {Command} from 'commander';
import {xmlNormalize} from './xmlNormalize';

const options = new Command()
    .requiredOption('-i, --input-file <inputFile>', 'input file')
    .option('-o, --output-file <outputFile>', 'output file - if not provided result is printed to stdout')
    .option('-s, --sort-path <sortPath>', 'path to sort of form: "ROOT.ELEMENT[].SUB_ELEMENT[INDEX]@ATTRIBUTE" - e.g. "html.head[0].script@src"')
    .option('-r, --remove-path <removePath>', 'path to remove elements: "ROOT.SUB_ELEMENT[0].SUB_SUB_ELEMENT[]" - e.g. "html.head[].script[]"')
    .option('-t, --trim', 'Trim the whitespace at the beginning and end of text nodes (trims only pure text nodes)', true)
    .option('-tf, --trim-force', 'Trim the whitespace at the beginning and end of text nodes (trims as well text adjacent to nested nodes). Implies -t', false)
    .option('-a, --attribute-trim', 'Trim the whitespace at the beginning and end of attribute values', true)
    .option('-n, --normalize-whitespace', 'Normalize whitespaces inside text nodes and attribute values (implies -t and -a)', false)
    .option('-p, --pretty', 'Pretty format output', true)
    .option('-d, --debug', 'enable debug output', false)
    .parse()
    .opts();

if (!options.debug) {
    console.debug = () => null;
}

console.debug(`parsing ${(options.inputFile)}..`);
const inFileContent = fs.readFileSync(options.inputFile, {encoding: 'utf8'});

const outString = xmlNormalize({
    in: inFileContent,
    sortPath: options.sortPath,
    removePath: options.removePath,
    trim: options.trim,
    trimForce: options.trimForce,
    attributeTrim: options.attributeTrim,
    normalizeWhitespace: options.normalizeWhitespace,
    pretty: options.pretty
});

if (options.outputFile) {
    console.debug(`writing output to file ${(options.outputFile)}`);
    fs.writeFileSync(options.outputFile, '<?xml version="1.0" encoding="UTF-8"?>\n' + outString, {encoding: 'utf8'});
} else {
    console.log(outString);
}
console.debug('done')


