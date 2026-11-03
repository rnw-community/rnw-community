/**
 * The device each platform leases from the farm, and its screen in the units agent-device swipes in
 * (iOS points, Android physical pixels), so Maestro's percentage swipes land where they did.
 * `Galaxy Nexus` (720x1280 at 320 dpi) is the geometry the Android flows are calibrated against;
 * runtime 34 `aosp_atd` is the farm's cheap image for suites that read only the accessibility tree.
 */
export const DEVICES = {
    ios: { model: 'iPhone 17 Pro', viewport: { width: 402, height: 874 } },
    android: { model: 'Galaxy Nexus', osVersion: '34', imageTag: 'aosp_atd', viewport: { width: 720, height: 1280 } },
} as const;

export type Platform = keyof typeof DEVICES;
