export type Converter<A, B> = (a: A) => B | Promise<B>;
export type Validator<A> = (a: A) => boolean | Promise<boolean>;

export interface Chain<I, C> {
    check: (validator: Validator<C>, message?: string) => Chain<I, C>;
    then: <N>(converter: Converter<C, N>, message?: string) => Chain<I, N>;

    apply(a: I): Promise<C>;
}

export type Input<S> =
    S extends Chain<infer I, any> ? I | undefined :
        S extends { [K: string]: any } ? { [K in keyof S]?: Input<S[K]> } :
            S | undefined;

export type FullOutput<S> =
    S extends Chain<any, infer C> ? C :
        S extends { [K: string]: any } ? { [K in keyof S]: Input<S[K]> } :
            S;

export type PartialOutput<S> =
    S extends Chain<any, infer C> ? C | undefined :
        S extends { [K: string]: any } ? { [K in keyof S]: Input<S[K]> } :
            S;

export type Errors<S> =
    S extends Chain<any, any> ? string | undefined :
        S extends { [K: string]: any } ? { [K in keyof S]: Errors<S[K]> } :
            string | undefined;

export interface OkReport<S> {
    ok: true;
    value: FullOutput<S>;
    error: undefined;
}

export interface ErrorReport<S> {
    ok: false;
    error?: Errors<S>;
    value?: PartialOutput<S>;
}

export type Report<S> = OkReport<S> | ErrorReport<S>;
