import {Step, StepContinueResult, StepErrorResult, StepResult, StepStopResult} from "./types";

/**
 * Creates normal step result from provided value
 * @param value
 */
export const continueWith = <Output>(value: Output): StepContinueResult<Output> => ({
    ok: true,
    stop: false,
    value
});

/**
 * Crates stop step result from provided value
 * @param value
 */
export const stopWith = <Output>(value: Output): StepStopResult<Output> => ({
    ok: true,
    stop: true,
    value
});

/**
 * Creates error step result from provided error
 */
export const error = (): StepErrorResult => ({
    ok: false,
});


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

// ID Step
export const id = continueWith;


// Simple preset converters
export const asString = createConvertingStep(String);
export const asInteger = createConvertingStep(parseInt);
export const asFloat = createConvertingStep(parseFloat);
export const rounded = createConvertingStep(Math.round);

// Simple preset validators
export const gt = (x: number) => createValidationStep<number>(value => value > x);
export const gte = (x: number) => createValidationStep<number>(value => value >= x);
export const lt = (x: number) => createValidationStep<number>(value => value < x);
export const lte = (x: number) => createValidationStep<number>(value => value <= x);


/**
 * Step that checks value is not *null*
 * @param value
 */
export const notNull = <T>(value: T | null): StepResult<T, never> =>
    value === null ? error() : continueWith(value);


/**
 * Step that checks value is not *undefined*
 * @param value
 */
export const defined = <T>(value: T | undefined): StepResult<T, never> =>
    value === undefined ? error() : continueWith(value);


/**
 * Step that checks value is not *null* and not *undefined*
 * @param value
 */
export const provided = <T>(value: T | null | undefined): StepResult<T, never> =>
    value === undefined || value === null ? error() : continueWith(value);


/**
 * Step that ensures value is string
 * @param value
 */
export const isString = (value: unknown): StepResult<string, never> =>
    typeof value === "string" ? continueWith(value) : error();

/**
 * Step that ensures value is string
 * @param value
 */
export const isNumber = (value: unknown): StepResult<number, never> =>
    typeof value === "number" ? continueWith(value) : error();

