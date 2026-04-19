export type SanitizerFnType = (value: unknown) => unknown;

const MAX_STRING_LENGTH = 200;
const MAX_ARRAY_LENGTH = 20;

const sanitizeInner = (value: unknown, seen: WeakSet<object>): unknown => {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === 'string') {
        if (value.length > MAX_STRING_LENGTH) {
            return `<truncated:${value.length.toString()}>`;
        }
        return value;
    }

    if (typeof value !== 'object' && typeof value !== 'function') {
        return value;
    }

    if (Array.isArray(value)) {
        if (value.length > MAX_ARRAY_LENGTH) {
            return { length: value.length };
        }
        return value;
    }

    if (seen.has(value as object)) {
        return '[Circular]';
    }
    seen.add(value as object);

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
        result[key] = sanitizeInner((value as Record<string, unknown>)[key], seen);
    }
    return result;
};

export const defaultSanitizer: SanitizerFnType = (value: unknown): unknown => {
    const seen = new WeakSet<object>();
    return sanitizeInner(value, seen);
};
