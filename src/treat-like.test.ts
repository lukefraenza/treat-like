import {number} from "./constructors";
import {treatLike} from "./treat-like";
import {provided} from "./validators";

const tuple = <T extends any[]>(...args: T) => args;

describe("treatLike", async () => {

    describe("provides ok report on valid data", () => {

        test("simple dict object", async () => {
            const schema = {
                x: number.check(provided).then((x) => x * 2),
                y: number.check(provided).then((y) => y + 10),
            };

            const report = await treatLike(schema, {x: 5, y: 4});

            expect(report.ok).toBeTruthy();
            expect(report.error).toEqual({x: undefined, y: undefined});
            expect(report.value).toEqual({x: 10, y: 14});
        });

    });

});
