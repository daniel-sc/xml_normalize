import {parseXPath} from '../../src/xpath/XPath';
import {XPathStep} from '../../src/xpath/XPathStep';

describe('XPath', () => {
    describe('parseXPath', () => {
        it('should parse', () => {
            const expectedSteps: XPathStep[] = [
                {axis: 'child', nodeTest: 'root'},
                {axis: 'child', nodeTest: 'subnode', predicate: 1},
                {
                    axis: 'child',
                    nodeTest: 'node',
                    predicate: {
                        functionName: 'contains',
                        params: [{absolute: false, steps: [{axis: 'attribute', nodeTest: 'id'}]}, 'test']
                    }
                },
                {axis: 'attribute', nodeTest: 'id'},
            ];
            expect(parseXPath('/root/subnode[1]/node[contains(@id, "test")]/@id'))
                .toEqual({
                    absolute: true, steps: expectedSteps
                });
        });
    });
});