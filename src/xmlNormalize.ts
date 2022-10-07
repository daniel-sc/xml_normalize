import {XmlDocument, XmlElement, XmlNode, XmlTextNode} from 'xmldoc';
import {splitOnLast} from './objectUtils';
import {Evaluator} from './xpath/simpleXPath';

export interface XmlNormalizeOptions {
    in: string;
    sortPath?: string;
    removePath?: string[];
    /** default: `false` */
    debug?: boolean;
    /** default: `true` */
    trim?: boolean;
    /** default: `false` */
    trimForce?: boolean;
    /** default: `true` */
    attributeTrim?: boolean;
    /** default: `false` */
    normalizeWhitespace?: boolean;
    /** default: `true` */
    pretty?: boolean;
}

function trimTextNodes(doc: XmlDocument, trim: boolean, trimMixed: boolean, normalize: boolean): XmlDocument {
    for (const docElement of new Evaluator(doc).allChildren()) {
        if (docElement.type === 'element') {
            docElement.children.forEach(((value, index, arr) => {
                if (value.type === 'text') {
                    if (normalize) {
                        value.text = value.text.replace(/\s{2,}/g, ' ');
                    }
                    if (trim && !isWhiteSpace(value)) {
                        if (trimMixed || index === 0 || arr[index - 1].type !== 'element') {
                            value.text = value.text.trimStart();
                        }
                        if (trimMixed || index === arr.length - 1 || arr[index + 1].type !== 'element') {
                            value.text = value.text.trimEnd();
                        }
                    }
                }
            }));
        }
    }
    return doc;
}

function trimAttributeValues(doc: XmlDocument, normalize: boolean) {
    for (const docElement of new Evaluator(doc).allChildren()) {
        if (docElement.type === 'element') {
            Object.keys(docElement.attr)
                .forEach(attrName => {
                    if (normalize) {
                        docElement.attr[attrName] = docElement.attr[attrName].trim().replace(/\s+/g, ' ');
                    } else {
                        docElement.attr[attrName] = docElement.attr[attrName].trim();
                    }
                });
        }
    }
    return doc;
}

function addPrettyWhitespace(doc: XmlElement, indent: number) {
    // skip if mixed text and nodes:
    if (doc.children.some(c => c.type === 'text')) {
        return;
    }

    if (doc.children.length) {
        for (let i = doc.children.length - 1; i >= 0; i--) {
            doc.children.splice(i, 0, createTextNode('\n' + '  '.repeat(indent + 1)))
        }
        doc.children.push(createTextNode('\n' + '  '.repeat(indent)));
        doc.firstChild = doc.children[0];
        doc.lastChild = doc.children[doc.children.length - 1];

        doc.children.forEach(c => c.type === 'element' ? addPrettyWhitespace(c, indent + 1) : null);
    }

}

function pretty(doc: XmlDocument) {
    // remove all whitespace text:
    for (const node of new Evaluator(doc).allChildren()) {
        // skip if mixed text and nodes:
        if (node.type === 'element' && node.children.every(n => isWhiteSpace(n) || n.type !== 'text')) {
            removeChildren(node, ...node.children.filter(c => isWhiteSpace(c)));
        }
    }
    addPrettyWhitespace(doc, 0);
    return doc;
}

/** workaround as XmlTextNode is not exported */
function createTextNode(str: string): XmlTextNode {
    return new XmlDocument(`<root>${str}</root>`).firstChild as XmlTextNode;
}

export function xmlNormalize(options: XmlNormalizeOptions) {
    let doc = new XmlDocument(options.in);
    console.debug(`parsed: ${doc.toString({preserveWhitespace: true, compressed: true, html: false})}`);

    // console.debug(`parsed: ${util.inspect(inParsed, false, null)}`);

    options.removePath?.forEach(removePath => doc = remove(doc, removePath));

    if (options.sortPath) {
        const [sortP, sortAttr] = splitOnLast(options.sortPath, '/@');
        doc = sort(doc, sortP, sortAttr);
    }

    if ((options.trim ?? true) || (options.trimForce ?? false) || (options.normalizeWhitespace ?? false)) {
        doc = trimTextNodes(doc, options.trim ?? true, options.trimForce ?? false, options.normalizeWhitespace ?? false);
    }

    if ((options.attributeTrim ?? true) || (options.normalizeWhitespace ?? false)) {
        doc = trimAttributeValues(doc, options.normalizeWhitespace ?? false);
    }

    if (options.pretty ?? true) {
        doc = pretty(doc);
    }

    const xmlDecMatch = options.in.match(/^<\?xml [^>]*>\s*/i);
    const xmlDeclaration = xmlDecMatch ? xmlDecMatch[0] : '';

    return xmlDeclaration + doc.toString({preserveWhitespace: true, compressed: true});
}


function sort(parsed: XmlDocument, sortPath: string, sortAttribute: string) {
    console.debug('sortAttribute: ', sortAttribute);
    const evaluator = new Evaluator(parsed);
    const sortElements = new Set<XmlElement>(evaluator.evalNodeSet(sortPath));
    const parents = new Set<XmlElement>([...sortElements].map(s => evaluator.getParent(s)));
    if (!parents.size) {
        console.warn(`sort path not found!`);
        return parsed;
    }
    parents.forEach(parent => {
        const doNotSortNodesWithIndex = parent.children.map((e, i) => ({
            index: i,
            el: e
        })).filter(x => x.el.type !== 'element' || !sortElements.has(x.el));
        parent.children = parent.children.filter(e => e.type === 'element' && sortElements.has(e));
        parent.children.sort((a, b) => {
            if (a.type === 'element' && b.type === 'element') {
                return a.attr[sortAttribute].localeCompare(b.attr[sortAttribute]);
            } else {
                return 0; // cannot happen
            }
        });
        doNotSortNodesWithIndex.forEach(nodeWithIndex => parent.children.splice(nodeWithIndex.index, 0, nodeWithIndex.el));
        console.debug('sorted: ' + parent.children)
        parent.firstChild = parent.children[0];
        parent.lastChild = parent.children[parent.children.length - 1];
    });
    return parsed;
}

/**
 * Automatically removes whitespace text nodes before children.
 *
 * @param node
 * @param children
 */
function removeChildren(node: XmlElement, ...children: XmlNode[]): void {
    const removeIndexes = new Set<number>(node.children.map((c, i) => children.indexOf(c) >= 0 ? i : null).filter(x => x !== null) as number[]);
    console.debug('remove indexes: ' + removeIndexes);
    node.children = node.children.filter((c, i) => !removeIndexes.has(i) && (!removeIndexes.has(i + 1) || !isWhiteSpace(c)));
    if (node.children.length === 1 && isWhiteSpace(node.children[0])) {
        node.children = [];
    }
    node.firstChild = node.children[0];
    node.lastChild = node.children[node.children.length - 1];
}

function isWhiteSpace(node: XmlNode): boolean {
    return node.type === 'text' && !!node.text.match(/^\s*$/);
}

function remove(parsed: XmlDocument, removePath: string) {
    const evaluator = new Evaluator(parsed);
    const removeElements = evaluator.evalNodeSet(removePath);
    removeElements.forEach(r => {
        const parent = evaluator.getParent(r);
        removeChildren(parent, r)
    });
    return parsed;
}
