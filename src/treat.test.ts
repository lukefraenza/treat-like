import {treat} from "./treat";
import {id} from "./steps";

describe("chain", () => {

    describe("treat", () => {

        test("completes without errors", () => {
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

    describe("valid continue chain", () => {
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

        })
    });


});
