import {chainMethods} from "./treat-like";
import {Chain} from "./types";
import {optionalTypeCheck} from "./validators";

/**
 * General chain creating function.
 * Creates chain of input type *I*. Does not append any conversions and checks by default.
 * Use *then* and *check* methods to extends chain
 * @returns {Chain}
 */
export const createChain = <I>() => {
    const chain: Chain<I, I> = {
        apply: (x: I): Promise<I> => Promise.resolve(x),

        ...chainMethods(() => chain),
    };

    return chain;
};

/**
 * Creates processing chain that expects on input value of *string* or *undefined* type
 * @param {string} message - error message to throw if value is not *string*
 * @returns {Chain<string, string>}
 */
export const string = (message?: string) => createChain<string>().check(optionalTypeCheck("string"), message);

/**
 * Creates processing chain that expects on input value of *number* or *undefined* type
 * @param {string} message - error message to throw if value is not *number*
 * @returns {Chain<number, number>}
 */
export const number = (message?: string) => createChain<number>().check(optionalTypeCheck("number"), message);

/**
 * Creates processing chain that expects on input value of *boolean* or *undefined* type
 * @param {string} message - error message to throw if value is not *boolean*
 * @returns {Chain<boolean, boolean>}
 */
export const boolean = (message?: string) => createChain<boolean>().check(optionalTypeCheck("boolean"), message);
