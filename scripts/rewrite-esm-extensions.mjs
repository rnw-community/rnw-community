#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import {
    collectEsmOutputFiles,
    createEsmSpecifierRegex,
    hasKnownExtension,
    isRelativeSpecifier,
    resolveDistExtension,
} from './esm-relative-specifier.mjs';

const esmDistDir = process.argv[2];
if (esmDistDir === undefined) {
    console.error('usage: node rewrite-esm-extensions.mjs <path-to-dist/esm>');
    process.exit(1);
}

const rootDir = path.resolve(esmDistDir);
if (!fs.existsSync(rootDir)) {
    console.error(`rewrite-esm-extensions: ${rootDir} does not exist`);
    process.exit(1);
}

const unresolved = [];
let rewrittenSpecifiers = 0;
let rewrittenFiles = 0;

for (const file of collectEsmOutputFiles(rootDir)) {
    const fileDir = path.dirname(file);
    const content = fs.readFileSync(file, 'utf8');
    let changedInFile = 0;

    const out = content.replace(createEsmSpecifierRegex(), (full, quote, specifier) => {
        if (!isRelativeSpecifier(specifier) || hasKnownExtension(specifier)) {
            return full;
        }

        const suffix = resolveDistExtension(fileDir, specifier);
        if (suffix === undefined) {
            unresolved.push(`${path.relative(rootDir, file)}: cannot resolve relative specifier '${specifier}'`);

            return full;
        }
        changedInFile++;

        return full.replace(`${quote}${specifier}${quote}`, `${quote}${specifier}${suffix}${quote}`);
    });

    if (changedInFile > 0) {
        fs.writeFileSync(file, out);
        rewrittenSpecifiers += changedInFile;
        rewrittenFiles++;
    }
}

if (unresolved.length > 0) {
    console.error(`rewrite-esm-extensions: ${unresolved.length} unresolved relative specifier(s) in ${rootDir}:`);
    unresolved.forEach(entry => console.error(`  - ${entry}`));
    process.exit(1);
}

console.log(`rewrite-esm-extensions: rewrote ${rewrittenSpecifiers} specifier(s) across ${rewrittenFiles} file(s) in ${rootDir}`);
