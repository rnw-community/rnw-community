import fs from 'node:fs';
import path from 'node:path';

const packagesDir = path.resolve(import.meta.dirname, '..', 'packages');

const readManifest = pkg => {
    const manifestPath = path.join(packagesDir, pkg, 'package.json');

    return fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : null;
};

const REGISTRY_TIMEOUT_MS = 15000;
// npm serves dist-tags through a CDN, so a just-published version is not visible immediately: the
// assertion that runs seconds after a successful publish would otherwise read the previous version
// and fail a release that actually worked. `?write=true` asks the registry for an authoritative,
// uncached read (the same escape hatch the npm CLI uses for dist-tag operations), and the retry
// window covers the release that measured propagation exceeding 80 seconds (run 33272999755).
// Real drift persists, so it survives every retry.
const PROPAGATION_ATTEMPTS = 30;
const PROPAGATION_DELAY_MS = 10000;

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchLatest = async name => {
    let response;

    try {
        response = await fetch(`https://registry.npmjs.org/${encodeURIComponent(name)}?write=true`, {
            signal: AbortSignal.timeout(REGISTRY_TIMEOUT_MS),
        });
    } catch (error) {
        throw new Error(`registry lookup for ${name} failed: ${error.message}`);
    }

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

const findDrift = async candidates => {
    const drift = [];

    for (const manifest of candidates) {
        const latest = await fetchLatest(manifest.name);

        if (latest !== manifest.version) {
            drift.push({ manifest, latest });
        }
    }

    return drift;
};

let pending = await findDrift(manifests);

for (let attempt = 1; attempt < PROPAGATION_ATTEMPTS && pending.length > 0; attempt += 1) {
    console.log(
        `${pending.length} package(s) not visible yet, re-checking in ${PROPAGATION_DELAY_MS / 1000}s ` +
            `(attempt ${attempt + 1}/${PROPAGATION_ATTEMPTS})`
    );
    await wait(PROPAGATION_DELAY_MS);
    pending = await findDrift(pending.map(entry => entry.manifest));
}

const drifted = pending.map(
    ({ manifest, latest }) => `${manifest.name}: repo ${manifest.version}, registry ${latest ?? '(unpublished)'}`
);

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
