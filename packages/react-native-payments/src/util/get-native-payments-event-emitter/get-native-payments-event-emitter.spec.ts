import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NativeEventEmitter } from 'react-native';

import { NativePayments } from '../../class/native-payments/native-payments.js';

import { getNativePaymentsEventEmitter } from './get-native-payments-event-emitter.util.js';

jest.mock('react-native', () => ({ NativeEventEmitter: jest.fn() }));

jest.mock('../../class/native-payments/native-payments', () => ({
    NativePayments: { addListener: jest.fn(), removeListeners: jest.fn() },
}));

const mutableNativePayments = NativePayments as { addListener?: unknown; removeListeners?: unknown };

describe('getNativePaymentsEventEmitter', () => {
    beforeEach(() => {
        jest.mocked(NativeEventEmitter).mockClear();
    });

    it('should build the emitter from the same native module handle used for method calls', () => {
        expect.hasAssertions();

        const emitter = getNativePaymentsEventEmitter();

        expect(jest.mocked(NativeEventEmitter)).toHaveBeenCalledWith(NativePayments);
        expect(emitter).toBeInstanceOf(NativeEventEmitter);
    });

    it('should build the emitter only once', () => {
        expect.hasAssertions();

        const emitter = getNativePaymentsEventEmitter();

        expect(getNativePaymentsEventEmitter()).toBe(emitter);
        expect(jest.mocked(NativeEventEmitter)).not.toHaveBeenCalled();
    });

    it('should return null when the native module cannot emit events', () => {
        expect.hasAssertions();

        const { addListener } = mutableNativePayments;
        delete mutableNativePayments.addListener;

        expect(getNativePaymentsEventEmitter()).toBeNull();
        expect(jest.mocked(NativeEventEmitter)).not.toHaveBeenCalled();

        mutableNativePayments.addListener = addListener;
    });

    it('should return null when the native module cannot release event listeners', () => {
        expect.hasAssertions();

        const { removeListeners } = mutableNativePayments;
        delete mutableNativePayments.removeListeners;

        expect(getNativePaymentsEventEmitter()).toBeNull();

        mutableNativePayments.removeListeners = removeListeners;
    });
});
