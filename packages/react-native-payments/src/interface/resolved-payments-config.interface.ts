import type { EnvironmentEnum } from '../enum/environment.enum';
import type { SupportedNetworkEnum } from '../enum/supported-networks.enum';
import type { ReadonlyIsNotEmptyArray } from '@rnw-community/shared';

/**
 * A validated `PaymentsConfig` with every default applied, as returned by `resolvePaymentsConfig`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payments-config.md
 */
export interface ResolvedPaymentsConfig {
    /** Every non-empty merchant identifier, de-duplicated, in declaration order. */
    merchantIdentifiers: ReadonlyIsNotEmptyArray<string>;
    /** The validated card networks. */
    supportedNetworks: SupportedNetworkEnum[];
    /** The validated Google Pay environment. */
    googlePayEnvironment: EnvironmentEnum;
}
