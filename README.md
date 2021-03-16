[![npm](https://img.shields.io/npm/v/xml_normalize)](https://www.npmjs.com/package/xml_normalize)
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
  --no-pretty                     Disable pretty format output
  --no-trim                       Disable trimming of whitespace at the beginning and end of text nodes (trims only pure text nodes)
  --no-attribute-trim             Disable trimming whitespace at the beginning and end of attribute values
  -tf, --trim-force               Trim the whitespace at the beginning and end of text nodes (trims as well text adjacent to nested nodes)
  -n, --normalize-whitespace      Normalize whitespaces inside text nodes and attribute values
  -d, --debug                     enable debug output
  -h, --help                      display help for command
```

## Options and Examples

### Sorting

Allows to sort siblings at a specific path 
with the same tag name lexicographically
based on a specific attribute value.

Example:

```xml
<root>
  <node>
    <child id="z">should be last</child>
    <child id="a">should be first</child>
  </node>
  <node>
    <child id="y">should be last</child>
    <child id="b">should be first</child>
  </node>
</root>
```

`npx xml_normalize -s root.node[].child@id` will create:

```xml
<root>
  <node>
    <child id="a">should be first</child>
    <child id="z">should be last</child>
  </node>
  <node>
    <child id="b">should be first</child>
    <child id="y">should be last</child>
  </node>
</root>
```

### Removing

Allows to remove nodes in a specific path.


Example:

```xml
<root>
  <node>
    <child id="z">should be removed</child>
    <child id="a">should be removed</child>
  </node>
  <node>
    <child id="y">should stay</child>
    <child id="b">should stay</child>
  </node>
</root>
```

`npx xml_normalize -r root.node[0].child[]` will create:

```xml
<root>
  <node/>
  <node>
    <child id="b">should stay</child>
    <child id="y">should stay</child>
  </node>
</root>
```

`npx xml_normalize -r root.node[].child[]` instead will create:

```xml
<root>
  <node/>
  <node/>
</root>
```

### Normalize whitespace

This option replaces any number of consecutive whitespace, tab, new line characters with a single whitespace (in text nodes).

Example:

```xml
<root>
  <node>
    <child id="z">some    xml
    has messed up 
    formatting
    </child>
      
      
    <child id="sometimes      even attributes are messed 
    up">some more     mess</child>
  </node>
</root>
```

`npx xml_normalize --normalize-whitespace` will create:

```xml
<root>
  <node>
    <child id="z">some xml has messed up formatting</child>
    <child id="sometimes even attributes are messed up">some more mess</child>
  </node>
</root>
```


### Paths for sorting and removing

Paths are of the form

```
ROOT.NODE_NAME[INDEX].ANOTHER_NODE[]
```

So specific children can be accessed by index (`[INDEX]`),
or all children with a given tag name can be referred (`[]`).
Instead of `NODE[0]` the shortcut `NODE` can be used.

## What is this good for?

This helps to bring xml in a standardized form,
so that changes can easily be spotted in diff tool or git pull request.

For example, you could run it as a post processing/pre commit script when re-generating XLIFF translation files 
(or getting them back from your beloved translator in a messed up form).

## Contribute

PRs always welcome :-)