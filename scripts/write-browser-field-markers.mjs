#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { collectNestedBrowserMaps } from './nested-browser-maps.mjs';

const packageDir = process.argv[2];
if (packageDir === undefined) {
    console.error('usage: node write-browser-field-markers.mjs <package-dir>');
    process.exit(1);
}

const packageRoot = path.resolve(packageDir);
const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));

for (const [markerDir, browser] of collectNestedBrowserMaps(packageRoot, manifest.browser)) {
    const markerPath = path.join(packageRoot, markerDir, 'package.json');
    const marker = JSON.parse(fs.readFileSync(markerPath, 'utf8'));
    fs.writeFileSync(markerPath, `${JSON.stringify({ ...marker, browser })}\n`);
}
