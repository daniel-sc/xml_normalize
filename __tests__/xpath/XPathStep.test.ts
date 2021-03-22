import {parseXPathStep, XPathStep} from '../../src/xpath/XPathStep';

describe('XPathStep', () => {
    describe('parseXPathStep', () => {
        it('should parse simple node step', () => {
            expect(parseXPathStep('node')).toEqual({axis: 'child', nodeTest: 'node'});
        });
        it('should parse simple attribute step', () => {
            expect(parseXPathStep('@attr')).toEqual({axis: 'attribute', nodeTest: 'attr'});
        });
        it('should parse simple parent step', () => {
            expect(parseXPathStep('..')).toEqual({axis: 'parent'});
        });
        it('should parse simple self step', () => {
            expect(parseXPathStep('.')).toEqual({axis: 'self'});
        });
        it('should parse node step with index predicate', () => {
            expect(parseXPathStep('node[1]')).toEqual({axis: 'child', nodeTest: 'node', predicate: 1});
        });
        it('should parse node step with function predicate', () => {
            const expectedStep: XPathStep = {
                axis: 'child',
                nodeTest: 'node',
                predicate: {
                    functionName: 'contains',
                    params: [{absolute: false, steps: [{axis: 'attribute', nodeTest: 'id'}]}, 'test']
                }
            };
            expect(parseXPathStep('node[contains(@id, "test")]')).toEqual(expectedStep);
        });
    });
});