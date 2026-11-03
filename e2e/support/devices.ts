/**
 * The device each platform leases from the farm, and its screen in the units agent-device swipes in
 * (iOS points, Android physical pixels), so Maestro's percentage swipes land where they did.
 * `Galaxy Nexus` (720x1280 at 320 dpi) is the geometry the Android flows are calibrated against;
 * runtime 34 is the farm's `aosp_atd` image.
 */
export const DEVICES = {
    ios: { model: 'iPhone 17 Pro', viewport: { width: 402, height: 874 } },
    android: { model: 'Galaxy Nexus', osVersion: '34', viewport: { width: 720, height: 1280 } },
} as const;

export type Platform = keyof typeof DEVICES;
