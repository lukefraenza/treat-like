export type Converter<A, B> = (a: A) => B;

export interface Chain<I, O> {
    then: <N>(converter: Converter<O, N>, message?: string) => Chain<I, N>;

    apply(value: I): O;
}

export type ChainInput<T> = T extends Chain<infer I, any> ? I : never;
export type ChainOutput<T> = T extends Chain<any, infer O> ? O : never;

export type FailMessage = string | undefined;

export interface SuccessReport<T> {
    ok: true;
    error: undefined;
    value: ChainOutput<T>;
}

export interface FailReport<T> {
    ok: false;
    error: FailMessage;
    value: undefined;
}

export type Report<T> = SuccessReport<T> | FailReport<T>;
