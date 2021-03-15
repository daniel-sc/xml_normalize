![npm](https://img.shields.io/npm/v/xml_normalize)
[![Coverage Status](https://coveralls.io/repos/github/daniel-sc/xml_normalize/badge.svg?branch=main)](https://coveralls.io/github/daniel-sc/xml_normalize?branch=main)

# XML Normalize

This program allows normalizing arbitrary xml files.
Normalization can be configured:

* sort sibling elements based on some attribute value
* remove unwanted nodes
* trim texts
* normalize whitespaces/line breaks

This can be used as a post-/pre-processing step to keep diffs small for generated xml files.

## Usage

Execute with NodeJS:

```text
Usage: npx xml_normalize [options]

Options:
  -i, --input-file <inputFile>    input file
  -o, --output-file <outputFile>  output file - if not provided result is printed to stdout
  -s, --sort-path <sortPath>      path to sort of form: "ROOT.ELEMENT[].SUB_ELEMENT[INDEX]@ATTRIBUTE" - e.g. "html.head[0].script@src"
  -r, --remove-path <removePath>  path to remove elements: "ROOT.SUB_ELEMENT[0].SUB_SUB_ELEMENT[]" - e.g. "html.head[].script[]"
  -t, --trim                      Trim the whitespace at the beginning and end of text nodes (trims only pure text nodes) (default: true)
  -tf, --trim-force               Trim the whitespace at the beginning and end of text nodes (trims as well text adjacent to nested nodes). Implies -t (default: false)
  -a, --attribute-trim            Trim the whitespace at the beginning and end of attribute values (default: true)
  -n, --normalize-whitespace      Trim whitespaces inside text nodes and attribute values (implies -t and -a) (default: false)
  -d, --debug                     enable debug output (default: false)
  -h, --help                      display help for command
```
