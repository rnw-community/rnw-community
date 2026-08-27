import { describe, expect, it, jest } from '@jest/globals';

import { mergeRefs } from './merge-refs.util';

import type { MutableRefObject, Ref } from 'react';

describe('mergeRefs', () => {
    it('assigns the instance to every object ref it is given', () => {
        expect.hasAssertions();

        const first: MutableRefObject<string | null> = { current: null };
        const second: MutableRefObject<string | null> = { current: null };

        mergeRefs(first, second)('instance');

        expect(first.current).toBe('instance');
        expect(second.current).toBe('instance');
    });

    it('calls every function ref it is given with the instance', () => {
        expect.hasAssertions();

        const first = jest.fn<(instance: string | null) => void>();
        const second = jest.fn<(instance: string | null) => void>();

        mergeRefs<string>(first, second)('instance');

        expect(first).toHaveBeenCalledWith('instance');
        expect(second).toHaveBeenCalledWith('instance');
    });

    it('fans a single instance out to mixed function and object refs together', () => {
        expect.hasAssertions();

        const callback = jest.fn<(instance: string | null) => void>();
        const object: MutableRefObject<string | null> = { current: null };

        mergeRefs<string>(callback, object)('instance');

        expect(callback).toHaveBeenCalledWith('instance');
        expect(object.current).toBe('instance');
    });

    it('skips null and undefined refs instead of throwing', () => {
        expect.hasAssertions();

        const object: MutableRefObject<string | null> = { current: null };
        const refs: (Ref<string> | undefined)[] = [null, void 0, object];
        const cleanup = mergeRefs<string>(...refs)('instance');

        expect(object.current).toBe('instance');
        expect(() => cleanup?.()).not.toThrow();
        expect(object.current).toBeNull();
    });

    it('detaches refs that returned no cleanup by clearing them from the returned cleanup', () => {
        expect.hasAssertions();

        const callback = jest.fn<(instance: string | null) => void>();
        const object: MutableRefObject<string | null> = { current: null };

        mergeRefs<string>(callback, object)('instance')?.();

        expect(callback).toHaveBeenLastCalledWith(null);
        expect(object.current).toBeNull();
    });

    it('runs a child ref cleanup instead of detaching that ref with null', () => {
        expect.hasAssertions();

        const cleanup = jest.fn();
        const callback = jest.fn<(instance: string | null) => () => void>(() => cleanup);

        mergeRefs<string>(callback)('instance')?.();

        expect(cleanup).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalledWith(null);
    });

    it('propagates the detach null to every ref when React clears the callback directly', () => {
        expect.hasAssertions();

        const callback = jest.fn<(instance: string | null) => void>();
        const object: MutableRefObject<string | null> = { current: 'instance' };

        mergeRefs<string>(callback, object)(null);

        expect(callback).toHaveBeenCalledWith(null);
        expect(object.current).toBeNull();
    });
});
