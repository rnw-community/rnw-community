#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scratchDir = path.join(repoRoot, '.smoke-esm');
const tarballsDir = path.join(scratchDir, 'tarballs');
const projectDir = path.join(scratchDir, 'project');
const scopeDir = path.join(projectDir, 'node_modules', '@rnw-community');

const EXECUTABLE_PACKAGES = [
    { pkg: 'decorators-core', exportName: 'createInterceptor' },
    { pkg: 'fast-style', exportName: 'getFont' },
    { pkg: 'histogram-metric-decorator', exportName: 'createHistogramMetricDecorator' },
    { pkg: 'lock-decorator', exportName: 'LockBusyError' },
    { pkg: 'log-decorator', exportName: 'consoleTransport' },
    { pkg: 'nestjs-enterprise', exportName: 'Log' },
    { pkg: 'nestjs-rxjs-lock', exportName: 'NestJSRxJSLockModule' },
    { pkg: 'nestjs-rxjs-logger', exportName: 'NestJSRxJSLoggerModule' },
    { pkg: 'nestjs-rxjs-metrics', exportName: 'NestJSRxJSMetricsModule' },
    { pkg: 'nestjs-rxjs-redis', exportName: 'NestJSRxJSRedisService' },
    { pkg: 'nestjs-typed-config', exportName: 'NestJSTypedConfigModule' },
    { pkg: 'nestjs-webpack-swc', exportName: 'importTypeormWebpackMigrations' },
    { pkg: 'object-field-tree', exportName: 'combine' },
    { pkg: 'redux-loadable', exportName: 'initialLoadingState' },
    { pkg: 'rxjs-errors', exportName: 'RxJSFilterError' },
    { pkg: 'shared', exportName: 'isDefined' },
    { pkg: 'wdio', exportName: 'addWdioCommands' },
];

const RESOLUTION_ONLY_PACKAGES = [
    { pkg: 'platform', unloadableBecause: "imports the value 'Platform' from 'react-native', untranspiled Flow/JSX" },
    {
        pkg: 'react-native-payments',
        unloadableBecause: "imports value bindings ('Platform', 'NativeModules', 'TurboModuleRegistry', 'NativeEventEmitter') from 'react-native', untranspiled Flow/JSX",
    },
    {
        pkg: 'eslint-plugin',
        unloadableBecause:
            "requires '../package.json', a file its own build script deletes post-compile (pre-existing, documented in AGENTS.md, unrelated to #531)",
    },
];

const eslintPluginPackageJsonSpecifier = '../package.json';

const ALL_PACKAGE_NAMES = [...EXECUTABLE_PACKAGES.map(entry => entry.pkg), ...RESOLUTION_ONLY_PACKAGES.map(entry => entry.pkg)];

const failures = [];

function log(message) {
    console.log(message);
}

function fail(pkg, message) {
    failures.push(`${pkg}: ${message}`);
    console.error(`  FAIL ${pkg}: ${message}`);
}

function packAllInto(destinationScopeDir) {
    fs.rmSync(scratchDir, { recursive: true, force: true });
    fs.mkdirSync(tarballsDir, { recursive: true });
    fs.mkdirSync(destinationScopeDir, { recursive: true });
    fs.writeFileSync(
        path.join(projectDir, 'package.json'),
        JSON.stringify({ name: 'smoke-esm-scratch', private: true, version: '1.0.0' }, null, 4)
    );

    for (const pkg of ALL_PACKAGE_NAMES) {
        const pkgDir = path.join(repoRoot, 'packages', pkg);
        const raw = execFileSync('npm', ['pack', '--json', '--silent', '--pack-destination', tarballsDir], {
            cwd: pkgDir,
            encoding: 'utf8',
        });
        const [{ filename }] = JSON.parse(raw);
        const tarball = path.join(tarballsDir, filename);
        const dest = path.join(destinationScopeDir, pkg);
        fs.mkdirSync(dest, { recursive: true });
        execFileSync('tar', ['-xzf', tarball, '-C', dest, '--strip-components=1']);
        log(`packed+extracted @rnw-community/${pkg}`);
    }
}

function runNode(args, cwd) {
    return execFileSync('node', args, { cwd, encoding: 'utf8' });
}

function checkExecutable({ pkg, exportName }) {
    const specifier = `@rnw-community/${pkg}`;

    try {
        const out = runNode(
            ['-e', `const m = require('${specifier}'); console.log(typeof m['${exportName}'] !== 'undefined' ? 'OK' : 'MISSING');`],
            projectDir
        ).trim();
        if (out !== 'OK') {
            fail(pkg, `require('${specifier}') succeeded but '${exportName}' is missing from the CJS export`);
        } else {
            log(`  OK   ${pkg} (CJS require, '${exportName}')`);
        }
    } catch (error) {
        fail(pkg, `require('${specifier}') threw: ${error.message.split('\n')[0]}`);
    }

    const script = `import('${specifier}').then(m => { console.log(typeof m['${exportName}'] !== 'undefined' ? 'OK' : 'MISSING'); }, e => { console.error(e.code, e.message); process.exit(1); });`;
    try {
        const out = runNode(['--input-type=module', '-e', script], projectDir).trim();
        if (out !== 'OK') {
            fail(pkg, `import('${specifier}') succeeded but '${exportName}' is missing from the ESM export`);
        } else {
            log(`  OK   ${pkg} (ESM import, '${exportName}')`);
        }
    } catch (error) {
        fail(pkg, `import('${specifier}') threw: ${error.message.split('\n')[0]}`);
    }
}

