import {continueReport, errorReport, stopReport, treat} from "./treat";
import {stepContinueResult, stepStopResult} from "./steps";
import {asDate, asInteger, asString, id} from "./converters"
import {isString} from "./validators";
import {Chain, ChainReport} from "./types";

describe("helper functions", () => {

    test("continueReport", () => {
        const value = Symbol();
        const result = continueReport(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: true,
            stop: false,
            value,
            error: undefined,
        });
    });

    test("stopReport", () => {
        const value = Symbol();
        const result = stopReport(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: true,
            stop: true,
            value,
            error: undefined,
        });
    });

    test("errorReport", () => {
        const value = Symbol();
        const result = errorReport(value);

        expect(Object.isFrozen(result)).toBeTruthy();
        expect(result).toEqual({
            ok: false,
            stop: undefined,
            value: undefined,
            error: value,
        });
    });

});

describe("chain", () => {

    const createChainTests = (chain: Chain<any, any, any, any>, input: any, expectedReport: ChainReport<any, any, any>) => {

        test("does not throw error", () => {
            expect(() => chain.apply(input)).not.toThrow();
        });

        if (expectedReport.ok) {

            test("has ok state", () => {
                const report = chain.apply(input);

                expect(report.ok).toBeTruthy();
            });

            test("has expected output", () => {
                const report = chain.apply(input);

                report.ok && expect(report.value).toEqual(expectedReport.value);
            });

            test("has expected stop status", () => {
                const report = chain.apply(input);

                report.ok && expect(report.stop).toEqual(expectedReport.stop);
            });

            test("has no error field", () => {
                const report = chain.apply(input);

                expect(report).not.toHaveProperty("error");
            });

        } else {

            test("has no ok state", () => {
                const report = chain.apply(input);

                expect(report.ok).toBeFalsy();
            });

            test("has expected error", () => {
                const report = chain.apply(input);

                report.ok || expect(report.error).toEqual(expectedReport.error);
            });

            test("has no stop field", () => {
                const report = chain.apply(input);

                expect(report).not.toHaveProperty("stop");
            });

            test("has no value field", () => {
                const report = chain.apply(input);

                expect(report).not.toHaveProperty("value");
            });

        }
    };

    describe("treat", () => {

        test("does not throw error", () => {
            expect(treat).not.toThrow();
        });

        test("returns frozen object", () => {
            const chain = treat();

            expect(Object.isFrozen(chain)).toBeTruthy();
        });

        test("returns chain head with 'then' method", () => {
            const chain = treat();

            expect(chain).toHaveProperty("then");

            expect(typeof chain.then).toBe("function");
        });

    });

    describe("treat.then", () => {
        const chain = treat();

        test("returns new chain", () => {
            const c = chain.then(id);

            expect(c).not.toEqual(chain);

            expect(c).toHaveProperty("then");
            expect(c).toHaveProperty("apply");

            expect(typeof c.then).toBe("function");
            expect(typeof c.apply).toBe("function");
        });

        test("returns frozen object", () => {
            const newChain = chain.then(value => ({ok: true, stop: false, value}));

            expect(Object.isFrozen(newChain)).toBeTruthy();
        });

    });

    describe("valid input", () => {

        describe("single 'id' step", () => {
            const chain = treat().then(id);
            const input = Symbol();
            const report = continueReport(input);

            createChainTests(chain, input, report);
        });


        describe("three converting steps", () => {
            const chain = treat().then(asDate).then(x => stepContinueResult(x.getDay())).then(x => stepContinueResult(x * 2));
            const input = (new Date().toString());
            const report = continueReport(new Date(input).getDay() * 2);

            createChainTests(chain, input, report);
        });

        describe("stop step with same type", () => {
            const chain = treat()
                .then(x => x === undefined ? stepStopResult("(no name)") : stepContinueResult(x))
                .then(asString)
                .then(x => stepContinueResult(x.toUpperCase()));

            describe("on continue", () => {
                const input = "Hello";
                const report = continueReport("HELLO");
                createChainTests(chain, input, report);
            });

            describe("on stop", () => {
                const input = undefined;
                const report = stopReport("(no name)");
                createChainTests(chain, input, report);
            });
        });

        describe("stop step with different type", () => {
            const chain = treat()
                .then(asInteger)
                .then(x => x % 2 === 0 ? stepContinueResult(x) : stepStopResult(String(-1 * x)))
                .then(x => stepContinueResult(x * 2));

            describe("on continue", () => {
                const input = 6;
                const report = continueReport(12);
                createChainTests(chain, input, report);
            });

            describe("on stop", () => {
                const input = 5;
                const report = stopReport("-5");
                createChainTests(chain, input, report);
            });
        });

    });

    describe("invalid input", () => {

        describe("single validation step", () => {
            const error = Symbol("error");

            const chain = treat().then(isString, error);
            const input = 123;
            const report = errorReport(error);

            createChainTests(chain, input, report);
        });

    });


    describe("throwing step", () => {

        describe("with provided step error", () => {
            const error = Symbol();
            const chain = treat().then(() => {
                throw new Error("This is step error")
            }, error);
            const input = Symbol();
            const report = errorReport(error);

            createChainTests(chain, input, report);
        });

        describe("without provided step error", () => {
            const chain = treat().then(() => {
                throw new Error("This is step error")
            });
            const input = Symbol();
            const report = errorReport();

            createChainTests(chain, input, report);
        });

    })

});
