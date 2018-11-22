export const tuple = <T extends any[]>(...items: T) => items;

export const optionalConverter = <A, B>(f: (a: A) => B) =>
    (a: A | null | undefined) =>
        a === null ? null : a === undefined ? undefined : f(a);

export const optionalValidator = <A>(f: (a: A) => boolean) =>
    (a: A | null | undefined) =>
        a === null ? true : a === undefined ? true : f(a);
