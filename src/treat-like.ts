import {Chain, Converter, ErrorReport, Input, OkReport, Report} from "./types";

export const chainMethods = <I, O>(f: () => Chain<I, O>) => ({
    then: <N>(converter: Converter<O, N>, message?: string): Chain<I, N> =>
        continueChain(converter, f(), message),
});

const continueChain = <I, O, N>(converter: Converter<O, N>, prev: Chain<I, O>, message?: string) => {
    const chain: Chain<I, N> = {
        apply: (x: I) => {
            const prevResult = prev.apply(x);

            try {
                return converter(prevResult);
            } catch (e) {
                throw message ? new Error(message) : new Error("Converting error");
            }
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
