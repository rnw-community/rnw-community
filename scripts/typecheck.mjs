#!/usr/bin/env node
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let packageRoot = path.dirname(require.resolve('tsrs/package.json'));
let binary = 'tsrs';
const { default: getExePath } = await import(pathToFileURL(path.join(packageRoot, 'lib/getExePath.js')));
try {
    getExePath();
} catch (error) {
    if (process.env.TSRS_BINARY) {
        throw error;
    }
    console.error(`tsrs binary unavailable; falling back to native TypeScript: ${error.message}`);
    packageRoot = path.dirname(require.resolve('@typescript/native/package.json'));
    binary = 'tsc';
}
await import(pathToFileURL(path.join(packageRoot, 'bin', binary)));
