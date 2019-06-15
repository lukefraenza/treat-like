import {continueWith, createValidationStep, error} from "./steps";
import {StepResult} from "./types";

export const gt = (x: number) => createValidationStep<number>(value => value > x);
export const gte = (x: number) => createValidationStep<number>(value => value >= x);
export const lt = (x: number) => createValidationStep<number>(value => value < x);
export const lte = (x: number) => createValidationStep<number>(value => value <= x);


/**
 * Checks provided value is not *null*
 * @param value
 */
export const notNull = <T>(value: T | null): StepResult<T, never> =>
    value === null ? error() : continueWith(value);


/**
 * Checks provided value is not *undefined*
 * @param value
 */
export const defined = <T>(value: T | undefined): StepResult<T, never> =>
    value === undefined ? error() : continueWith(value);


/**
 * Checks provided value is not *null* and not *undefined*
 * @param value
 */
export const provided = <T>(value: T | null | undefined): StepResult<T, never> =>
    value === undefined || value === null ? error() : continueWith(value);


/**
 * Checks provided value is string
 * @param value
 */
export const isString = (value: unknown): StepResult<string, never> =>
    typeof value === "string" ? continueWith(value) : error();


/**
 * Checks provided value is number
 * @param value
 */
export const isNumber = (value: unknown): StepResult<number, never> =>
    typeof value === "number" ? continueWith(value) : error();


/**
 * Checks provided value is boolean
 * @param value
 */
export const isBoolean = (value: unknown): StepResult<boolean, never> =>
    typeof value === "boolean" ? continueWith(value) : error();

