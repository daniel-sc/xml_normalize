import {xmlNormalize, XmlNormalizeOptions} from '../src/xmlNormalize';

const defaultOptions: Partial<XmlNormalizeOptions> = {pretty: false}

describe('xmlNormalize', () => {
    test('simple round trip', () => {
        expect(xmlNormalize({...defaultOptions, in: '<root><node>text</node><node>text2</node></root>'}))
            .toEqual('<root><node>text</node><node>text2</node></root>');
    });

    describe('sort', () => {
        test('simple sort', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                sortPath: 'root.subnode.node.id',
                in: '<root><subnode><node id="2">text2</node><node id="1">text1</node></subnode></root>'
            })).toEqual('<root><subnode><node id="1">text1</node><node id="2">text2</node></subnode></root>');
        });
        test('first level sort', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                sortPath: 'root.node.id',
                in: '<root><node id="2">text2</node><node id="1">text1</node></root>'
            })).toEqual('<root><node id="1">text1</node><node id="2">text2</node></root>');
        });
    });

    describe('remove', () => {
        test('simple remove', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                removePath: 'root.subnode[].node[]',
                in: '<root><subnode><node id="2">text2</node><node id="1">text1</node></subnode></root>'
            })).toEqual('<root><subnode/></root>');
        });
        test('remove multiple sub nodes', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                removePath: 'root.subnode[].node[]',
                in: '<root>' +
                    '<subnode>' +
                    '<node id="2">text2</node>' +
                    '<node id="1">text1</node>' +
                    '</subnode>' +
                    '<subnode>' +
                    '<node id="3">text3</node>' +
                    '</subnode>' +
                    '</root>'
            }).replace(/\s+/g, ''))
                .toEqual('<root><subnode/><subnode/></root>');
        });
        test('remove specific sub nodes', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                removePath: 'root.subnode[0].node[1]',
                in: '<root>' +
                    '<subnode>' +
                    '<node>text2</node>' +
                    '<node>text1</node>' +
                    '</subnode>' +
                    '<subnode>' +
                    '<node>text3</node>' +
                    '</subnode>' +
                    '</root>'
            }))
                .toEqual('<root>' +
                    '<subnode>' +
                    '<node>text2</node>' +
                    '</subnode>' +
                    '<subnode>' +
                    '<node>text3</node>' +
                    '</subnode>' +
                    '</root>');
        });
        test('remove specific sub nodes and whitespace', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                removePath: 'root.subnode[0].node[1]',
                in: '<root>\n' +
                    ' <subnode>\n' +
                    '  <node>text2</node>\n' +
                    '  <node>text1</node>\n' +
                    ' </subnode>\n' +
                    ' <subnode>\n' +
                    '  <node>text3</node>\n' +
                    ' </subnode>\n' +
                    '</root>'
            }))
                .toEqual('<root>\n' +
                    ' <subnode>\n' +
                    '  <node>text2</node>\n' +
                    ' </subnode>\n' +
                    ' <subnode>\n' +
                    '  <node>text3</node>\n' +
                    ' </subnode>\n' +
                    '</root>');
        });
        test('remove all sub nodes and whitespace', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                removePath: 'root.subnode[0].node[]',
                in: '<root>\n' +
                    ' <subnode>\n' +
                    '  <node>text2</node>\n' +
                    '  <node>text1</node>\n' +
                    ' </subnode>\n' +
                    ' <subnode>\n' +
                    '  <node>text3</node>\n' +
                    ' </subnode>\n' +
                    '</root>'
            }))
                .toEqual('<root>\n' +
                    ' <subnode/>\n' +
                    ' <subnode>\n' +
                    '  <node>text3</node>\n' +
                    ' </subnode>\n' +
                    '</root>');
        });
    });

    describe('trim', () => {
        test('should not trim when disabled', () => {
            expect(xmlNormalize({...defaultOptions, trim: false, in: '<root><node> a </node><node> b </node></root>'}))
                .toEqual('<root><node> a </node><node> b </node></root>');
        });
        test('should trim when enabled', () => {
            expect(xmlNormalize({...defaultOptions, trim: true, in: '<root><node> a </node><node> b </node></root>'}))
                .toEqual('<root><node>a</node><node>b</node></root>');
        });
    });
    describe('trim-force', () => {
        test('should not trim mixed when disabled', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                trim: true,
                trimForce: false,
                in: '<root><node> a </node><node> x <mixed> m </mixed></node></root>'
            }))
                .toEqual('<root><node>a</node><node>x <mixed>m</mixed></node></root>');
        });
        test('should trim mixed when enabled', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                trim: true,
                trimForce: true,
                in: '<root><node> a </node><node> x <mixed> m </mixed></node></root>'
            }))
                .toEqual('<root><node>a</node><node>x<mixed>m</mixed></node></root>');
        });
    });
    describe('trim-attributes', () => {
        test('should trim attributes', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                attributeTrim: true,
                in: '<root><node id=" a">a</node><node id="b ">x<mixed>m</mixed></node></root>'
            }))
                .toEqual('<root><node id="a">a</node><node id="b">x<mixed>m</mixed></node></root>');

        });
        test('should not trim attributes when disabled', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                trimForce: true,
                attributeTrim: false,
                in: '<root><node id=" a">a</node><node id="b ">x<mixed>m</mixed></node></root>'
            }))
                .toEqual('<root><node id=" a">a</node><node id="b ">x<mixed>m</mixed></node></root>');

        });
    });
    describe('normalize', () => {
        test('should normalize attributes', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                normalizeWhitespace: true,
                in: '<root><node id=" a   a">a</node><node id="b   b ">x<mixed>m</mixed></node></root>'
            }))
                .toEqual('<root><node id="a a">a</node><node id="b b">x<mixed>m</mixed></node></root>');

        });
        test('should not normalize attributes when disabled', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                attributeTrim: true,
                in: '<root><node id=" a  a">a</node><node id="b   b ">x<mixed>m</mixed></node></root>'
            }))
                .toEqual('<root><node id="a  a">a</node><node id="b   b">x<mixed>m</mixed></node></root>');

        });
        test('should normalize text', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                normalizeWhitespace: true,
                in: '<root><node> a  a</node><node> x  x <mixed>m  m</mixed></node></root>'
            }))
                .toEqual('<root><node>a a</node><node>x x <mixed>m m</mixed></node></root>');

        });
        test('should not normalize text when disabled', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                trim: true,
                in: '<root><node> a  a</node><node> x  x <mixed>m  m</mixed></node></root>'
            }))
                .toEqual('<root><node>a  a</node><node>x  x <mixed>m  m</mixed></node></root>');

        });
    });

    describe('xml declaration', () => {
        test('should retain declaration', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                in: '<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\n<root/>'
            }))
                .toEqual('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>\n<root/>');
        });
    });

    describe('pretty', () => {
        test('simple pretty', () => {
            expect(xmlNormalize({
                ...defaultOptions,
                pretty: true,
                in: '<root>   <a>   <node>a</node>  <node>b</node>  </a>  <b>  <node/>  </b>\n\n\n</root>'
            }))
                .toEqual('<root>\n' +
                    ' <a>\n' +
                    '  <node>a</node>\n' +
                    '  <node>b</node>\n' +
                    ' </a>\n' +
                    ' <b>\n' +
                    '  <node/>\n' +
                    ' </b>\n' +
                    '</root>')

        });
    });
});