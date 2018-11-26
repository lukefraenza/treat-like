import {createChain} from "./constructors";
import {optional} from "./misc";
import {treatLike} from "./treat-like";
import {Chain, Validator} from "./types";

const tuple = <T extends any[]>(...args: T) => args;

// experiment constructors
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

const asList = <I, C>(chain: Chain<I, C>) =>
    (value: I[]): C[] => {
        return value.map(chain.apply);
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
            .then(onlyLonger(1), "err_too_short")
            .then((x) => x.trim())
        ;

        test("ok value", () => {
            const report = treatLike(requiredStringField, "Hello ");

            expect(report.ok).toBeTruthy();
            expect(report.value).toBe("Hello");
            expect(report.error).toBeUndefined();
        });

        test("undefined value", () => {
            const report = treatLike(requiredStringField, undefined);

            expect(report.ok).toBeFalsy();
            expect(report.value).toBeUndefined();
            expect(report.error).toBe("err_required");
        });

        test("wrong value type", () => {
            const report = treatLike(requiredStringField, 45);

            expect(report.ok).toBeFalsy();
            expect(report.value).toBeUndefined();
            expect(report.error).toBe("err_not_string");
        });

        test("wrong value", () => {
            const report = treatLike(requiredStringField, "M");

            expect(report.ok).toBeFalsy();
            expect(report.value).toBeUndefined();
            expect(report.error).toBe("err_too_short");
        });
    });

    describe("optional", () => {
        const optionalStringField = createChain()
            .then(optional(onlyString), "err_not_string")
            .then(optional(onlyLonger(1)), "err_too_short")
            .then(optional((x) => x.trim()))
        ;

        test("ok value", () => {
            const report = treatLike(optionalStringField, "Hello ");

            expect(report.ok).toBeTruthy();
            expect(report.value).toBe("Hello");
            expect(report.error).toBeUndefined();
        });

        test("undefined value", () => {
            const report = treatLike(optionalStringField, undefined);

            expect(report.ok).toBeTruthy();
            expect(report.value).toBeUndefined();
            expect(report.error).toBeUndefined();
        });

        test("wrong value type", () => {
            const report = treatLike(optionalStringField, 45);

            expect(report.ok).toBeFalsy();
            expect(report.value).toBeUndefined();
            expect(report.error).toBe("err_not_string");
        });

        test("wrong value", () => {
            const report = treatLike(optionalStringField, "M");

            expect(report.ok).toBeFalsy();
            expect(report.value).toBeUndefined();
            expect(report.error).toBe("err_too_short");
        });
    });
});
