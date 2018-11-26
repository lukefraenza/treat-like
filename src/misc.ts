export const tuple = <T extends any[]>(...items: T) => items;

export const optional = <A, B>(f: (a: A) => B) =>
    (a: A | null | undefined) =>
        a === null ? null : a === undefined ? undefined : f(a);

