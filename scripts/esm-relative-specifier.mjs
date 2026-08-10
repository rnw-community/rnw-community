import fs from 'node:fs';
import path from 'node:path';

const KNOWN_EXTENSION_RE = /\.(js|mjs|cjs|json)$/;

export function createEsmSpecifierRegex() {
    return /(?:\bfrom\s*|\bimport\s*\(\s*|^\s*import\s+)(['"])(\.[^'"]*)\1/gm;
}

export function isRelativeSpecifier(specifier) {
    return specifier.startsWith('./') || specifier.startsWith('../');
}

export function hasKnownExtension(specifier) {
    return KNOWN_EXTENSION_RE.test(specifier);
}

export function resolveDistExtension(fileDir, specifier) {
    const target = path.resolve(fileDir, specifier);
    if (fs.existsSync(`${target}.js`) || fs.existsSync(`${target}.d.ts`)) {
        return '.js';
    }
    if (fs.existsSync(path.join(target, 'index.js')) || fs.existsSync(path.join(target, 'index.d.ts'))) {
        return '/index.js';
    }

    return undefined;
}

export function collectEsmOutputFiles(rootDir) {
    const files = [];
    const stack = [rootDir];
    while (stack.length > 0) {
        const dir = stack.pop();
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                stack.push(full);
            } else if (full.endsWith('.js') || full.endsWith('.d.ts')) {
                files.push(full);
            }
        }
    }

    return files;
}
