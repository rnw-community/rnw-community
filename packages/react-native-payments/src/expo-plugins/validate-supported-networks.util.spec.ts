import { describe, expect, it } from '@jest/globals';

import { SupportedNetworkEnum } from '../enum/supported-networks.enum';

import { validateSupportedNetworks } from './validate-supported-networks.util';

describe('validateSupportedNetworks', () => {
    it('should default to every supported network when undefined', () => {
        expect.assertions(1);

         
        expect(validateSupportedNetworks(undefined)).toStrictEqual(Object.values(SupportedNetworkEnum));
    });

    it('should return the provided networks unchanged when all are valid', () => {
        expect.assertions(1);

        expect(validateSupportedNetworks([SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard])).toStrictEqual([
            SupportedNetworkEnum.Visa,
            SupportedNetworkEnum.Mastercard,
        ]);
    });

    it('should throw when given an empty array', () => {
        expect.assertions(1);

        expect(() => validateSupportedNetworks([])).toThrow(
            'Please provide at least one "supportedNetworks" plugin option value'
        );
    });

    it('should throw naming every invalid network', () => {
        expect.assertions(1);

        expect(() => validateSupportedNetworks(['visa', 'unknown-network', 'another-unknown'] as never)).toThrow(
            'Invalid "supportedNetworks" plugin option value(s): "unknown-network", "another-unknown"'
        );
    });
});
