#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EXTERNAL_LINK, MARKDOWN_LINK, collectAnchors } from './markdown-links.mjs';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHECKED_DOCS = ['llms.txt', 'README.md', 'AGENTS.md', 'CONTRIBUTING.md', 'RELEASE.md', 'SECURITY.md'];

const failures = [];
const anchorCache = new Map();

function anchorsOf(absolutePath) {
    if (!anchorCache.has(absolutePath)) {
        anchorCache.set(absolutePath, collectAnchors(fs.readFileSync(absolutePath, 'utf8')));
    }

    return anchorCache.get(absolutePath);
}

function checkLink(doc, href) {
    const [linkPath, anchor] = href.split('#');
    const target = path.resolve(repoRoot, path.dirname(doc), linkPath === '' ? path.basename(doc) : linkPath);
    const relativeTarget = path.relative(repoRoot, target);

    if (relativeTarget.startsWith('..') || path.isAbsolute(relativeTarget)) {
        failures.push(`${doc}: "${href}" points outside the repository`);
    } else if (!fs.existsSync(target)) {
        failures.push(`${doc}: "${href}" does not resolve to a file or directory`);
    } else if (anchor !== undefined && /\.md$/iu.test(target) && !anchorsOf(target).has(anchor)) {
        failures.push(`${doc}: "${href}" has no matching heading in ${relativeTarget}`);
    }
}

function checkLlmsStructure(llms) {
    const [firstLine] = llms.split('\n');
    if (!/^# \S/u.test(firstLine)) {
        failures.push(`llms.txt: must start with an H1 title, found "${firstLine}"`);
    }
    if (!/^> \S/mu.test(llms)) {
        failures.push('llms.txt: has no "> " blockquote summary');
    }
}

let linkCount = 0;
for (const doc of CHECKED_DOCS) {
    const content = fs.readFileSync(path.join(repoRoot, doc), 'utf8');
    if (doc === 'llms.txt') {
        checkLlmsStructure(content);
    }
    for (const [, href] of content.matchAll(MARKDOWN_LINK)) {
        if (!EXTERNAL_LINK.test(href)) {
            linkCount += 1;
            checkLink(doc, decodeURIComponent(href));
        }
    }
}

if (failures.length > 0) {
    failures.forEach(failure => console.error(`FAIL ${failure}`));
    console.error(`\nassert-root-docs-links: ${failures.length} broken link(s)`);
    process.exit(1);
}
console.log(`assert-root-docs-links: ${linkCount} relative link(s) in ${CHECKED_DOCS.join(', ')} resolve`);
