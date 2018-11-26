import {concat} from "ramda";
import {createChain} from "./constructors";
import {optional} from "./misc";
import {treatLike} from "./treat-like";
import {FullOutput, Input, Validator} from "./types";

const tuple = <T extends any[]>(...args: T) => args;

interface Example {
    note: string;
    ok: boolean;
    schema: any;
    input: any;
    output: any;
    error: any;
}

// experiment sontructors
const createValidator = <A>(f: Validator<A>) =>
    (value: A) => {
        if (f(value)) {
            return value;
        } else {
            throw new Error("Validation failed");
        }
    };

const createTypeValidator = <I, O>(f: (value: I | O) => value is O) =>
    (value: any): O => {
        if (f(value)) {
            return value as O;
        } else {
            throw new Error("Valve failed");
        }
    };

const fromSchema = <S>(schema: S) =>
    (value: Input<S>): Promise<FullOutput<S>> => {
        return treatLike(schema, value)
            .then((report) => {
                if (report.ok) {
                    return report.value;
                } else {
                    throw new Error("converting error");
                }
            });
    };

// type predicates
const isDefined = <A>(value: unknown): value is {} => (value !== undefined && value !== null);
const isString = (value: unknown): value is string => typeof value === "string";
const isList = (value: unknown): value is Array<unknown> => Array.isArray(value);


// value predicates
const longer = <T extends string | any[]>(then: number) => (value: T) => value.length > then;
const notEmpty = longer(0);


// type validators
const onlyProvided = createTypeValidator(isDefined);
const onlyString = createTypeValidator(isString);
const onlyList = createTypeValidator(isList);


// value validators
const onlyNotEmpty = <T extends string | any[]>(v: T) => createValidator<T>(notEmpty)(v);
const onlyLonger = (then: number) => <T extends string | any[]>(value: T) => createValidator<T>(longer(then))(value);


// shortcuts
const optionalStringField = createChain()
    .then(optional(onlyString), "err_not_string")
    .then(optional(onlyLonger(1)), "err_too_short")
    .then(optional((x) => x.trim()))
;

const requiredStringField = createChain()
    .then(onlyProvided, "err_required")
    .then(onlyString, "err_not_string")
    .then(onlyLonger(1), "err_too_short")
    .then((x) => x.trim())
;


// examples
const fieldExamples: Example[] = [
    {
        note: "ok -> optional field",
        ok: true,
        schema: optionalStringField,
        input: "  Hello   ",
        output: "Hello",
        error: undefined,
    },

    {
        note: "invalid -> optional field",
        ok: false,
        schema: optionalStringField,
        input: "1",
        output: undefined,
        error: "err_too_short",
    },

    {
        note: "wrong type -> optional field",
        ok: false,
        schema: optionalStringField,
        input: 4,
        output: undefined,
        error: "err_not_string",
    },

    {
        note: "undefined -> optional field",
        ok: true,
        schema: optionalStringField,
        input: undefined,
        output: undefined,
        error: undefined,
    },

    {
        note: "ok -> required field",
        ok: true,
        schema: requiredStringField,
        input: "  Hello",
        output: "Hello",
        error: undefined,
    },

    {
        note: "invalid -> required field",
        ok: false,
        schema: requiredStringField,
        input: "1",
        output: undefined,
        error: "err_too_short",
    },

    {
        note: "wrong type -> required field",
        ok: false,
        schema: requiredStringField,
        input: 4,
        output: undefined,
        error: "err_not_string",
    },

    {
        note: "undefined -> required field",
        ok: false,
        schema: requiredStringField,
        input: undefined,
        output: undefined,
        error: "err_required",
    },

];

const listExamples: Example[] = [
    // {
    //     note: "ok -> required not empty list",
    //     ok: true,
    //     schema: (
    //         createChain()
    //             .then(onlyProvided, "err_required")
    //             .then(onlyList, "err_not_list")
    //             .then(onlyNotEmpty)
    //             .then(reverseEachElementInList_required)
    //     ),
    //
    //     input: ["Hello", "World"],
    //     output: ["olleH", "dlroW"],
    //     error: undefined,
    // },

    // {
    //     note: "undefined -> optional not empty list",
    //     ok: true,
    //     schema: (
    //         createChain()
    //             .then(optional(onlyList), "err_not_list")
    //             .then(optional(onlyNotEmpty))
    //             .then(optional(reverseEachElementInList_optional))
    //     ),
    //
    //     input: undefined,
    //     output: undefined,
    //     error: undefined,
    // },
    //
    // {
    //     note: "ok -> optional not empty list",
    //     ok: true,
    //     schema: (
    //         createChain()
    //             .then(optional(onlyList), "err_not_list")
    //             .then(optional(onlyNotEmpty))
    //             .then(reverseEachElementInList_optional)
    //     ),
    //
    //     input: ["foo", "bar"],
    //     output: ["oof", "rab"],
    //     error: undefined,
    // },
];

const otherExamples: Example[] = [
    // {
    //     note: "Embedding chain with ok data",
    //     ok: true,
    //     schema: requiredStringField.then(fromSchema(reversed_required), "aaa"),
    //     input: "     hello ",
    //     output: "olleh",
    //     error: undefined,
    // },
];

const examples: Example[] = [
    fieldExamples,
    listExamples,
    otherExamples,
].reduce(concat, []);


// tests
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
