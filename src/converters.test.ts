import {bydefault, lowercased, trimmed, uppercased} from "./converters";

describe("bydefault", () => {

    test("replaces null on provided value", () => {
        expect(bydefault(9)(null)).toBe(9);
        expect(bydefault("hello")(null)).toBe("hello");
        expect(bydefault(true)(null)).toBe(true);
        expect(bydefault({a: 10, b: "hello"})(null)).toEqual({a: 10, b: "hello"});
        expect(bydefault(undefined)(null)).toBe(undefined);
        expect(bydefault(null)(null)).toBe(null);
    });

    test("replaces undefined on provided value", () => {
        expect(bydefault(9)(undefined)).toBe(9);
        expect(bydefault("hello")(undefined)).toBe("hello");
        expect(bydefault(true)(undefined)).toBe(true);
        expect(bydefault({a: 10, b: "hello"})(undefined)).toEqual({a: 10, b: "hello"});
        expect(bydefault(null)(undefined)).toBe(null);
        expect(bydefault(undefined)(undefined)).toBe(undefined);
    });

});

describe("string conversion functions", () => {
    const stringExamples = [
        "",
        "Hello",
        "   World",
        "This is  Sparta!   ",
        "     ",
        " - - ",
    ];

    describe("trimmed", () => {
        test("works like string.trim()", () => {
            stringExamples.forEach((s) => {
                expect(trimmed(s)).toEqual(s.trim());
            });
        });
    });

    describe("lowercased", () => {
        test("works like string.toLowerCase()", () => {
            stringExamples.forEach((s) => {
                expect(lowercased(s)).toEqual(s.toLowerCase());
            });
        });
    });

    describe("uppercased", () => {
        test("works like string.toUpperCase()", () => {
            stringExamples.forEach((s) => {
                expect(uppercased(s)).toEqual(s.toUpperCase());
            });
        });
    });
});
