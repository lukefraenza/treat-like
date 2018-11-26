import {chainMethods} from "./treat-like";
import {Chain} from "./types";
import {optionalTypeCheck} from "./validators";

/**
 * General chain creating function.
 * Creates chain of input type *I*. Does not append any conversions and checks by default.
 * Use *then* and *check* methods to extends chain
 * @returns {Chain}
 */
export const createChain = () => {
    const chain: Chain<unknown, unknown> = {
        apply: (x: unknown): unknown => x,

        ...chainMethods(() => chain),
    };

    return chain;
};