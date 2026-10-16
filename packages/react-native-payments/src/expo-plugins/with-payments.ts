import { withPlugins } from '@expo/config-plugins';

import { withApplePay } from './with-apple-pay';
import { withGooglePay } from './with-google-pay';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from '@expo/config-plugins';

/**
 * The Expo config plugin that applies both the Apple Pay entitlement and the Google Pay manifest setup.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/platforms/expo.md
 */
export const withPayments: ConfigPlugin<ReactNativePaymentsPluginProps> = (config, props) =>
    withPlugins(config, [
        [withApplePay, props],
        [withGooglePay, props],
    ]);
