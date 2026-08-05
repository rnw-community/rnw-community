import { withPlugins } from '@expo/config-plugins';

import { withApplePay } from './with-apple-pay.js';
import { withGooglePay } from './with-google-pay.js';

import type { ReactNativePaymentsPluginProps } from './plugin.props.js';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withPayments: ConfigPlugin<ReactNativePaymentsPluginProps> = (config, props) =>
    withPlugins(config, [
        [withApplePay, props],
        [withGooglePay, props],
    ]);