function findSpotCheckableRelativeSpecifier(entryFile) {
    const content = fs.readFileSync(entryFile, 'utf8');
    const specRe = /(?:from\s*|require\s*\(\s*)(['"])(\.[^'"]*)\1/g;
    let match;
    while ((match = specRe.exec(content))) {
        if (match[2] !== eslintPluginPackageJsonSpecifier) {
            return match[2];
        }
    }

    return undefined;
}

function checkResolutionOnly({ pkg, unloadableBecause }) {
    const specifier = `@rnw-community/${pkg}`;
    const pkgDir = path.join(scopeDir, pkg);
    const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

    log(`  --   ${pkg}: skipping live execution — ${unloadableBecause}`);

    try {
        runNode(['-e', `require.resolve('${specifier}')`], projectDir);
        log(`  OK   ${pkg} (CJS require.resolve)`);
    } catch (error) {
        fail(pkg, `require.resolve('${specifier}') threw: ${error.message.split('\n')[0]}`);
    }

    try {
        runNode(['--input-type=module', '-e', `import.meta.resolve('${specifier}')`], projectDir);
        log(`  OK   ${pkg} (ESM import.meta.resolve entry)`);
    } catch (error) {
        fail(pkg, `import.meta.resolve('${specifier}') threw: ${error.message.split('\n')[0]}`);
    }

    const entryRelative = pkgJson.exports['.'].import.default;
    const entryFile = path.join(pkgDir, entryRelative);
    const deepSpecifier = findSpotCheckableRelativeSpecifier(entryFile);
    if (deepSpecifier === undefined) {
        fail(pkg, `could not find a relative specifier inside ${entryRelative} to spot-check`);

        return;
    }

    const parentUrl = `file://${entryFile}`;
    const script = `console.log(import.meta.resolve('${deepSpecifier}', '${parentUrl}'))`;
    try {
        runNode(['--input-type=module', '-e', script], projectDir);
        log(`  OK   ${pkg} (ESM import.meta.resolve deep specifier '${deepSpecifier}')`);
    } catch (error) {
        fail(pkg, `import.meta.resolve('${deepSpecifier}') relative to ${entryRelative} threw: ${error.message.split('\n')[0]}`);
    }
}

function collectJsAndDtsFiles(rootDir) {
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

function scanInstalledPackagesForExtensionlessSpecifiers() {
    const specRe = /(from\s*|import\s*\(\s*)(['"])(\.[^'"]*)\2/g;
    let totalFound = 0;

    for (const pkg of ALL_PACKAGE_NAMES) {
        const esmDir = path.join(scopeDir, pkg, 'dist', 'esm');
        if (!fs.existsSync(esmDir)) continue;

        for (const file of collectJsAndDtsFiles(esmDir)) {
            const content = fs.readFileSync(file, 'utf8');
            let match;
            specRe.lastIndex = 0;
            while ((match = specRe.exec(content))) {
                const spec = match[3];
                if (!/\.(js|mjs|cjs|json)$/.test(spec)) {
                    fail(pkg, `installed dist/esm has an extensionless relative specifier '${spec}' in ${path.relative(scopeDir, file)}`);
                    totalFound++;
                }
            }
        }
    }

    log(`static scan of installed dist/esm: ${totalFound} extensionless relative specifiers found`);
}

log('Building publishable packages...');
execFileSync('yarn', ['turbo', 'run', 'build', ...ALL_PACKAGE_NAMES.map(pkg => `--filter=@rnw-community/${pkg}`)], {
    cwd: repoRoot,
    stdio: 'inherit',
});

log('\nPacking tarballs and extracting into scratch node_modules...');
packAllInto(scopeDir);

log('\nExecuting real require()/import() against every loadable package...');
for (const entry of EXECUTABLE_PACKAGES) {
    checkExecutable(entry);
}

log('\nAsserting resolution (entry + deep specifier) for packages that cannot execute in plain Node...');
for (const entry of RESOLUTION_ONLY_PACKAGES) {
    checkResolutionOnly(entry);
}

log('\nStatic-scanning every installed package for extensionless relative specifiers...');
scanInstalledPackagesForExtensionlessSpecifiers();

if (failures.length > 0) {
    console.error(`\n${failures.length} smoke check(s) failed:`);
    failures.forEach(entry => console.error(`  - ${entry}`));
    process.exit(1);
}

log('\nAll smoke checks passed.');
