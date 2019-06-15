import {continueWith, createConvertingStep} from "./steps";

/**
 * Id step. Does nothing Just passes provided value thru
 */
export const id = continueWith;


/**
 * Applies *String(x)* for provided *x*
 */
export const asString = createConvertingStep(String);

/**
 * Tries to convert value to integer number.
 * If a value can't be converted or converting result is NaN, throws an error
 */
export const asInteger = createConvertingStep<unknown, number>(value => {
    switch (typeof value) {
        case "string":
            const parsed = parseInt(value);
            if (isNaN(parsed)) {
                throw new Error("Unable to represent as integer")
            }
            return parsed;

        case "number":
            return parseInt(value.toString());

        case "boolean":
            return value ? 1 : 0;

        default:
            throw new Error("Unable to represent as integer")
    }
});

/**
 * Tries to convert value to float number.
 * If a value can't be converted or converting result is NaN, throws an error
 */
export const asFloat = createConvertingStep<unknown, number>(value => {
    switch (typeof value) {
        case "string":
            const parsed = parseFloat(value);
            if (isNaN(parsed)) {
                throw new Error("Unable to represent as float")
            }
            return parsed;

        case "number":
            return parseFloat(value.toString());

        case "boolean":
            return value ? 1 : 0;

        default:
            throw new Error("Unable to represent as float")
    }
});

/**
 * Tries to convert provided string or number to Date object.
 * If a value can't be converted or converting result is invalid date, throws an error
 */
export const asDate = createConvertingStep<number | string, Date>(value => {
    const date = new Date(value);

    if (isNaN(date.getTime())) {
        throw new Error("Unable to represent as Date")
    }

    return date;
});
