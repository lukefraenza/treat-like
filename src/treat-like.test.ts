import {createChain} from "./constructors";
import {optionalConverter, optionalValidator} from "./misc";
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

// custom validators
const onlyString = (value: any): string => {
    if (typeof value === "string") {
        return value;
    } else {
        throw new Error("Is not string");
    }
};

const onlyProvided = <T>(value: T | null | undefined): T => {
    if (value !== undefined && value !== null) {
        return value;
    } else {
        throw new Error("Is not string");
    }
};

// shortcuts
const optionalStringField = createChain()
    .then(optionalConverter(onlyString), "err_not_string")
;

const requiredStringField = createChain()
    .then(onlyProvided, "err_required")
    .then(onlyString, "err_not_string")
;

const examples: Example[] = [
    {
        note: "ok -> optional field",
        ok: true,
        schema: optionalStringField
            .check(optionalValidator((x) => x.length > 1), "err_too_short")
            .then(optionalConverter((x) => x.toUpperCase())),
        input: "Hello",
        output: "HELLO",
        error: undefined,
    },

    {
        note: "invalid -> optional field",
        ok: false,
        schema: optionalStringField
            .check(optionalValidator((x) => x.length > 1), "err_too_short")
            .then(optionalConverter((x) => x.toUpperCase())),
        input: "1",
        output: undefined,
        error: "err_too_short",
    },

    {
        note: "wrong type -> optional field",
        ok: false,
        schema: optionalStringField
            .check(optionalValidator((x) => x.length > 1), "err_too_short")
            .then(optionalConverter((x) => x.toUpperCase())),
        input: 4,
        output: undefined,
        error: "err_not_string",
    },

    {
        note: "undefined -> optional field",
        ok: true,
        schema: optionalStringField
            .check(optionalValidator((x) => x.length > 1), "err_too_short")
            .then(optionalConverter((x) => x.toUpperCase())),
        input: undefined,
        output: undefined,
        error: undefined,
    },

    {
        note: "ok -> required field",
        ok: true,
        schema: requiredStringField
            .check((x) => x.length > 1, "err_too_short")
            .then((x) => x.toUpperCase()),
        input: "Hello",
        output: "HELLO",
        error: undefined,
    },

    {
        note: "invalid -> required field",
        ok: false,
        schema: requiredStringField
            .check((x) => x.length > 1, "err_too_short")
            .then((x) => x.toUpperCase()),
        input: "1",
        output: undefined,
        error: "err_too_short",
    },

    {
        note: "wrong type -> required field",
        ok: false,
        schema: requiredStringField
            .check((x) => x.length > 1, "err_too_short")
            .then((x) => x.toUpperCase()),
        input: 4,
        output: undefined,
        error: "err_not_string",
    },

    {
        note: "undefined -> required field",
        ok: false,
        schema: requiredStringField
            .check((x) => x.length > 1, "err_too_short")
            .then((x) => x.toUpperCase()),
        input: undefined,
        output: undefined,
        error: "err_required",
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
