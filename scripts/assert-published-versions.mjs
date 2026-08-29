import fs from 'node:fs';
import path from 'node:path';

const packagesDir = path.resolve(import.meta.dirname, '..', 'packages');

const readManifest = pkg => {
    const manifestPath = path.join(packagesDir, pkg, 'package.json');

    return fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
};

const fetchLatest = async name => {
    const response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}`);

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`registry lookup for ${name} failed with ${response.status}`);
    }

    return (await response.json())['dist-tags']?.latest ?? null;
};

const manifests = fs
    .readdirSync(packagesDir)
    .map(readManifest)
    .filter(manifest => manifest !== null && manifest.private !== true);

const drifted = [];

for (const manifest of manifests) {
    const latest = await fetchLatest(manifest.name);

    if (latest !== manifest.version) {
        drifted.push(`${manifest.name}: repo ${manifest.version}, registry ${latest ?? '(unpublished)'}`);
    }
}

if (drifted.length > 0) {
    console.error('Published versions do not match the repository:');
    for (const line of drifted) {
        console.error(`  ${line}`);
    }
    console.error('\nA release versioned and tagged these packages but did not publish them.');
    console.error('Recover with: Actions -> "Release and publish to NPM" -> Run workflow -> mode=from-package');
    process.exit(1);
}

console.log(`All ${manifests.length} public packages match the registry.`);
