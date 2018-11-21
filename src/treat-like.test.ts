import {boolean, number, string} from "./constructors";
import {treatLike} from "./treat-like";

const tuple = <T extends any[]>(...args: T) => args;

interface Example {
    note: string;
    ok: boolean;
    schema: any;
    input: any;
    output: any;
    error: any;
}

const examples: Example[] = [
    // valid
    {
        note: "value converting",
        ok: true,
        schema: string().then((x) => x.toUpperCase()),
        input: "Hello",
        output: "HELLO",
        error: undefined,
    },

    {
        note: "dict with extra fields in input",
        ok: true,
        schema: {
            num: number(),
            obj: {
                tuple4: tuple(number(), number(), boolean(), boolean()),
                tuple3: tuple(number(), boolean(), string()),
            },
            arr: [number()],
            str: string(),
        },
        input: {
            num: 10,
            obj: {
                tuple4: tuple(1, 2, true, false, "extra1", 3),
                tuple3: tuple(4, true, "Hello", 100500),
            },
            arr: [5, 6, 2, 3, 4, 1],
            str: "This is treat-like",
            ext_str: "this is extra field",
            ext_obj: {
                ext_str: "f1 extra",
                ext_tuple3: [true, true, true],
            },
        },
        output: {
            num: 10,
            obj: {
                tuple4: tuple(1, 2, true, false),
                tuple3: tuple(4, true, "Hello"),
            },
            arr: [5, 6, 2, 3, 4, 1],
            str: "This is treat-like",
        },
        error: {
            num: undefined,
            obj: {
                tuple4: [undefined, undefined, undefined, undefined],
                tuple3: [undefined, undefined, undefined],
            },
            arr: [undefined, undefined, undefined, undefined, undefined, undefined],
            str: undefined,
        },
    },

    {
        note: "tuple converting",
        ok: true,
        schema: tuple(
            string().then((s) => s.trim()),
            {x: number().then(Math.abs).then(Math.floor), y: number().then(Math.abs).then(Math.floor)},
            number().then((x) => x * 2),
        ),
        input: [" point 1", {x: 132.1222, y: -31.45212}, 45],
        output: ["point 1", {x: 132, y: 31}, 90],
        error: [undefined, {x: undefined, y: undefined}, undefined],
    },

    {
        note: "empty list",
        ok: true,
        schema: [number("must_be_number")],
        input: [],
        output: [],
        error: [],
    },

    {
        note: "undefined instead of list",
        ok: true,
        schema: [number("must_be_number")],
        input: undefined,
        output: [],
        error: [],
    },

    {
        note: "string instead of list",
        ok: true,
        schema: [number("must_be_number")],
        input: "Hello",
        output: [],
        error: [],
    },

    {
        note: "null instead of tuple without check on undefined",
        ok: true,
        schema: tuple(
            number("must_be_number"),
            string("must_be_string"),
        ),
        input: null,
        output: [undefined, undefined],
        error: [undefined, undefined],
    },

    // invalid
    {
        note: "value check",
        ok: false,
        schema: number().check((x) => x > 10, "must be grater then 10"),
        input: 5,
        output: undefined,
        error: "must be grater then 10",
    },

    {
        note: "dict with optional type check",
        ok: false,
        schema: {
            a: number("a must be a number"),
            b: string("b must be a string"),
            c: boolean("c must be a boolean"),
            d: number("d must be a number"),
            e: number("e must be a number"),
        },
        input: {
            a: "12.23",
            b: "Foo Bar",
            d: null,
            e: 3,
        },
        error: {
            a: "a must be a number",
            b: undefined,
            c: undefined,
            d: "d must be a number",
            e: undefined,
        },
        output: {
            a: undefined,
            b: "Foo Bar",
            c: undefined,
            d: undefined,
            e: 3,
        },
    },

    {
        note: "list converting and validating",
        ok: false,
        schema: [
            string("must_be_string")
                .then((s) => s.trim())
                .check((s) => s.length > 6, "too_short")
                .then((s) => s.slice(0, 3))
                .then((s) => s.toUpperCase()),
        ],
        input: [
            "abc",
            "Aaa foobar   ",
            12,
            "this is sparta!",
            "   Hello!",
            " very long string ",
        ],
        output: [
            undefined,
            "AAA",
            undefined,
            "THI",
            undefined,
            "VER",
        ],
        error: [
            "too_short",
            undefined,
            "must_be_string",
            undefined,
            "too_short",
            undefined,
        ],
    },

    {
        note: "null instead of dict",
        ok: false,
        schema: {
            num: number("must_be_number").check((x) => x !== undefined, "value_required"),
            str: string("must_be_string").check((x) => x !== undefined, "value_required"),
        },
        input: null,
        output: {
            num: undefined,
            str: undefined,
        },
        error: {
            num: "value_required",
            str: "value_required",
        },
    },

    {
        note: "void 0 instead of dict",
        ok: false,
        schema: {
            num: number("must_be_number").check((x) => x !== undefined, "value_required"),
            str: string("must_be_string").check((x) => x !== undefined, "value_required"),
        },
        input: void 0,
        output: {
            num: undefined,
            str: undefined,
        },
        error: {
            num: "value_required",
            str: "value_required",
        },
    },

    {
        note: "string instead of dict",
        ok: false,
        schema: {
            num: number("must_be_number").check((x) => x !== undefined, "value_required"),
            str: string("must_be_string").check((x) => x !== undefined, "value_required"),
        },
        input: "Hello",
        output: {
            num: undefined,
            str: undefined,
        },
        error: {
            num: "value_required",
            str: "value_required",
        },
    },

    {
        note: "string instead of tuple with check on undefined",
        ok: false,
        schema: tuple(
            number("must_be_number").check((x) => x !== undefined, "1_value_required"),
            string("must_be_string").check((x) => x !== undefined, "2_value_required"),
            boolean("must_be_boolean").check((x) => x !== undefined, "3_value_required"),
        ),
        input: "Hello",
        output: [undefined, undefined, undefined],
        error: ["1_value_required", "2_value_required", "3_value_required"],
    },
];

describe("sets ok status as expected", () => {
    examples.map((e) => test(e.note, async () => {
        const report = await treatLike(e.schema, e.input);
        expect(report.ok).toEqual(e.ok);
    }));
});

describe("sets error messages as expected", () => {
    examples.map((e) => test(e.note, async () => {
        const report = await treatLike(e.schema, e.input);
        expect(report.error).toEqual(e.error);
    }));
});

describe("sets out values as expected", () => {
    examples.map((e) => test(e.note, async () => {
        const report = await treatLike(e.schema, e.input);
        expect(report.value).toEqual(e.output);
    }));
});
