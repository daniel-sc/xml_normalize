import {getNestedAttributes, splitNameAndIndex, splitOnLast} from '../src/objectUtils';
import {XmlDocument} from 'xmldoc';

describe('objectUtils', () => {
    describe('splitOnLast', () => {
        test('regular split', () => {
            expect(splitOnLast('ab.cd.de', '.')).toEqual(['ab.cd', 'de']);
        });
    });

    describe('getNestedAttributes', () => {
        test('first level explicit index', () => {
            const doc = new XmlDocument('' +
                '<root>\n' +
                ' <subnode>\n' +
                '  <node id="2">text2</node>\n' +
                '  <node id="1">text1</node>\n' +
                ' </subnode>\n' +
                ' <subnode>\n' +
                '  <node id="3">text3</node>\n' +
                ' </subnode>\n' +
                '</root>');
            expect(getNestedAttributes(doc, 'subnode[0].node[]')).toHaveLength(2);
        });
        test('first level all index', () => {
            const doc = new XmlDocument('' +
                '<root>\n' +
                ' <subnode>\n' +
                '  <node id="2">text2</node>\n' +
                '  <node id="1">text1</node>\n' +
                ' </subnode>\n' +
                ' <subnode>\n' +
                '  <node id="3">text3</node>\n' +
                ' </subnode>\n' +
                '</root>');
            expect(getNestedAttributes(doc, 'subnode[].node[]')).toHaveLength(3);
        });
    });

    describe('splitNameAndIndex', () => {
        test('with index', () => {
            expect(splitNameAndIndex('test[3]')).toEqual(['test', 3]);
        });
        test('with all index', () => {
            expect(splitNameAndIndex('test[]')).toEqual(['test', null]);
        });
        test('with implicit 0 index', () => {
            expect(splitNameAndIndex('test')).toEqual(['test', 0]);
        });
    });
});

