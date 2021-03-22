import {parseXPathStep, XPathStep} from './XPathStep';

export interface XPath {
    absolute: boolean;
    steps: XPathStep[];
}

export function parseXPath(xpath: string): XPath {
    return {
        absolute: xpath.startsWith('/'),
        steps: xpath.split('/')
            .filter((step, i) => i > 0 || !!step) // skip first for absolute paths
            .map(step => parseXPathStep(step))
    };
}
