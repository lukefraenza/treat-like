import {gt, gte, lt, lte, match, negative, optionalTypeCheck, positive, provided} from "./validators";

describe("provided", () => {
    [
        [null, false, "null"],
        [undefined, false, "undefined"],
        [void 0, false, "void 0"],
        ["", true, "\"\""],
        ["Hello", true, "\"Hello\""],
        [0, true, "0"],
        [1, true, "1"],
        [[], true, "[]"],
        [{}, true, "{}"],
        [{a: 10}, true, "{a: 10}"],
        [[null, undefined], true, "[null, undefined]"],
    ].map(([input, expectedResult, note]) =>
        test(`expect ${expectedResult} on ${note}`, () =>
            expect(provided(input)).toEqual(expectedResult),
        ));
});

describe("gt", () => {
    ([
        [1, 4, true],
        ["hello", 2, false],
        [0, 0, false],
        ["world", "foo", false],
        ["bar", "foo", false],
        [{length: 10}, "python", false],
        [{length: 10}, {length: 15}, true],
    ] as Array<[any, any, boolean]>)
        .map(([a, b, expectedResult]) =>
            test(`expect ${JSON.stringify(b)} ${expectedResult ? ">" : "<="} ${JSON.stringify(a)}`, () =>
                expect(gt(a)(b)).toEqual(expectedResult),
            ));
});

describe("lt", () => {
    ([
        [1, 4, false],
        ["hello", 2, true],
        [0, 0, false],
        ["world", "foo", true],
        ["bar", "foo", false],
        [{length: 10}, "python", true],
        [{length: 10}, {length: 15}, false],
    ] as Array<[any, any, boolean]>)
        .map(([a, b, expectedResult]) =>
            test(`expect ${JSON.stringify(a)} ${expectedResult ? ">" : "<="} ${JSON.stringify(b)}`, () =>
                expect(lt(a)(b)).toEqual(expectedResult),
            ));
});

describe("gte", () => {
    ([
        [1, 4, true],
        ["hello", 2, false],
        [0, 0, true],
        ["world", "foo", false],
        ["bar", "foo", true],
        [{length: 10}, "python", false],
        [{length: 10}, {length: 15}, true],
    ] as Array<[any, any, boolean]>)
        .map(([a, b, expectedResult]) =>
            test(`expect ${JSON.stringify(b)} ${expectedResult ? ">=" : "<"} ${JSON.stringify(a)}`, () =>
                expect(gte(a)(b)).toEqual(expectedResult),
            ));
});

describe("lte", () => {
    ([
        [1, 4, false],
        ["hello", 2, true],
        [0, 0, true],
        ["world", "foo", true],
        ["bar", "foo", true],
        [{length: 10}, "python", true],
        [{length: 10}, {length: 15}, false],
    ] as Array<[any, any, boolean]>)
        .map(([a, b, expectedResult]) =>
            test(`expect ${JSON.stringify(a)} ${expectedResult ? ">=" : "<"} ${JSON.stringify(b)}`, () =>
                expect(lte(a)(b)).toEqual(expectedResult),
            ));
});

describe("positive", () => {
    ([
        [1, true],
        [0, false],
        [-1, false],
    ] as Array<[number, boolean]>)
        .map(
            ([n, expectedResult]) =>
                test(`expect ${n} > 0 is ${expectedResult}`, () =>
                    expect(positive(n)).toBe(expectedResult),
                ),
        );
});

describe("negative", () => {
    ([
        [1, false],
        [0, false],
        [-1, true],
    ] as Array<[number, boolean]>)
        .map(
            ([n, expectedResult]) =>
                test(`expect ${n} < 0 is ${expectedResult}`, () =>
                    expect(negative(n)).toBe(expectedResult),
                ),
        );
});

describe("match", () => {
    test("it matches if value matches regexp", () => {
        expect(match(/^\d+$/)("1238172638")).toBeTruthy();
    }) ;

    test("it not matches if value not matches regexp", () => {
        expect(match(/^\d+$/)("foobar")).toBeFalsy();
    }) ;
});

describe("optionalTypeCheck", () => {
    test("works on strings", () => {
        expect(optionalTypeCheck("string")("hello")).toBeTruthy();
        expect(optionalTypeCheck("string")(1)).toBeFalsy();
        expect(optionalTypeCheck("string")(null)).toBeFalsy();
        expect(optionalTypeCheck("string")(undefined)).toBeTruthy();
    });

    test("works on numbers", () => {
        expect(optionalTypeCheck("number")(312)).toBeTruthy();
        expect(optionalTypeCheck("number")("Hello")).toBeFalsy();
        expect(optionalTypeCheck("number")(null)).toBeFalsy();
        expect(optionalTypeCheck("number")(undefined)).toBeTruthy();
    });

    test("works on booleans", () => {
        expect(optionalTypeCheck("boolean")(true)).toBeTruthy();
        expect(optionalTypeCheck("boolean")("12")).toBeFalsy();
        expect(optionalTypeCheck("boolean")(null)).toBeFalsy();
        expect(optionalTypeCheck("boolean")(undefined)).toBeTruthy();
    });

    test("works on objects (except null)", () => {
        expect(optionalTypeCheck("object")({x: 10})).toBeTruthy();
        expect(optionalTypeCheck("object")("12")).toBeFalsy();
        expect(optionalTypeCheck("object")(123)).toBeFalsy();
        expect(optionalTypeCheck("object")([])).toBeTruthy();
        expect(optionalTypeCheck("object")(null)).toBeFalsy();
        expect(optionalTypeCheck("object")(undefined)).toBeTruthy();
    });
});
