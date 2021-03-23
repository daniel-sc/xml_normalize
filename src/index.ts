#!/usr/bin/env node

import * as fs from 'fs';

import {Command} from 'commander';
import {xmlNormalize} from './xmlNormalize';

const options = new Command()
    .requiredOption('-i, --input-file <inputFile>', 'input file')
    .option('-o, --output-file <outputFile>', 'output file - if not provided result is printed to stdout')
    .option('-r, --remove-path <removePath...>', 'simple XPath(s) to remove elements - e.g. "/html/head[1]/script"')
    .option('-s, --sort-path <sortPath>', 'simple XPath that references an attribute to sort - e.g. "/html/head[1]/script/@src"')
    .option('--no-pretty', 'Disable pretty format output')
    .option('--no-trim', 'Disable trimming of whitespace at the beginning and end of text nodes (trims only pure text nodes)')
    .option('--no-attribute-trim', 'Disable trimming whitespace at the beginning and end of attribute values')
    .option('-tf, --trim-force', 'Trim the whitespace at the beginning and end of text nodes (trims as well text adjacent to nested nodes)')
    .option('-n, --normalize-whitespace', 'Normalize whitespaces inside text nodes and attribute values')
    .option('-d, --debug', 'enable debug output')
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


