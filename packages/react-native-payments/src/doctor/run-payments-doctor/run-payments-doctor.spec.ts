import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { runPaymentsDoctor } from './run-payments-doctor';

jest.mock('@expo/config-plugins', () => {
    const actual = jest.requireActual<typeof import('@expo/config-plugins')>('@expo/config-plugins');
    const fs = jest.requireActual<typeof import('node:fs')>('node:fs');
    const path = jest.requireActual<typeof import('node:path')>('node:path');
    const readEntitlements = (filePath: string): unknown =>
        fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : {};

    return {
        ...actual,
        IOSConfig: {
            ...actual.IOSConfig,
            Entitlements: { ...actual.IOSConfig.Entitlements, getEntitlementsPath: jest.fn() },
        },
        BaseMods: {
            ...actual.BaseMods,
            getIosModFileProviders: () => ({
                entitlements: {
                    getFilePath: ({ modRequest }: { modRequest: { projectRoot: string } }) =>
                        path.join(modRequest.projectRoot, 'ios', 'App.entitlements'),
                    read: readEntitlements,
                    write: (filePath: string, { modResults }: { modResults: unknown }) => {
                        fs.writeFileSync(filePath, JSON.stringify(modResults));
                    },
                },
            }),
        },
    };
});

const manifest = `<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:name=".MainApplication">
        <meta-data android:name="com.google.android.gms.wallet.api.enabled" android:value="true"/>
    </application>
</manifest>
`;

const manifestPath = join('android', 'app', 'src', 'main', 'AndroidManifest.xml');

const createProjectRoot = (withIos: boolean): string => {
    const projectRoot = mkdtempSync(join(tmpdir(), 'payments-doctor-'));

    mkdirSync(dirname(join(projectRoot, manifestPath)), { recursive: true });
    writeFileSync(join(projectRoot, manifestPath), manifest);
    writeFileSync(
        join(projectRoot, 'payments.config.json'),
        JSON.stringify({
            merchantIdentifier: 'merchant.com.example',
            supportedNetworks: ['visa'],
            googlePayEnvironment: 'TEST',
        })
    );

    if (withIos) {
        mkdirSync(join(projectRoot, 'ios'));
    }

    return projectRoot;
};

const getEntitlementsPath = jest.mocked(
    jest.requireMock<typeof import('@expo/config-plugins')>('@expo/config-plugins').IOSConfig.Entitlements
        .getEntitlementsPath
);

describe('runPaymentsDoctor', () => {
    beforeEach(() => {
        getEntitlementsPath.mockReturnValue(null);
    });

    it('should report every native file that does not match the payments config without changing it', async () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot(true);

        await expect(runPaymentsDoctor(projectRoot, false)).resolves.toStrictEqual([
            [
                'ios/<CODE_SIGN_ENTITLEMENTS not set>',
                '  - {}',
                '  + {',
                '  + "com.apple.developer.in-app-payments": [',
                '  + "merchant.com.example"',
                '  + ]',
                '  + }',
            ].join('\n'),
            [
                manifestPath,
                '  + <meta-data android:name="com.google.android.gms.wallet.api.environment" android:value="TEST"/>',
                '  + <meta-data android:name="com.rnw-community.react-native-payments.supported-networks" android:value="visa"/>',
            ].join('\n'),
        ]);
        expect(readFileSync(join(projectRoot, manifestPath), 'utf8')).toBe(manifest);
        expect(existsSync(join(projectRoot, 'ios', 'App.entitlements'))).toBe(false);
    });

    it('should write the native files with the Expo plugin mutations and then report no drift', async () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot(true);

        await expect(runPaymentsDoctor(projectRoot, true)).resolves.toHaveLength(2);

        getEntitlementsPath.mockReturnValue(join(projectRoot, 'ios', 'App.entitlements'));

        await expect(runPaymentsDoctor(projectRoot, false)).resolves.toStrictEqual([]);
        expect(readFileSync(join(projectRoot, 'ios', 'App.entitlements'), 'utf8')).toBe(
            '{"com.apple.developer.in-app-payments":["merchant.com.example"]}'
        );
    });

    it('should only check the platforms the project contains', async () => {
        expect.hasAssertions();

        const projectRoot = createProjectRoot(false);

        await expect(runPaymentsDoctor(projectRoot, false)).resolves.toStrictEqual([expect.stringContaining(manifestPath)]);
    });
});
