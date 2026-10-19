#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collectNestedBrowserMaps } from './nested-browser-maps.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = path.join(repoRoot, 'packages');

const REQUIRED_FILES = ['package.json', 'readme.md', 'llms.txt'];

const FORBIDDEN_PATTERNS = [
    { pattern: /\.(spec|test)\.[^/]+$/u, reason: 'test file' },
    { pattern: /\.mock\.[^/]+$/u, reason: 'test mock' },
    { pattern: /(^|\/)__(tests|mocks|fixtures|snapshots)__\//u, reason: 'test directory' },
    { pattern: /(^|\/)(fixtures?|e2e|coverage)\//u, reason: 'test/coverage directory' },
    { pattern: /\.tsbuildinfo$/u, reason: 'build cache' },
    { pattern: /^(ios|android)\/build[^/]*\//u, reason: 'native build artifact' },
    { pattern: /(^|\/)\.gradle\//u, reason: 'native build artifact' },
    { pattern: /(^|\/)(Pods|DerivedData|xcuserdata)\//u, reason: 'native build artifact' },
    { pattern: /(^|\/)node_modules\//u, reason: 'node_modules' },
];

const MARKDOWN_LINK = /\[[^\]]*\]\(([^)\s]+)\)/gu;
const EXTERNAL_LINK = /^[a-z][a-z0-9+.-]*:/iu;

const requestedPackages = new Set(process.argv.slice(2));
const failures = [];

function fail(pkg, message) {
    failures.push(`${pkg}: ${message}`);
    console.error(`  FAIL ${message}`);
}

function listPublishablePackages() {
    return fs
        .readdirSync(packagesDir)
        .filter(dir => fs.existsSync(path.join(packagesDir, dir, 'package.json')))
        .filter(dir => requestedPackages.size === 0 || requestedPackages.has(dir))
        .map(dir => ({ dir, manifest: JSON.parse(fs.readFileSync(path.join(packagesDir, dir, 'package.json'), 'utf8')) }))
        .filter(({ manifest }) => manifest.private !== true);
}

function listTarballFiles(pkgDir) {
    const raw = execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts', '--loglevel=error'], {
        cwd: pkgDir,
        encoding: 'utf8',
    });
    const [{ files }] = JSON.parse(raw);

    return new Set(files.map(file => file.path));
}

function collectExportTargets(node) {
    if (typeof node === 'string') {
        return [node];
    }
    if (node === null || typeof node !== 'object') {
        return [];
    }

    return Object.values(node).flatMap(collectExportTargets);
}

function collectEntryTargets(manifest) {
    const fieldTargets = ['main', 'module', 'types', 'typings', 'react-native', 'browser']
        .map(field => manifest[field])
        .filter(target => typeof target === 'string');

    return [...new Set([...fieldTargets, ...collectExportTargets(manifest.exports)])]
        .filter(target => !target.includes('*'))
        .map(target => path.posix.normalize(target));
}

function githubSlug(heading) {
    return heading
        .replace(/\[([^\]]*)\]\([^)]*\)/gu, '$1')
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
        .replace(/ /gu, '-');
}

