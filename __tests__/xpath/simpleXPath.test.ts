import {XmlDocument} from 'xmldoc';
import {Evaluator} from '../../src/xpath/simpleXPath';

describe('simpleXPath', () => {
    describe('Evaluator', () => {
        const doc = new XmlDocument('' +
            '<root>' +
            ' <subnode>' +
            '  <node id="1">text1</node>' +
            '  <node id="2">text2</node>' +
            ' </subnode>' +
            ' <subnode>' +
            '  <node id="3">text3</node>' +
            '  <node id="4">text4</node>' +
            ' </subnode>' +
            '</root>');

        const evaluator = new Evaluator(doc);

        describe('evalNodeSet', () => {
            it('should get root', () => {
                const r = evaluator.evalNodeSet('/root');
                expect(r).toEqual([doc]);
            });
            it('should get simple set', () => {
                const r = evaluator.evalNodeSet('/root/subnode/node[2]');
                expect(r).toHaveLength(2);
                expect(r).toMatchSnapshot();
            });
            it('should get wildcard', () => {
                const mixedDoc = new XmlDocument('' +
                    '<root>' +
                    ' <subnode>' +
                    '  <node id="1">text1</node>' +
                    '  <anotherNode id="2">text2</anotherNode>' +
                    ' </subnode>' +
                    ' <anotherSubnode>' +
                    '  <node id="3">text3</node>' +
                    '  <node id="4">text4</node>' +
                    ' </anotherSubnode>' +
                    '</root>');
                const mixedEvaluator = new Evaluator(mixedDoc);
                const r = mixedEvaluator.evalNodeSet('/root/*/node');
                expect(r).toHaveLength(3);
                expect(r).toMatchSnapshot();
            });
            it('should work with starts-with', () => {
                const mixedDoc = new XmlDocument('' +
                    '<root>' +
                    ' <subnode>' +
                    '  <node id="a1">text1</node>' +
                    '  <node id="a2">text2</node>' +
                    ' </subnode>' +
                    ' <anotherSubnode>' +
                    '  <node id="a3">text3</node>' +
                    '  <node id="Z4">text4</node>' +
                    ' </anotherSubnode>' +
                    '</root>');
                const mixedEvaluator = new Evaluator(mixedDoc);
                const r = mixedEvaluator.evalValues('/root/*/node[starts-with(@id,"a")]/@id');
                expect(r).toEqual(['a1', 'a2', 'a3']);
            });
        });
        describe('evalValue', () => {
            it('should evaluate simple values', () => {
                const r = evaluator.evalValues('/root/subnode/node/@id');
                expect(r).toEqual(['1', '2', '3', '4']);
            });
            it('should evaluate text values', () => {
                const r = evaluator.evalValues('/root/subnode[1]/node');
                expect(r).toEqual(['text1', 'text2']);
            });
            it('should omit empty values', () => {
                const mixedDoc = new XmlDocument('' +
                    '<root>' +
                    ' <subnode>' +
                    '  <node id="1">text1</node>' +
                    '  <anotherNode id="2">text2</anotherNode>' +
                    ' </subnode>' +
                    ' <anotherSubnode>' +
                    '  <node>text3</node>' +
                    '  <node id="4">text4</node>' +
                    ' </anotherSubnode>' +
                    '</root>');
                const mixedEvaluator = new Evaluator(mixedDoc);
                const r = mixedEvaluator.evalValues('/root/*/node/@id');
                expect(r).toEqual(['1', '4']);
            });
        });
    });
});