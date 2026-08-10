import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { NativeModules } from 'react-native';

const mockTurboModule: { current: unknown } = { current: null };

jest.mock('react-native', () => ({
    NativeModules: {},
    Platform: { select: (specifics: { default: string }) => specifics.default },
    TurboModuleRegistry: { get: () => mockTurboModule.current },
}));

interface LoadedNativePaymentsInterface {
    addListener?: unknown;
    removeListeners?: unknown;
    retry?: unknown;
    setActiveEvents?: unknown;
    show: unknown;
    updatePaymentDetails?: unknown;
}

const nativeModules = NativeModules as unknown as { Payments?: unknown };
const globalWithTurboModuleProxy = global as unknown as { __turboModuleProxy?: unknown };

const loadNativePayments = (): LoadedNativePaymentsInterface => {
    let nativePayments = {} as LoadedNativePaymentsInterface;

    jest.isolateModules(() => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports,n/no-missing-require
        nativePayments = (require('./native-payments') as { NativePayments: LoadedNativePaymentsInterface }).NativePayments;
    });

    return nativePayments;
};

describe('NativePayments', () => {
    const showMock = jest.fn();

    beforeEach(() => {
        mockTurboModule.current = null;
        delete nativeModules.Payments;
        // eslint-disable-next-line no-underscore-dangle
        delete globalWithTurboModuleProxy.__turboModuleProxy;
    });

    afterEach(() => {
        // eslint-disable-next-line no-underscore-dangle
        delete globalWithTurboModuleProxy.__turboModuleProxy;
    });

    it('should expose the TurboModule when the turbo module proxy is installed', () => {
        expect.hasAssertions();

        // eslint-disable-next-line no-underscore-dangle
        globalWithTurboModuleProxy.__turboModuleProxy = () => null;
        mockTurboModule.current = { show: showMock };

        expect(loadNativePayments().show).toBe(showMock);
    });

    it('should expose the legacy native module when the turbo module proxy is not installed', () => {
        expect.hasAssertions();

        nativeModules.Payments = { show: showMock };

        expect(loadNativePayments().show).toBe(showMock);
    });

    it('should leave the change event methods undefined when the native module is not linked', () => {
        expect.hasAssertions();

        const nativePayments = loadNativePayments();

        expect(nativePayments.addListener).toBeUndefined();
        expect(nativePayments.removeListeners).toBeUndefined();
        expect(nativePayments.setActiveEvents).toBeUndefined();
        expect(nativePayments.updatePaymentDetails).toBeUndefined();
    });

    it('should leave retry undefined when the native module is not linked', () => {
        expect.hasAssertions();

        const nativePayments = loadNativePayments();

        expect(nativePayments.retry).toBeUndefined();
    });

    it('should throw a linking error for the other methods when the native module is not linked', () => {
        expect.hasAssertions();

        const nativePayments = loadNativePayments();

        expect(() => nativePayments.show).toThrow(`The package 'react-native-payments' doesn't seem to be linked.`);
    });
});
