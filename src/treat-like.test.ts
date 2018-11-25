import {concat} from "ramda";
import {createChain} from "./constructors";
import {optional} from "./misc";
import {treatLike} from "./treat-like";
import {Validator} from "./types";

const tuple = <T extends any[]>(...args: T) => args;

interface Example {
    note: string;
    ok: boolean;
    schema: any;
    input: any;
    output: any;
    error: any;
}

// experiments
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

// type predicates
const isDefined = <A>(value: unknown): value is {} => (value !== undefined && value !== null);
const isString = (value: unknown): value is string => typeof value === "string";

// value predicates

const longer = <T extends string | any[]>(then: number) => (value: T) => value.length > then;
const notEmpty = longer(0);

// type validators
const onlyProvided = createTypeValidator(isDefined);
const onlyString = createTypeValidator(isString);

// value validators
const onlyNotEmpty = <T extends string | any[]>(v: T) => createValidator<T>(notEmpty)(v);
const onlyLonger = (then: number) =>
    <T extends string | any[]>(value: T) => createValidator<T>(longer(then))(value);

// shortcuts
const optionalStringField = createChain()
    .then(optional(onlyString), "err_not_string")
    .then(optional(onlyLonger(1)), "err_too_short")
    .then(optional((x) => x.toUpperCase()))
;

const requiredStringField = createChain()
    .then(onlyProvided, "err_required")
    .then(onlyString, "err_not_string")
    .then(onlyLonger(1), "err_too_short")
    .then((x) => x.toUpperCase())
;

const fieldExamples: Example[] = [
    {
        note: "ok -> optional field",
        ok: true,
        schema: optionalStringField,
        input: "Hello",
        output: "HELLO",
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
        input: "Hello",
        output: "HELLO",
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
    //     schema: createChain()
    //         .then(onlyProvided, "err_required")
    //         .then(onlyList, "err_not_list")
    //         .then(onlyNotEmpty)
    //         .then([
    //             requiredStringField
    //             .check(optionalValidator((x) => x.length > 1), "err_too_short")
    //             .then(optionalConverter((x) => x.toUpperCase())),
    //         ]),
    //
    //     input: ["Hello", "World"],
    //     output: ["HELLO", "WORLD"],
    //     error: undefined,
    // },
];

const examples: Example[] = [
    fieldExamples,
    listExamples,
].reduce(concat, []);

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
