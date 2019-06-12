import {
    asFloat,
    asInteger,
    asString,
    continueWith,
    createConvertingStep,
    createValidationStep,
    error,
    stopWith
} from "./steps";
import {Step, StepResult} from "./types";

describe("helper functions", () => {

    test("continueWith", () => {
        const value = Symbol();
        const result = continueWith(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: true,
            stop: false,
            value,
        });
    });

    test("stopWith", () => {
        const value = Symbol();
        const result = stopWith(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: true,
            stop: true,
            value,
        });
    });

    test("error", () => {
        const result = error();

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: false,
            stop: undefined,
            value: undefined,
        });
    });

});


describe("step", () => {

    const createStepTests = (step: Step<any, any, any>, input: any, expectedResult: StepResult<any, any>) => {

        test("does not throw error", () => {
            expect(() => step(input)).not.toThrow();
        });

        if (expectedResult.ok) {

            test("has ok state", () => {
                const report = step(input);

                expect(report.ok).toBeTruthy();
            });

            test("has expected output", () => {
                const report = step(input);

                report.ok && expect(report.value).toEqual(expectedResult.value);
            });

            test("has expected stop status", () => {
                const report = step(input);

                report.ok && expect(report.stop).toBe(expectedResult.stop);
            });

        } else {

            test("has no ok state", () => {
                const report = step(input);

                expect(report.ok).toBeFalsy();
            });

            test("has no stop field", () => {
                const report = step(input);

                expect(report).not.toHaveProperty("stop");
            });

            test("has no value field", () => {
                const report = step(input);

                expect(report).not.toHaveProperty("value");
            });

        }
    };

    describe("createConvertingStep", () => {

        describe("creates step with expected transformation", () => {
            const func = (x: number) => String(x * 2 % 1000);

            const step = createConvertingStep(func);
            const input = Date.now();
            const result = continueWith(func(input));

            createStepTests(step, input, result);
        });

        test("throws the same error as transformation function", () => {
            const error = new Error("Hello");

            const func = (x: number) => {
                throw error
            };
            const step = createConvertingStep(func);
            const input = Date.now();

            expect(() => step(input)).toThrow(error);
        });

    });

    describe("createValidationStep", () => {
        const func = <T>(x: T | null): x is T => x !== null;
        const step = createValidationStep(func);

        describe("creates step that continues execution on valid data", () => {
            const input = Symbol();
            const result = continueWith(input);

            createStepTests(step, input, result);
        });

        describe("creates step that stops execution on invalid valid data", () => {
            const input = null;
            const result = error();

            createStepTests(step, input, result);
        });

        test("throws the same error as validation function", () => {
            const error = new Error("Hello");

            const func = (x: number) => {
                throw error
            };
            const step = createValidationStep(func);
            const input = Date.now();

            expect(() => step(input)).toThrow(error);
        });

    });

    describe("converters", () => {

        describe("asString", () => {
            createStepTests(asString, 12, continueWith("12"));
        });

        describe("asInteger", () => {
            describe("from valid string", () => createStepTests(asInteger, "12", continueWith(12)));
            describe("from invalid string", () => createStepTests(asInteger, "asd", continueWith(NaN)));
            describe("from integer", () => createStepTests(asInteger, 23, continueWith(23)));
            describe("from float", () => createStepTests(asInteger, 44.4, continueWith(44)));
            describe("from boolean", () => createStepTests(asInteger, true, continueWith(NaN)));
        });

        describe("asFloat", () => {
            describe("from valid string", () => createStepTests(asFloat, "12.2", continueWith(12.2)));
            describe("from invalid string", () => createStepTests(asFloat, "asd", continueWith(NaN)));
            describe("from integer", () => createStepTests(asFloat, 23, continueWith(23)));
            describe("from float", () => createStepTests(asFloat, 44.4, continueWith(44.4)));
            describe("from boolean", () => createStepTests(asFloat, true, continueWith(NaN)));
        });

    });

});
