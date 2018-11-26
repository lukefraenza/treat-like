export type Converter<A, B> = (a: A) => B;

export interface Chain<I, O> {
    then: <N>(converter: Converter<O, N>, message?: string) => Chain<I, N>;

    apply(value: I): O;
}

export type Input<T> = T extends Chain<infer I, any> ? I : never;
export type Output<T> = T extends Chain<any, infer O> ? O : never;

export type FailMessage = string | undefined;

export interface OkReport<T> {
    ok: true;
    error: undefined;
    value: Output<T>;
}

export interface ErrorReport<T> {
    ok: false;
    error: FailMessage;
    value: undefined
}

export type Report<T> = OkReport<T> | ErrorReport<T>;
