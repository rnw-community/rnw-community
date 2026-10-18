#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = path.join(repoRoot, 'packages');

const SEE_TAG = /@see\s+(?:\[[^\]]*\]\()?(\S+?)\)?(?:\s|$)/gu;
const REPO_DOC_LINK = /^https:\/\/github\.com\/rnw-community\/rnw-community\/(?:blob|tree)\/master\/([^#?]+)(?:#(.+))?$/u;
const SOURCE_FILE = /\.tsx?$/u;
const SPEC_FILE = /\.(spec|test)\.tsx?$/u;

const requestedPackages = new Set(process.argv.slice(2));
const failures = [];
const anchorsByFile = new Map();

function listPublishablePackages() {
    return fs
        .readdirSync(packagesDir)
        .filter(dir => fs.existsSync(path.join(packagesDir, dir, 'package.json')))
        .filter(dir => requestedPackages.size === 0 || requestedPackages.has(dir))
        .filter(dir => JSON.parse(fs.readFileSync(path.join(packagesDir, dir, 'package.json'), 'utf8')).private !== true);
}

function listSourceFiles(dir) {
    if (!fs.existsSync(dir)) {
        return [];
    }

    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const entryPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            return listSourceFiles(entryPath);
        }

        return SOURCE_FILE.test(entry.name) && !SPEC_FILE.test(entry.name) ? [entryPath] : [];
    });
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

function resolveDocFile(repoPath) {
    const target = path.join(repoRoot, decodeURIComponent(repoPath));
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
        return ['readme.md', 'README.md'].map(name => path.join(target, name)).find(file => fs.existsSync(file)) ?? null;
    }

    return fs.existsSync(target) ? target : null;
}

function getAnchors(file) {
    if (!anchorsByFile.has(file)) {
        anchorsByFile.set(file, collectAnchors(fs.readFileSync(file, 'utf8')));
    }

    return anchorsByFile.get(file);
}

function checkLink(location, href) {
    const match = REPO_DOC_LINK.exec(href);
    if (match === null) {
        return;
    }
    const [, repoPath, anchor] = match;
    const docFile = resolveDocFile(repoPath.replace(/\/$/u, ''));
    if (docFile === null) {
        failures.push(`${location}: @see ${href} points at a missing file`);
    } else if (anchor !== undefined && docFile.endsWith('.md') && !getAnchors(docFile).has(anchor)) {
        failures.push(`${location}: @see ${href} has no matching heading in ${path.relative(repoRoot, docFile)}`);
    }
}

function checkSourceFile(file) {
    fs.readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
            for (const [, href] of line.matchAll(SEE_TAG)) {
                checkLink(`${path.relative(repoRoot, file)}:${index + 1}`, href);
            }
        });
}

const packages = listPublishablePackages();
if (packages.length === 0) {
    console.error('assert-tsdoc-see-anchors: no publishable packages matched');
    process.exit(1);
}
packages.flatMap(dir => listSourceFiles(path.join(packagesDir, dir, 'src'))).forEach(checkSourceFile);

if (failures.length > 0) {
    failures.forEach(failure => console.error(`  FAIL ${failure}`));
    console.error(`\nassert-tsdoc-see-anchors: ${failures.length} dead @see link(s)`);
    process.exit(1);
}
console.log(`assert-tsdoc-see-anchors: every repository @see link in ${packages.length} package(s) resolves`);
