import { type EmptyFn, emptyFn, isDefined } from '@rnw-community/shared';

export const bridgeSignal = (external: AbortSignal | undefined, onAbort: () => void): EmptyFn => {
    if (!isDefined(external)) {
        return emptyFn;
    }
    if (external.aborted) {
        onAbort();

        return emptyFn;
    }
    external.addEventListener('abort', onAbort, { once: true });

    return () => {
        external.removeEventListener('abort', onAbort);
    };
};
