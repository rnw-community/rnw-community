import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { AndroidConfig, BaseMods, IOSConfig, XML, evalModsAsync } from '@expo/config-plugins';

import { loadPaymentsConfig } from '../../expo-plugins/load-payments-config/load-payments-config.util';
import { withPayments } from '../../expo-plugins/with-payments';
import { withDoctorProvider } from '../with-doctor-provider';

import type { ModPlatform } from '@expo/config-plugins';

const getConfiguredEntitlementsPath = (projectRoot: string): string =>
    IOSConfig.Entitlements.getEntitlementsPath(projectRoot) ?? join(projectRoot, 'ios', '<CODE_SIGN_ENTITLEMENTS not set>');

export const runPaymentsDoctor = async (projectRoot: string, fix: boolean): Promise<string[]> => {
    const drifts: string[] = [];
    const entitlementsProvider = BaseMods.getIosModFileProviders().entitlements;
    const platforms = (['ios', 'android'] satisfies ModPlatform[]).filter(platform =>
        existsSync(join(projectRoot, platform))
    );

    const paymentsConfig = withPayments(
        { name: 'rnw-payments', slug: 'rnw-payments', _internal: { projectRoot } },
        loadPaymentsConfig(projectRoot)
    );
    const iosConfig = withDoctorProvider(paymentsConfig, {
        platform: 'ios',
        modName: 'entitlements',
        provider: fix
            ? entitlementsProvider
            : {
                  ...entitlementsProvider,
                  getFilePath: ({ modRequest }) => getConfiguredEntitlementsPath(modRequest.projectRoot),
              },
        serialize: entitlements => JSON.stringify(entitlements, null, 2),
        fix,
        drifts,
    });
    const androidConfig = withDoctorProvider(iosConfig, {
        platform: 'android',
        modName: 'manifest',
        provider: BaseMods.getAndroidModFileProviders().manifest,
        serialize: (manifest: AndroidConfig.Manifest.AndroidManifest) => XML.format(manifest),
        fix,
        drifts,
    });

    await evalModsAsync(androidConfig, { projectRoot, platforms, introspect: false });

    return drifts;
};
