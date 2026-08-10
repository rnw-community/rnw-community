#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import { collectEsmOutputFiles, createEsmSpecifierRegex, hasKnownExtension, isRelativeSpecifier } from './esm-relative-specifier.mjs';

const esmDistDir = process.argv[2];
if (esmDistDir === undefined) {
    console.error('usage: node assert-esm-extensions.mjs <path-to-dist/esm>');
    process.exit(1);
}

const rootDir = path.resolve(esmDistDir);
if (!fs.existsSync(rootDir)) {
    console.error(`assert-esm-extensions: ${rootDir} does not exist`);
    process.exit(1);
}

const violations = [];

for (const file of collectEsmOutputFiles(rootDir)) {
    const content = fs.readFileSync(file, 'utf8');
    const specifierRegex = createEsmSpecifierRegex();
    let match;
    while ((match = specifierRegex.exec(content))) {
        const specifier = match[2];
        if (isRelativeSpecifier(specifier) && !hasKnownExtension(specifier)) {
            violations.push(`${path.relative(rootDir, file)}: extensionless relative specifier '${specifier}'`);
        }
    }
}

if (violations.length > 0) {
    console.error(`assert-esm-extensions: ${violations.length} extensionless relative specifier(s) found in ${rootDir}:`);
    violations.forEach(entry => console.error(`  - ${entry}`));
    console.error(
        "Every relative import/export/dynamic-import specifier in dist/esm must carry an explicit '.js' (or '/index.js') extension for Node's ESM resolver — run the rewrite step (scripts/rewrite-esm-extensions.mjs) before this assertion."
    );
    process.exit(1);
}

console.log(`assert-esm-extensions: 0 extensionless relative specifiers in ${rootDir}`);
