import {Chain, ChainInput, Converter, FailReport, Report, SuccessReport} from "./types";

export const chainMethods = <I, O>(getChain: () => Chain<I, O>) => ({

    then: <N>(converter: Converter<O, N>, message?: string): Chain<I, N> => {
        const chain: Chain<I, N> = {
            apply: (x: I) => {
                const prevResult = getChain().apply(x);

                try {
                    return converter(prevResult);
                } catch (e) {
                    throw message ? new Error(message) : new Error("Converting error");
                }
            },

            ...chainMethods(() => chain),
        };

        return chain;
    },

});

export const treatLike = <C extends Chain<any, any>>(chain: C, input: ChainInput<C>): Report<C> => {
    try {
        const value = chain.apply(input);
        return {ok: true, error: undefined, value} as SuccessReport<C>;
    } catch (e) {
        return {ok: false, error: e.message, value: undefined} as FailReport<C>;
    }
};
