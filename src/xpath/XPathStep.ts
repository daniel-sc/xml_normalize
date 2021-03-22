import {parseXPath, XPath} from './XPath';

export type Axis = 'attribute' | 'child' | 'parent' | 'self';

export type Predicate = number | PredicateFunction;

type FunctionName = 'starts-with' | 'contains';

export interface PredicateFunction {
    functionName: FunctionName;
    params: (string | XPath)[];
}

export interface XPathStep {
    axis: Axis;
    nodeTest?: string;
    predicate?: Predicate;
}

function parsePredicate(str: string | undefined): Predicate | undefined {
    if (str) {
        if (str.match(/^\d+$/)) {
            return parseInt(str);
        } else {
            const functionName = str.substring(0, str.indexOf('(')) as FunctionName;
            const paramsStr = str.substring(functionName.length + 1, str.length - 1);
            // assume params do not contain commas (","):
            const params = paramsStr.split(',').map(p => {
                const matchString = p.match(/^\s*"(.*)"\s*$/);
                if (matchString) {
                    return matchString[1];
                } else {
                    return parseXPath(p.trim());
                }
            });
            return {functionName, params};
        }
    } else {
        return undefined;
    }
}


export function parseXPathStep(step: string): XPathStep {
    const predicateStart = step.indexOf('[');
    const stepWithoutPredicate = predicateStart >= 0 ? step.substr(0, predicateStart) : step;
    const predicateString = predicateStart >= 0 ? step.substring(predicateStart + 1, step.length - 1) : undefined;
    let axis: Axis;
    let nodeTest: string | undefined;
    if (step.startsWith('@')) {
        axis = 'attribute';
        nodeTest = stepWithoutPredicate.substr(1);
    } else if (step.startsWith('..')) {
        axis = 'parent';
    } else if (step.startsWith('.')) {
        axis = 'self';
    } else {
        axis = 'child';
        nodeTest = stepWithoutPredicate;
    }

    const predicate = parsePredicate(predicateString);
    return {axis, nodeTest, predicate};
}