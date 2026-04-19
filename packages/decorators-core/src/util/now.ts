/* istanbul ignore next -- environment-dependent fallback (Date.now), unreachable in Node test env */
const pickNow = (): (() => number) => {
    const perf = (globalThis as { readonly performance?: { readonly now?: () => number } }).performance;
    if (typeof perf?.now === 'function') {
        return () => perf.now!();
    }
    return () => Date.now();
};

export const now = pickNow();
