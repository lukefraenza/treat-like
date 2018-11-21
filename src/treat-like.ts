import {all, head, merge} from "ramda";
import {Chain, Converter, ErrorReport, Input, OkReport, Report, Validator} from "./types";

export const chainMethods = <I, C>(f: () => Chain<I, C>) => ({
    then: <N>(converter: Converter<C, N>, message?: string): Chain<I, N> =>
        continueConvertingChain(converter, f(), message),

    check: (validator: Validator<C>, message?: string): Chain<I, C> =>
        continueValidatingChain(validator, f(), message),
});

const continueValidatingChain = <I, C>(
    validator: Validator<C>,
    prev: Chain<I, C>,
    message?: string,
) => {
    const chain: Chain<I, C> = {
        apply: (x: I) => {
            let prevError: Error | null = null;

            return prev
                .apply(x)
                .catch((e) => {
                    throw (prevError = e);
                })
                .then((value) => {
                    return Promise.resolve(value)
                        .then(validator)
                        .then((valid) => {
                            if (valid) {
                                return value;
                            } else {
                                throw new Error(message || "Validation failed");
                            }
                        })
                        .catch((e) => {
                            if (prevError != null) {
                                throw prevError;
                            }

                            throw message ? new Error(message) : new Error("Validation Error");
                        });
                });
        },

        ...chainMethods(() => chain),
    };

    return chain;
};

const continueConvertingChain = <I, C, N>(converter: Converter<C, N>, prev: Chain<I, C>, message?: string) => {
    const chain: Chain<I, N> = {
        apply: (x: I) => {
            let prevError: Error | null = null;

            return prev
                .apply(x)
                .catch((e) => {
                    throw (prevError = e);
                })
                .then(converter)
                .catch((e) => {
                    if (prevError != null) {
                        throw prevError;
                    }

                    throw message ? new Error(message) : new Error("Converting error");
                });
        },

        ...chainMethods(() => chain),
    };

    return chain;
};

const isChain = (obj: any): obj is Chain<any, any> => {
    return typeof obj === "object" && obj !== null && obj.hasOwnProperty("apply");
};

export const treatLike = async <S>(schema: S, input: Input<S>): Promise<Report<S>> => {
    // primitive
    if (isChain(schema)) {
        return await schema.apply(input)
            .then((value) => ({
                ok: true,
                value,
            }) as OkReport<S>)
            .catch((error: Error) => ({
                ok: false,
                error: error.message,
            }) as ErrorReport<S>);
    }

    // List
    if (Array.isArray(schema) && schema.length === 1) {
        const subSchema = head(schema);
        const inputList = (Array.isArray(input) ? input : []) as typeof schema;

        const subReports = await Promise.all(inputList.map((subInput) => treatLike(subSchema, subInput)));

        const ok = all((report) => report.ok, subReports);

        const value = subReports.map((report) => report.value);
        const error = subReports.map((report) => report.error);

        return {ok, value, error} as any as Report<S>;
    }

    // tuple
    if (Array.isArray(schema) && schema.length > 1) {
        const inputTuple = (Array.isArray(input) ? input : []) as typeof schema;

        const subReports = await Promise.all(schema.map((subSchema, i) => treatLike(subSchema, inputTuple[i])));

        const ok = all((report) => report.ok, subReports);

        const value = subReports.map((report) => report.value);
        const error = subReports.map((report) => report.error);

        return {ok, value, error} as any as Report<S>;
    }

    // dict
    if (typeof schema === "object" && schema !== null) {
        const inputDict = ((input === null || typeof input !== "object") ? {} : input) as typeof schema;

        const keys = Object.keys(schema) as Array<keyof typeof schema>;

        const subReports = await Promise.all(
            keys.map(async (key) => {
                const subSchema = schema[key];
                const subInput = inputDict[key];

                const report = await treatLike(subSchema, subInput as Input<typeof subSchema>);

                return {key, report};
            }),
        );

        const ok = all((item) => item.report.ok, subReports);
        const value = subReports.map((item) => ({[item.key]: item.report.value})).reduce(merge);
        const error = subReports.map((item) => ({[item.key]: item.report.error})).reduce(merge);

        return {ok, value, error} as any as Report<S>;

    }

    return {ok: false, error: "not suitable", value: undefined} as ErrorReport<S>;
};
