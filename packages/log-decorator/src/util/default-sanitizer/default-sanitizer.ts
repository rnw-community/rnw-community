import type { SanitizerFnType } from '../../type/sanitizer-fn-type/sanitizer-fn.type';

const MAX_STRING_LENGTH = 200;
const MAX_ARRAY_LENGTH = 20;

const sanitizeString = (value: string): string =>
    value.length > MAX_STRING_LENGTH ? `<truncated:${value.length.toString()}>` : value;

const sanitizeError = (err: Error): { name: string; message: string; stack?: string } => {
    const out: { name: string; message: string; stack?: string } = {
        name: err.name,
        message: sanitizeString(err.message),
    };
    if (typeof err.stack === 'string') {
        out.stack = sanitizeString(err.stack);
    }
    return out;
};

const sanitizeInner = (value: unknown, path: WeakSet<object>): unknown => {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === 'string') {
        return sanitizeString(value);
    }

    if (typeof value !== 'object' && typeof value !== 'function') {
        return value;
    }

    if (value instanceof Error) {
        return sanitizeError(value);
    }
    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? '[Invalid Date]' : value.toISOString();
    }
    if (value instanceof RegExp) {
        return value.toString();
    }
    if (value instanceof Map) {
        return { _type: 'Map', size: value.size };
    }
    if (value instanceof Set) {
        return { _type: 'Set', size: value.size };
    }

    if (Array.isArray(value)) {
        if (value.length > MAX_ARRAY_LENGTH) {
            return { length: value.length };
        }
        if (path.has(value)) {
            return '[Circular]';
        }
        path.add(value);
        const arrResult = value.map((item: unknown) => sanitizeInner(item, path));
        path.delete(value);
        return arrResult;
    }

    if (path.has(value as object)) {
        return '[Circular]';
    }
    path.add(value as object);

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
        result[key] = sanitizeInner((value as Record<string, unknown>)[key], path);
    }
    path.delete(value as object);
    return result;
};

export const defaultSanitizer: SanitizerFnType = (value: unknown): unknown => {
    const path = new WeakSet<object>();
    return sanitizeInner(value, path);
};