function collectAnchors(markdown) {
    const anchors = new Set();
    const occurrences = new Map();
    let inFence = false;

    for (const line of markdown.split('\n')) {
        if (/^\s*(```|~~~)/u.test(line)) {
            inFence = !inFence;
            continue;
        }
        const heading = inFence ? null : /^#{1,6}\s+(.+?)\s*#*\s*$/u.exec(line);
        if (heading) {
            const base = githubSlug(heading[1]);
            const seen = occurrences.get(base) ?? 0;
            anchors.add(seen === 0 ? base : `${base}-${seen}`);
            occurrences.set(base, seen + 1);
        }
    }

    return anchors;
}

function checkForbiddenFiles(pkg, tarballFiles) {
    for (const file of tarballFiles) {
        const match = FORBIDDEN_PATTERNS.find(({ pattern }) => pattern.test(file));
        if (match) {
            fail(pkg, `tarball ships ${match.reason}: ${file}`);
        }
    }
}

function checkEntryTargets(pkg, manifest, tarballFiles) {
    for (const target of collectEntryTargets(manifest)) {
        if (!tarballFiles.has(target)) {
            fail(pkg, `package.json entry target is missing from the tarball: ${target}`);
        }
    }
}

function checkNestedBrowserMarkers(pkg, pkgDir, manifest) {
    for (const [markerDir, expected] of collectNestedBrowserMaps(pkgDir, manifest.browser)) {
        const marker = JSON.parse(fs.readFileSync(path.join(pkgDir, markerDir, 'package.json'), 'utf8'));
        for (const [source, target] of Object.entries(expected)) {
            if (marker.browser?.[source] !== target) {
                fail(
                    pkg,
                    `${markerDir}/package.json does not map ${source} to ${target}; resolvers read the nearest package.json`
                );
            }
        }
    }
}

function checkLlmsStructure(pkg, manifest, llms) {
    const [firstLine] = llms.split('\n');
    if (firstLine !== `# ${manifest.name}`) {
        fail(pkg, `llms.txt must start with the H1 "# ${manifest.name}", found "${firstLine}"`);
    }
    if (!/^> \S/mu.test(llms)) {
        fail(pkg, 'llms.txt has no "> " blockquote summary');
    }
}

function checkLlmsLinks(pkg, pkgDir, llms, tarballFiles) {
    for (const [, href] of llms.matchAll(MARKDOWN_LINK)) {
        if (EXTERNAL_LINK.test(href)) {
            continue;
        }
        const [linkPath, anchor] = href.split('#');
        const target = path.posix.normalize(linkPath === '' ? 'llms.txt' : linkPath);
        if (target.startsWith('..') || !tarballFiles.has(target)) {
            fail(pkg, `llms.txt links to "${href}", which is not inside the tarball`);
            continue;
        }
        if (anchor !== undefined && target.endsWith('.md')) {
            const anchors = collectAnchors(fs.readFileSync(path.join(pkgDir, target), 'utf8'));
            if (!anchors.has(anchor)) {
                fail(pkg, `llms.txt links to "${href}", but ${target} has no heading with that anchor`);
            }
        }
    }
}

function checkPackage({ dir, manifest }) {
    const pkgDir = path.join(packagesDir, dir);
    console.log(`── ${manifest.name} ──`);
    const failureCountBefore = failures.length;
    const tarballFiles = listTarballFiles(pkgDir);

    for (const required of REQUIRED_FILES) {
        if (!tarballFiles.has(required)) {
            fail(dir, `required file is missing from the tarball: ${required}`);
        }
    }
    checkForbiddenFiles(dir, tarballFiles);
    checkEntryTargets(dir, manifest, tarballFiles);
    checkNestedBrowserMarkers(dir, pkgDir, manifest);

    if (tarballFiles.has('llms.txt')) {
        const llms = fs.readFileSync(path.join(pkgDir, 'llms.txt'), 'utf8');
        checkLlmsStructure(dir, manifest, llms);
        checkLlmsLinks(dir, pkgDir, llms, tarballFiles);
    }

    if (failures.length === failureCountBefore) {
        console.log(`  OK   ${tarballFiles.size} files, entry targets present, llms.txt links resolve`);
    }
}

const packages = listPublishablePackages();
if (packages.length === 0) {
    console.error('assert-pack-contents: no publishable packages matched');
    process.exit(1);
}
packages.forEach(checkPackage);

if (failures.length > 0) {
    console.error(`\nassert-pack-contents: ${failures.length} failure(s) across ${packages.length} package(s)`);
    process.exit(1);
}
console.log(`\nassert-pack-contents: ${packages.length} package(s) passed`);
