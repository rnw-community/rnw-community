import fs from 'node:fs';
import path from 'node:path';

function findNestedMarkerDir(packageRoot, file) {
    for (let dir = path.posix.dirname(file); dir !== '.' && dir !== ''; dir = path.posix.dirname(dir)) {
        if (fs.existsSync(path.join(packageRoot, dir, 'package.json'))) {
            return dir;
        }
    }

    return null;
}

export function collectNestedBrowserMaps(packageRoot, browser) {
    const markerMaps = new Map();
    const unmatchedSources = [];
    if (browser === null || typeof browser !== 'object') {
        return { markerMaps, unmatchedSources };
    }
    for (const [source, target] of Object.entries(browser)) {
        if (typeof target !== 'string') {
            continue;
        }
        const normalizedSource = path.posix.normalize(source);
        const markerDir = findNestedMarkerDir(packageRoot, normalizedSource);
        if (markerDir === null) {
            if (normalizedSource.startsWith('dist/')) {
                unmatchedSources.push(source);
            }
            continue;
        }
        const rebase = file => `./${path.posix.relative(markerDir, path.posix.normalize(file))}`;
        markerMaps.set(markerDir, { ...markerMaps.get(markerDir), [rebase(source)]: rebase(target) });
    }

    return { markerMaps, unmatchedSources };
}
