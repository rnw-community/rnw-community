import type { SanitizerFnType } from './sanitizer-fn.type';

const MAX_STRING_LENGTH = 200;
const MAX_ARRAY_LENGTH = 20;

type SanitizePath = WeakSet<object>;
type SanitizeFn = (value: unknown, path: SanitizePath) => unknown;

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

const sanitizeArray = (value: unknown[], path: SanitizePath, sanitize: SanitizeFn): unknown => {
    if (value.length > MAX_ARRAY_LENGTH) {
        return { length: value.length };
    }
    if (path.has(value)) {
        return '[Circular]';
    }
    path.add(value);
    const arrResult = value.map((item: unknown) => sanitize(item, path));
    path.delete(value);

    return arrResult;
};

const sanitizeObject = (value: object, path: SanitizePath, sanitize: SanitizeFn): unknown => {
    if (path.has(value)) {
        return '[Circular]';
    }
    path.add(value);
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
        result[key] = sanitize((value as Record<string, unknown>)[key], path);
    }
    path.delete(value);

    return result;
};

const sanitizeBuiltin = (value: object): unknown => {
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

    return void 0;
};

const sanitizeSpecialObject = (value: object, path: SanitizePath, sanitize: SanitizeFn): unknown => {
    const builtin = sanitizeBuiltin(value);
    if (builtin !== void 0) {
        return builtin;
    }
    if (Array.isArray(value)) {
        return sanitizeArray(value, path, sanitize);
    }

    return sanitizeObject(value, path, sanitize);
};

const sanitizeInner = (value: unknown, path: SanitizePath): unknown => {
    if (value === null || value === void 0) {
        return value;
    }
    if (typeof value === 'string') {
        return sanitizeString(value);
    }
    if (typeof value !== 'object' && typeof value !== 'function') {
        return value;
    }

    return sanitizeSpecialObject(value, path, sanitizeInner);
};

export const defaultSanitizer: SanitizerFnType = (value: unknown): unknown => {
    const path: SanitizePath = new WeakSet();

    return sanitizeInner(value, path);
};
