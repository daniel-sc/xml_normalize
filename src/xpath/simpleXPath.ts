import {XmlDocument, XmlElement, XmlNode} from 'xmldoc';
import {Predicate, XPathStep} from './XPathStep';
import {NodeSet, ValueSet} from './nodeSet';
import {parseXPath, XPath} from './XPath';


export class Evaluator {
    constructor(private readonly doc: XmlDocument) {
    }

    evalNodeSet(xpath: string, context: XmlElement = this.doc): NodeSet {
        return this.eval(context, parseXPath(xpath)) as NodeSet;
    }

    evalValues(xpath: string, context: XmlElement = this.doc): string[] {
        return this.evalValuesParsed(parseXPath(xpath), context);
    }

    private evalValuesParsed(path: XPath, context: XmlElement = this.doc): string[] {
        const result = (this.eval(context, path) as (XmlElement | string)[])
            .filter(v => v !== undefined);
        const first = result[0];
        if (typeof first === 'string' || first === undefined) {
            return result as string[];
        } else {
            return (result as NodeSet).map(n => n.val);
        }
    }

    private eval(context: XmlElement, path: XPath): NodeSet | ValueSet {
        let nodeSet: NodeSet | ValueSet = [context];
        path.steps.forEach((s, stepIndex) => {
                if (stepIndex === 0 && path.absolute) {
                    nodeSet = this.matchesNodeTest(context, s.nodeTest) && this.matchesPredicate(context, 0, s.predicate) ? [context] : [];
                } else if (stepIndex === path.steps.length - 1 && s.axis === 'attribute') {
                    nodeSet = (nodeSet as NodeSet).reduce((all, n, i) => {
                        return [...all, this.evalNodeSetStep(n, s) as string];
                    }, [] as ValueSet);
                } else {
                    nodeSet = (nodeSet as NodeSet).reduce((all, n, i) => {
                        return [...all, ...this.evalNodeSetStep(n, s) as NodeSet];
                    }, [] as NodeSet);
                }
            }
        );
        return nodeSet;
    }

    private evalNodeSetStep(n: XmlElement, s: XPathStep): NodeSet | string {
        switch (s.axis) {
            case 'self':
                return [n];
            case 'child':
                return (n.children
                    .filter(c => this.matchesNodeTest(c, s.nodeTest)) as XmlElement[])
                    .filter((c, i) => this.matchesPredicate(c, i, s.predicate));
            case 'attribute':
                return n.attr[s.nodeTest!];
        }
        throw new Error(`not supported: ${s.axis} ${(s.nodeTest)} ${s.predicate}`);
    }

    private matchesNodeTest(c: XmlNode, nodeTest: string | undefined) {
        return c.type === 'element' && (!nodeTest || nodeTest === '*' || nodeTest === c.name);
    }

    private matchesPredicate(c: XmlElement, index: number, predicate: Predicate | undefined): boolean {
        if (predicate === undefined) {
            return true;
        } else if (typeof predicate === 'number') {
            return index + 1 === predicate;
        } else {
            const paramsValues = predicate.params.map(p => typeof p === 'string' ? p : this.evalValuesParsed(p, c)[0]);
            switch (predicate.functionName) {
                case 'contains':
                    return paramsValues[0].includes(paramsValues[1]);
                case 'starts-with':
                    return paramsValues[0].startsWith(paramsValues[1]);
                default:
                    throw new Error(`not supported predicate: ${predicate}`);
            }
        }
    }

    * allChildren(el: XmlNode, includeEl = true): IterableIterator<XmlNode> {
        if (includeEl) {
            yield el;
        }
        if (el.type === 'element') {
            for (const c of el.children) {
                yield* this.allChildren(c, true);
            }
        }
    }


    getParent(r: XmlNode): XmlElement {
        // TODO use index?
        for (const n of this.allChildren(this.doc)) {
            if (n.type === 'element' && n.children.indexOf(r) >= 0) {
                return n;
            }
        }
        throw new Error('could not find parent for: ' + r);
    }

}