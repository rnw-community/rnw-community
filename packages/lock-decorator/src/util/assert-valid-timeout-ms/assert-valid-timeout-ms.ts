export const assertValidTimeoutMs = (value: number | undefined): void => {
    if (value === void 0) {
        return;
    }
    if (!Number.isFinite(value) || value <= 0) {
        throw new TypeError(`timeoutMs must be a positive finite number, received ${String(value)}`);
    }
};
