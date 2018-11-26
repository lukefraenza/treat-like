import {all, head, merge} from "ramda";
import {Chain, Converter, ErrorReport, Input, OkReport, Report, Validator} from "./types";

export const chainMethods = <I, C>(f: () => Chain<I, C>) => ({
    then: <N>(converter: Converter<C, N>, message?: string): Chain<I, N> =>
        continueChain(converter, f(), message),
});

const continueChain = <I, C, N>(converter: Converter<C, N>, prev: Chain<I, C>, message?: string) => {
    const chain: Chain<I, N> = {
        apply: (x: I) => {
            let prevResult: C;
            let result: N;

            try {
                prevResult = prev.apply(x);
            } catch (e) {
                throw e;
            }

            try {
                result = converter(prevResult);
            } catch (e) {
                throw message ? new Error(message) : new Error("Converting error");
            }

            return result;
        },

        ...chainMethods(() => chain),
    };

    return chain;
};

export const treatLike = <C extends Chain<any, any>>(chain: C, input: Input<C>): Report<C> => {
    try {
        const value = chain.apply(input);
        return {ok: true, error: undefined, value} as OkReport<C>;
    } catch (e) {
        return {ok: false, error: e.message, value: undefined} as ErrorReport<C>;
    }
};
