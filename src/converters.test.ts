import {asDate, asFloat, asInteger, asString} from "./converters";
import {Step, StepResult} from "./types";
import {stepContinueResult} from "./steps";


describe("converters", () => {

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

    describe("asString", () => {
        createStepTests(asString, 12, stepContinueResult("12"));
    });

    describe("asInteger", () => {
        describe("from valid integer string", () => createStepTests(asInteger, "12", stepContinueResult(12)));
        describe("from valid float string", () => createStepTests(asInteger, "45.2", stepContinueResult(45)));

        test("throws on invalid string", () => {
            expect(() => asInteger("not-integer")).toThrow();
        });

        describe("from integer", () => createStepTests(asInteger, 23, stepContinueResult(23)));
        describe("from float", () => createStepTests(asInteger, 44.9, stepContinueResult(44)));

        describe("from 'true'", () => createStepTests(asInteger, true, stepContinueResult(1)));
        describe("from 'false'", () => createStepTests(asInteger, false, stepContinueResult(0)));
    });

    describe("asFloat", () => {
        describe("from valid integer string", () => createStepTests(asFloat, "16", stepContinueResult(16)));
        describe("from valid float string", () => createStepTests(asFloat, "12.2", stepContinueResult(12.2)));

        test("throws on invalid string", () => {
            expect(() => asFloat("not-float")).toThrow();
        });

        describe("from integer", () => createStepTests(asFloat, 23, stepContinueResult(23)));
        describe("from float", () => createStepTests(asFloat, 44.9, stepContinueResult(44.9)));

        describe("from 'true'", () => createStepTests(asFloat, true, stepContinueResult(1)));
        describe("from 'false'", () => createStepTests(asFloat, false, stepContinueResult(0)));
    });

    describe("asDate", () => {
        const validString = (new Date()).toString();
        const integer = Date.now();

        describe("from valid string", () => createStepTests(asDate, validString, stepContinueResult(new Date(validString))));
        describe("from integer", () => createStepTests(asDate, integer, stepContinueResult(new Date(integer))));

        test("throws on invalid string", () => {
            expect(() => asDate("not-date")).toThrow();
        });

        describe("from float", () => createStepTests(asDate, 44.4, stepContinueResult(new Date(44.4))));
    });


});
