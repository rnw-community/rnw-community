import { withPlugins } from '@expo/config-plugins';

import { withApplePay } from './with-apple-pay';
import { withGooglePay } from './with-google-pay';

import type { ReactNativePaymentsPluginProps } from './plugin.props';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withPayments: ConfigPlugin<ReactNativePaymentsPluginProps> = (config, props) =>
    withPlugins(config, [
        [withApplePay, props],
        [withGooglePay, props],
    ]);
