import { withPlugins } from '@expo/config-plugins';

import { resolvePaymentsConfig } from '../util/resolve-payments-config/resolve-payments-config.util';

import { loadPaymentsConfig } from './load-payments-config/load-payments-config.util';
import { withApplePay } from './with-apple-pay';
import { withGooglePay } from './with-google-pay';

import type { PaymentsConfig } from '../interface/payments-config.interface';
import type { ConfigPlugin } from '@expo/config-plugins';

export const withPayments: ConfigPlugin<PaymentsConfig | undefined> = (config, props) => {
    const {
        _internal: { projectRoot = process.cwd() } = {},
    }: { _internal?: Record<string, unknown> & { projectRoot?: string } } = config;
    const paymentsConfig = resolvePaymentsConfig(props ?? loadPaymentsConfig(projectRoot));

    return withPlugins(config, [
        [withApplePay, paymentsConfig],
        [withGooglePay, paymentsConfig],
    ]);
};
