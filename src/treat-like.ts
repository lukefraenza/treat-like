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

const isChain = (obj: any): obj is Chain<any, any> => obj.hasOwnProperty("apply");

export const treatLike = async <S>(schema: S, input: Input<S>): Promise<Report<S>> => {
    // primitive
    if (isChain(schema)) {
        return await schema.apply(input)
            .then((value) => ({
                ok: true,
                value,
            }) as OkReport<S>)
            .catch((error) => ({
                ok: false,
                error: error.toString(),
            }) as ErrorReport<S>);
    }

    // List
    if (Array.isArray(schema) && schema.length === 1) {
        const subSchema = head(schema);

        if (Array.isArray(input)) {
            const subReports = await Promise.all(input.map((subInput) => treatLike(subSchema, subInput)));

            const ok = all((report) => report.ok, subReports);

            const value = subReports.map((report) => report.value);
            const error = subReports.map((report) => report.error);

            return {ok, value, error} as any as Report<S>;
        }

        // TODO: What to do if input is not array?
    }

    // tuple
    if (Array.isArray(schema) && schema.length > 1) {
        if (Array.isArray(input)) {
            const subReports = await Promise.all(input.map((subInput, i) => treatLike(schema[i], subInput)));

            const ok = all((report) => report.ok, subReports);

            const value = subReports.map((report) => report.value);
            const error = subReports.map((report) => report.error);

            return {ok, value, error} as any as Report<S>;
        }

        // TODO: What to do if input is not array?
    }

    // dict
    if (typeof schema === "object" && schema !== null) {
        if (typeof input === "object" && input !== null) {

            const keys = Object.keys(schema) as Array<keyof typeof schema>;

            const subReports = await Promise.all(
                keys.map(async (key) => {
                    const subSchema = schema[key];
                    const subInput = (input as typeof schema)[key];

                    const report = await treatLike(subSchema, subInput as Input<typeof subSchema>);

                    return {key, report};
                }),
            );

            const ok = all((item) => item.report.ok, subReports);
            const value = subReports.map((item) => ({[item.key]: item.report.value})).reduce(merge);
            const error = subReports.map((item) => ({[item.key]: item.report.error})).reduce(merge);

            return {ok, value, error} as any as Report<S>;
        }

        // TODO: What to do if input is not object?
    }

    return {ok: false, error: "not suitable", value: undefined} as ErrorReport<S>;
};
