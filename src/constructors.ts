import {chainMethods} from "./treat-like";
import {Chain} from "./types";

export const createChain = <I>() => {
    const pipe: Chain<I, I> = {
        apply: (x: I): Promise<I> => Promise.resolve(x),

        ...chainMethods(() => pipe),
    };

    return pipe;
};

export const string = createChain<string>();
export const number = createChain<number>();
export const boolean = createChain<boolean>();
