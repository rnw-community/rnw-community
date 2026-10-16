import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { PackageManifestInterface } from './package-manifest.interface';

const packageCache = new Map<string, { readonly dir: string; readonly manifest: PackageManifestInterface } | undefined>();

const readManifest = (dir: string): PackageManifestInterface =>
    JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as PackageManifestInterface;

export const findPackage = (
    fileName: string
): { readonly dir: string; readonly manifest: PackageManifestInterface } | undefined => {
    const dir = dirname(fileName);

    if (!packageCache.has(dir)) {
        const parentDir = dirname(dir);

        if (existsSync(join(dir, 'package.json'))) {
            packageCache.set(dir, { dir, manifest: readManifest(dir) });
        } else {
            packageCache.set(dir, parentDir === dir ? void 0 : findPackage(dir));
        }
    }

    return packageCache.get(dir);
};
