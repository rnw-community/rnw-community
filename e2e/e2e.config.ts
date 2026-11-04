import { randomBytes } from 'node:crypto';

import { mobile } from '@e2e-dev/mobile';

import { simlockDevices, type SimlockOptions } from '@mobile-ci/e2e-simlock';

import { DEVICES, type Platform } from './support/devices.ts';

import type { E2EConfig } from 'e2e';

const env = (name: string): string => {
    const value = process.env[name];
    if (value === undefined || value === '') {
        throw new Error(`${name} is required`);
    }
    return value;
};

// mobile-ci runs this project once per target (`payments-bare`, `screen-chrome-harness`, …): both app builds of an
// example package share its tests, so the target name minus its `-bare`/`-expo` suffix picks the directory.
const suite = process.env.E2E_TARGET?.replace(/-(bare|expo)$/, '');

// One agent-device session per run: simlock keys sessions by token + name, so two runs sharing a token would
// otherwise drive each other's device. Set before the workers start, so they inherit it.
process.env.E2E_SESSION ??= `e2e-${randomBytes(4).toString('hex')}`;

type Lease = Pick<SimlockOptions, 'osVersion' | 'imageTag' | 'deviceMode' | 'iosScreenshotBackend' | 'animations'> & { model?: string };

const target = (name: string, platform: Platform, { model, ...lease }: Lease = {}) => ({
    name,
    engine: mobile({
        platform,
        session: process.env.E2E_SESSION,
        // Plain recordings: drawing the touch indicator re-encodes the clip, which the temporal harness measures.
        videoTouches: false,
        device: simlockDevices({
            url: env('SIMLOCK_URL'),
            token: env('SIMLOCK_TOKEN'),
            platform,
            device: model ?? DEVICES[platform].model,
            tenant: 'rnw-community-e2e',
            ...lease,
        }),
    }),
    // E2E_APP_ID / E2E_APP_PATH: the target's app id and its repacked or built binary, set by mobile-ci's e2e job.
    app: { bundleId: env('E2E_APP_ID'), appPath: env('E2E_APP_PATH') },
});

export default {
    projectId: 'rnw-community',
    tests: suite === undefined || suite === '' ? 'tests/**/*.e2e.ts' : `tests/${suite}/**/*.e2e.ts`,
    targets: [
        // Stills from the XCTest runner have no Dynamic Island, like the edge-fade baselines. The Apple
        // Pay sheet needs PassKit, which a slim simulator switches off.
        target('ios', 'ios', {
            iosScreenshotBackend: 'runner',
            ...(suite === 'payments' ? { deviceMode: 'full' } : {}),
        }),
        // Android leases keep the package default, animations off: a window still sliding in shifts the viewport.
        target('android', 'android', { osVersion: DEVICES.android.osVersion, imageTag: DEVICES.android.imageTag }),
        // Pixel lanes (the edge-fade harness, the docs media) and the Google Pay sheet: the farm's API 35 `google_apis`
        // image has Google Play services, and the ATD image's screenshots are blank and its recordings never finalize.
        target('android-gms', 'android', { osVersion: '35', imageTag: 'google_apis' }),
        // The screen-chrome readme clips: a phone shaped like their committed GIFs, with real keyboard and window animations.
        target('android-pixel', 'android', { model: 'Pixel 6', osVersion: '35', imageTag: 'google_apis', animations: 'on' }),
    ],
    workers: Number(process.env.E2E_WORKERS ?? 1),
    timeout: 10 * 60_000,
    actionTimeout: 30_000,
    assertionTimeout: 10_000,
    launchTimeout: 120_000,
    cleanupTimeout: 60_000,
    retries: Number(process.env.E2E_RETRIES ?? 0),
    reporters: ['list', 'junit', 'markdown'],
    trace: 'retain-on-failure',
    video: 'off',
    cache: 'off',
} satisfies E2EConfig;
