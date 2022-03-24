import {XmlElement} from 'xmldoc';

export function splitOnLast(str: string, sep: string): [first: string, rest: string] {
    const indexOfLast = str.lastIndexOf(sep);
    return [str.substr(0, indexOfLast), str.substr(indexOfLast + sep.length)];
}

export function splitNameAndIndex(nameAndOptionalIndex: string): [name: string, index: number | null] {
    const match = nameAndOptionalIndex.match(/^(.+)\[(\d*)]$/);
    if (!match) { // implicit 0 index
        return [nameAndOptionalIndex, 0];
    } else {
        return [match[1], match.length > 2 && match[2] !== '' && match[2] !== undefined ? parseInt(match[2]) : null];
    }
}

/**
 *
 * @param obj
 * @param path must not include tag name of top level element (obj)
 */
export function getNestedAttributes(obj: XmlElement, path: string): XmlElement[] {
    console.debug(`getNestedAttributes path=${path}`);
    return path
        .split('.')
        .filter(part => !!part)
        .reduce(((previousValue, currentValue) => {
            console.debug(`considering part=${currentValue}`);
            const [tagName, nodeIndex] = splitNameAndIndex(currentValue);
            console.debug(`tagName=${tagName} nodeIndex=${nodeIndex}`);
            if (nodeIndex !== null && nodeIndex !== undefined) {
                return previousValue.map(o => o.childrenNamed(tagName)[nodeIndex])
            } else {
                return previousValue.reduce((all, curr) => [...all, ...curr.childrenNamed(tagName)], [] as XmlElement[]);
            }
        }), [obj] as XmlElement[])
}
