import {treat} from "./treat";
import {asDate, continueWith, id, isString} from "./steps";

describe("chain", () => {

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
        const chain = treat();

        describe("single 'id' step", () => {
            const c = chain.then(id);

            const input = Symbol();
            const expected = input;

            test("does not throw error", () => {
                expect(() => c.apply(input)).not.toThrow();
            });

            test("has ok state", () => {
                const report = c.apply(input);

                expect(report.ok).toBeTruthy();
            });

            test("has expected output", () => {
                const report = c.apply(input);

                report.ok && expect(report.value).toBe(expected);
            });

            test("has no error field", () => {
                const report = c.apply(input);

                expect(report).not.toHaveProperty("error");
            });

        });


        describe("three converting steps", () => {
            const c = chain.then(asDate).then(x => continueWith(x.getDay())).then(x => continueWith(x * 2));

            const input = (new Date().toString());
            const expected = new Date(input).getDay() * 2;

            test("does not throw error", () => {
                expect(() => c.apply(input)).not.toThrow();
            });

            test("has ok state", () => {
                const report = c.apply(input);

                expect(report.ok).toBeTruthy();
            });

            test("has expected output", () => {
                const report = c.apply(input);

                report.ok && expect(report.value).toBe(expected);
            });

            test("has no error field", () => {
                const report = c.apply(input);

                expect(report).not.toHaveProperty("error");
            });

        });

    });

    describe("invalid input", () => {
        const chain = treat();

        describe("single validation step", () => {
            const error = Symbol("error");
            const c = chain.then(isString, error);

            const input = 123;
            const expectedError = error;

            test("does not throws error", () => {
                expect(() => c.apply(input)).not.toThrow();
            });

            test("has no ok state", () => {
                const report = c.apply(input);

                expect(report.ok).toBeFalsy();
            });

            test("has expected error", () => {
                const report = c.apply(input);

                report.ok || expect(report.error).toBe(expectedError);
            });

            test("has not value field", () => {
                const report = c.apply(input);

                expect(report).not.toHaveProperty("value");
            });

        });

    });


});
