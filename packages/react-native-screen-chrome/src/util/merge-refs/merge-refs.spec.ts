import { describe, expect, it, jest } from '@jest/globals';

import { mergeRefs } from './merge-refs.util';

import type { MutableRefObject, Ref } from 'react';

describe('mergeRefs', () => {
    it('assigns the instance to every object ref it is given', () => {
        expect.assertions(2);

        const first: MutableRefObject<string | null> = { current: null };
        const second: MutableRefObject<string | null> = { current: null };

        mergeRefs(first, second)('instance');

        expect(first.current).toBe('instance');
        expect(second.current).toBe('instance');
    });

    it('calls every function ref it is given with the instance', () => {
        expect.assertions(2);

        const first = jest.fn<(instance: string | null) => void>();
        const second = jest.fn<(instance: string | null) => void>();

        mergeRefs<string>(first, second)('instance');

        expect(first).toHaveBeenCalledWith('instance');
        expect(second).toHaveBeenCalledWith('instance');
    });

    it('fans a single instance out to mixed function and object refs together', () => {
        expect.assertions(2);

        const callback = jest.fn<(instance: string | null) => void>();
        const object: MutableRefObject<string | null> = { current: null };

        mergeRefs<string>(callback, object)('instance');

        expect(callback).toHaveBeenCalledWith('instance');
        expect(object.current).toBe('instance');
    });

    it('skips null and undefined refs instead of throwing', () => {
        expect.assertions(2);

        const object: MutableRefObject<string | null> = { current: null };
        const refs: Ref<string>[] = [null, object];

        expect(() => mergeRefs<string>(...refs)('instance')).not.toThrow();
        expect(object.current).toBe('instance');
    });

    it('propagates the detach null to every ref when React clears the callback', () => {
        expect.assertions(2);

        const callback = jest.fn<(instance: string | null) => void>();
        const object: MutableRefObject<string | null> = { current: 'instance' };

        mergeRefs<string>(callback, object)(null);

        expect(callback).toHaveBeenCalledWith(null);
        expect(object.current).toBeNull();
    });
});
