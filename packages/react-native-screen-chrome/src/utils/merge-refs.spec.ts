import { describe, expect, it, jest } from '@jest/globals';

import { mergeRefs } from './merge-refs.util.js';

interface Instance {
    readonly id: string;
}

const INSTANCE: Instance = { id: 'instance' };
const NEWER_INSTANCE: Instance = { id: 'newer-instance' };

describe('mergeRefs', () => {
    it('writes to object refs', () => {
        const objectRef: { current: Instance | null } = { current: null };
        const mergedRef = mergeRefs(objectRef);

        mergedRef(INSTANCE);

        expect(objectRef.current).toBe(INSTANCE);
    });

    it('calls callback refs', () => {
        const callbackRef = jest.fn<(instance: Instance | null) => void>();
        const mergedRef = mergeRefs<Instance>(callbackRef);

        mergedRef(INSTANCE);

        expect(callbackRef).toHaveBeenCalledWith(INSTANCE);
    });

    it('ignores null and undefined refs while updating defined refs', () => {
        const objectRef: { current: Instance | null } = { current: null };
        const mergedRef = mergeRefs<Instance>(null, undefined, objectRef);

        mergedRef(INSTANCE);

        expect(objectRef.current).toBe(INSTANCE);
    });

    it('updates multiple refs with null cleanup instances', () => {
        const objectRef: { current: Instance | null } = { current: INSTANCE };
        const callbackRef = jest.fn<(instance: Instance | null) => void>();
        const mergedRef = mergeRefs<Instance>(objectRef, callbackRef);

        mergedRef(null);

        expect(objectRef.current).toBeNull();
        expect(callbackRef).toHaveBeenCalledWith(null);
    });

    it('returns a cleanup that calls callback cleanup values', () => {
        const cleanup = jest.fn<() => void>();
        const callbackRef = jest.fn<(instance: Instance | null) => () => void>(() => cleanup);
        const mergedRef = mergeRefs<Instance>(callbackRef);
        const mergedCleanup = mergedRef(INSTANCE);

        if (typeof mergedCleanup !== 'function') {
            throw new Error('mergeRefs did not return a cleanup');
        }

        mergedCleanup();

        expect(cleanup).toHaveBeenCalledTimes(1);
    });

    it('returns a cleanup that clears object refs', () => {
        const objectRef: { current: Instance | null } = { current: null };
        const mergedRef = mergeRefs(objectRef);
        const mergedCleanup = mergedRef(INSTANCE);

        if (typeof mergedCleanup !== 'function') {
            throw new Error('mergeRefs did not return a cleanup');
        }

        mergedCleanup();

        expect(objectRef.current).toBeNull();
    });

    it('does not clear a newer object ref value from an older cleanup', () => {
        const objectRef: { current: Instance | null } = { current: null };
        const mergedRef = mergeRefs(objectRef);
        const olderCleanup = mergedRef(INSTANCE);

        mergedRef(NEWER_INSTANCE);

        if (typeof olderCleanup !== 'function') {
            throw new Error('mergeRefs did not return a cleanup');
        }

        olderCleanup();

        expect(objectRef.current).toBe(NEWER_INSTANCE);
    });
});
