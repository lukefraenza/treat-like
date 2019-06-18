import {arrayOf, stepContinueResult, createConvertingStep, createValidationStep, stepErrorResult, stepStopResult} from "./steps";
import {Step, StepResult} from "./types";
import {treat} from "./treat";
import {isString} from "./validators";

describe("helper functions", () => {

    test("stepContinueResult", () => {
        const value = Symbol();
        const result = stepContinueResult(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: true,
            stop: false,
            value,
        });
    });

    test("stepStopResult", () => {
        const value = Symbol();
        const result = stepStopResult(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: true,
            stop: true,
            value,
        });
    });

    test("stepErrorResult", () => {
        const result = stepErrorResult();

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
            const result = stepContinueResult(func(input));

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
            const result = stepContinueResult(input);

            createStepTests(step, input, result);
        });

        describe("creates step that stops execution on invalid valid data", () => {
            const input = null;
            const result = stepErrorResult();

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

    describe("arrayOf", () => {

        describe("returns array of expected values on valid input", () => {
            const chain = treat().then(isString).then(createConvertingStep(x => x.toUpperCase()));
            const step = arrayOf(chain);

            const input = ["hello", "world"];
            const result = stepContinueResult(["HELLO", "WORLD"]);

            createStepTests(step, input, result);
        });


        describe("returns errors in place of invalid items", () => {
            const error = new Error("Not string");
            const chain = treat().then(isString, error).then(createConvertingStep(x => x.toUpperCase()));
            const step = arrayOf(chain);

            const input = ["hello", 14, "world"];
            const result = stepContinueResult(["HELLO", "WORLD"]);

            createStepTests(step, input, result);

            // TODO: Implement this logic
        });
    });

});
