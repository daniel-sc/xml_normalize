![npm](https://img.shields.io/npm/v/xml_normalize)


# XML Normalize

This program allows normalizing arbitrary xml files by:

* sort sibling elements based on some attribute value
* remove unwanted nodes

This can be used as a post-/pre-processing step to keep diffs small for generated xml files.

## Usage

Execute with NodeJS:

```text
Usage: index [options]

Options:
  -i, --input-file <inputFile>    input file
  -o, --output-file <outputFile>  output file - if not provided result is printed to stdout
  -s, --sort-path <sortPath>      path to sort of form: "ELEMENT.SUB_ELEMENT[INDEX].ATTRIBUTE" - e.g. "html.head[0].script.src"
  -r, --remove-path <removePath>  path to remove elements: "ELEMENT.SUB_ELEMENT[].SUB_SUB_ELEMENT" - e.g. "html.head[].script"
  -t, --trim                      Trim the whitespace at the beginning and end of text nodes (default: true)
  -d, --debug                     enable debug output (default: false)
  -h, --help                      display help for command
```
