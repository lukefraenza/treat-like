import {all} from "ramda";
import {createChain} from "./constructors";
import {optional} from "./misc";
import {treatLike} from "./treat-like";
import {Chain, OkReport} from "./types";

const tuple = <T extends any[]>(...args: T) => args;

// experiment constructors
const createValidator = <A>(f: (value: A) => boolean) =>
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

const asList = <I, C>(chain: Chain<I, C>) =>
    (value: I[]): C[] => {
        const reports = value.map((item) => treatLike(chain, item));

        if (all((r) => r.ok, reports)) {
            // all ok
            return reports.map((r) => r.value) as C[];
        } else {
            // at least one item has error
            throw new Error("As list error");
        }
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

// tests

describe("simple fields validation and transformation", () => {

    describe("required", () => {
        const requiredStringField = createChain()
            .then(onlyProvided, "err_required")
            .then(onlyString, "err_not_string")
            .then((x) => x.trim())
            .then(onlyLonger(1), "err_too_short")
        ;

        test("ok value", () => {
            const report = treatLike(requiredStringField, "Hello ");

            expect(report.error).toBeUndefined();
            expect(report.value).toBe("Hello");
            expect(report.ok).toBeTruthy();
        });

        test("undefined value", () => {
            const report = treatLike(requiredStringField, undefined);

            expect(report.error).toBe("err_required");
            expect(report.value).toBeUndefined();
            expect(report.ok).toBeFalsy();
        });

        test("wrong value type", () => {
            const report = treatLike(requiredStringField, 45);

            expect(report.error).toBe("err_not_string");
            expect(report.value).toBeUndefined();
            expect(report.ok).toBeFalsy();
        });

        test("wrong value", () => {
            const report = treatLike(requiredStringField, "M");

            expect(report.error).toBe("err_too_short");
            expect(report.value).toBeUndefined();
            expect(report.ok).toBeFalsy();
        });
    });

    describe("optional", () => {
        const optionalStringField = createChain()
            .then(optional(onlyString), "err_not_string")
            .then(optional((x) => x.trim()))
            .then(optional(onlyLonger(1)), "err_too_short")
        ;

        test("ok value", () => {
            const report = treatLike(optionalStringField, "Hello ");

            expect(report.error).toBeUndefined();
            expect(report.value).toBe("Hello");
            expect(report.ok).toBeTruthy();
        });

        test("undefined value", () => {
            const report = treatLike(optionalStringField, undefined);

            expect(report.error).toBeUndefined();
            expect(report.value).toBeUndefined();
            expect(report.ok).toBeTruthy();
        });

        test("wrong value type", () => {
            const report = treatLike(optionalStringField, 45);

            expect(report.error).toBe("err_not_string");
            expect(report.value).toBeUndefined();
            expect(report.ok).toBeFalsy();
        });

        test("wrong value", () => {
            const report = treatLike(optionalStringField, "M");

            expect(report.error).toBe("err_too_short");
            expect(report.value).toBeUndefined();
            expect(report.ok).toBeFalsy();
        });
    });
});

describe("list fields validation and transformation", () => {

    describe("required field with required items", () => {

        const requiredStringList = createChain()
            .then(onlyProvided, "err_required_1")
            .then(onlyList, "err_not_list")
            .then(onlyNotEmpty, "err_empty")
            .then(asList(
                createChain()
                    .then(onlyProvided, "err_required_2")
                    .then(onlyString, "err_not_string")
                    .then(onlyLonger(1), "err_too_short")
                    .then((x) => x.toUpperCase()),
            ), "err_item_error")
        ;

        test("ok list", () => {
            const report = treatLike(requiredStringList, ["Hello", "World"]);

            expect(report.error).toBe(undefined);
            expect(report.value).toEqual(["HELLO", "WORLD"]);
            expect(report.ok).toBeTruthy();
        });

        test("undefined list", () => {
            const report = treatLike(requiredStringList, undefined);

            expect(report.error).toBe("err_required_1");
            expect(report.value).toEqual(undefined);
            expect(report.ok).toBeFalsy();
        });

        test("not list", () => {
            const report = treatLike(requiredStringList, "hello");

            expect(report.error).toBe("err_not_list");
            expect(report.value).toEqual(undefined);
            expect(report.ok).toBeFalsy();
        });

        test("wrong list", () => {
            const report = treatLike(requiredStringList, []);

            expect(report.error).toBe("err_empty");
            expect(report.value).toEqual(undefined);
            expect(report.ok).toBeFalsy();
        });

        test("undefined list item", () => {
            const report = treatLike(requiredStringList, ["Hello", undefined, "World"]);

            expect(report.error).toBe("err_item_error");
            expect(report.value).toEqual(undefined);
            expect(report.ok).toBeFalsy();
        });

        test("wrong list item type", () => {
            const report = treatLike(requiredStringList, ["Hello", 12, "World"]);

            expect(report.error).toBe("err_item_error");
            expect(report.value).toEqual(undefined);
            expect(report.ok).toBeFalsy();
        });

        test("wrong list item", () => {
            const report = treatLike(requiredStringList, ["Hello", "World", "!"]);

            expect(report.error).toBe("err_item_error");
            expect(report.value).toEqual(undefined);
            expect(report.ok).toBeFalsy();
        });

    });

});
