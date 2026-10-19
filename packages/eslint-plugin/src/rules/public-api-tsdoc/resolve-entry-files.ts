import { existsSync } from 'node:fs';
import { join } from 'node:path';

import { isDefined } from '@rnw-community/shared';

import type { PackageManifestInterface } from './package-manifest.interface';

const SOURCE_EXTENSIONS = ['.ts', '.tsx'];
const DECLARATION_TARGET = /^(?:\.\/)?dist\/.+\.d\.ts$/u;
const DIST_PREFIX = /^(?:\.\/)?dist\//u;
const DECLARATION_SUFFIX = /\.d\.ts$/u;

const collectDeclarationTargets = (field: unknown): string[] => {
    if (typeof field === 'string') {
        return DECLARATION_TARGET.test(field) ? [field] : [];
    }
    if (typeof field === 'object' && field !== null) {
        return Object.values(field).flatMap(collectDeclarationTargets);
    }

    return [];
};

const findSourceFile = (packageDir: string, modulePath: string): string | undefined =>
    SOURCE_EXTENSIONS.map(extension => join(packageDir, 'src', `${modulePath}${extension}`)).find(candidate =>
        existsSync(candidate)
    );

const mapDeclarationTargetToSource = (packageDir: string, declarationTarget: string): string | undefined => {
    const segments = declarationTarget.replace(DIST_PREFIX, '').replace(DECLARATION_SUFFIX, '').split('/');

    return segments
        .map((_segment, droppedCount) => findSourceFile(packageDir, segments.slice(droppedCount).join('/')))
        .find(isDefined);
};

export const resolveEntryFiles = (packageDir: string, manifest: PackageManifestInterface): string[] => {
    const declarationTargets = [
        ...collectDeclarationTargets(manifest.types),
        ...collectDeclarationTargets(manifest.exports),
    ];
    const mappedEntries = declarationTargets.map(target => mapDeclarationTargetToSource(packageDir, target));

    return [...new Set([findSourceFile(packageDir, 'index'), ...mappedEntries])].filter(isDefined);
};
