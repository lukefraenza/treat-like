export type Converter<A, B> = (a: A) => B;
export type Validator<A> = (a: A) => boolean;

export interface Chain<I, C> {
    then: <N>(converter: Converter<C, N>, message?: string) => Chain<I, N>;

    apply(value: I): C;
}

export type Input<S> = S extends Chain<infer I, any> ? I : never;

export type FullOutput<S> =
    S extends Chain<any, infer O> ? O : never;

export type PartialOutput<S> =
    S extends Chain<any, infer C> ? C | undefined : never;

export type Errors<S> =
    S extends Chain<any, any> ? string | undefined : never;

export interface OkReport<S> {
    ok: true;
    value: FullOutput<S>;
    error: Errors<S>;
}

export interface ErrorReport<S> {
    ok: false;
    error?: Errors<S>;
    value?: PartialOutput<S>;
}

export type Report<S> = OkReport<S> | ErrorReport<S>;
