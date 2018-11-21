export const provided = (x: any): boolean => x !== undefined && x !== null;

type Sizable = number | { length: number };
const sizeof = (value: Sizable): number => (typeof value === "number") ? value : value.length;

export const gt = (x: Sizable) => (y: Sizable): boolean => sizeof(y) > sizeof(x);
export const lt = (x: Sizable) => (y: Sizable): boolean => sizeof(y) < sizeof(x);
export const gte = (x: Sizable) => (y: Sizable): boolean => sizeof(y) >= sizeof(x);
export const lte = (x: Sizable) => (y: Sizable): boolean => sizeof(y) <= sizeof(x);

export const positive = (value: number): boolean => gt(0)(value);
export const negative = (value: number): boolean => lt(0)(value);

export const optionalTypeCheck = (type: "string" | "number" | "boolean" | "object") =>
    (value: any) => {
        if (value === undefined) {
            return true;
        }

        if (value === null) {
            return false;
        }

        return typeof value === type;
    };
