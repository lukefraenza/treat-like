import {Chain, Step, StepContinueResult, StepErrorResult, StepStopResult} from "./types";

/**
 * Creates continue step result from provided value
 * @param value
 */
export const continueWith = <Output>(value: Output): StepContinueResult<Output> =>
    Object.freeze({ok: true, stop: false, value});

/**
 * Crates stop step result from provided value
 * @param value
 */
export const stopWith = <Output>(value: Output): StepStopResult<Output> =>
    Object.freeze({ok: true, stop: true, value});

/**
 * Creates error step result from provided error
 */
export const error = (): StepErrorResult =>
    Object.freeze({ok: false});

/**
 * Creates simple converting step from provided function.
 * @param f converting function
 */
export function createConvertingStep<Input, Output>(f: (x: Input) => Output): Step<Input, Output, never> {
    return (value: Input) => continueWith(f(value))
}

/**
 * Creates simple validation step from provided predicate and error
 * @param p validation predicate
 */
export function createValidationStep<Input>(p: (x: Input) => boolean): Step<Input, Input, never> {
    return (value: Input) => {
        const valid = p(value);

        return valid ? continueWith(value) : error();
    }
}


/**
 * Creates array processing step
 * Applies specified chain to each element of array
 * @param chain
 */
export function arrayOf<ChainInput, ChainContinueOutput, ChainStopOutput = never, ChainError = never>(chain: Chain<ChainInput, ChainContinueOutput, ChainStopOutput, ChainError>): Step<ChainInput[], ChainContinueOutput[], ChainStopOutput[]> {
    return (input: ChainInput[]) => {
        const reports = input.map(chain.apply);
        const ok = !reports.find(r => !r.ok);

        if (ok) {
            return continueWith((reports as any).map((r: any) => r.value))
        }

        return error();
    }
}
