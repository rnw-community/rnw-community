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
        pkg: 'react-native-collapsible-header',
        unloadableBecause: 'imports React Native and Reanimated runtime bindings that require a native or Metro environment',
        unresolvedExternalPackages: ['react-native-reanimated', 'react-compiler-runtime'],
    },
    {
        pkg: 'react-native-screen-chrome',
        unloadableBecause: 'imports React Native, Reanimated, and native blur bindings that require a native or Metro environment',
        unresolvedExternalPackages: [
            '@react-native-masked-view/masked-view',
            'expo-blur',
            'expo-linear-gradient',
            'react-native-reanimated',
            'react-native-safe-area-context',
        ],
    },
    {
        pkg: 'react-native-payments',
        unloadableBecause:
            "imports value bindings ('Platform', 'NativeModules', 'TurboModuleRegistry', 'NativeEventEmitter') from 'react-native', untranspiled Flow/JSX",
    },
    {
        pkg: 'eslint-plugin',
        unloadableBecause:
            "requires '../package.json', a file its own build script deletes post-compile (pre-existing, documented in AGENTS.md, unrelated to #531)",
        hasRealEsmOutput: false,
    },
];

const eslintPluginPackageJsonSpecifier = '../package.json';
const nativePaymentsNativeModuleRequireSpecifier = '../../NativePayments';

function isRuntimeRequireCall(fullMatchText) {
    return /^require\s*\(/.test(fullMatchText);
}

const MODULE_RESOLUTION_ERROR_CODES = new Set([
    'ERR_MODULE_NOT_FOUND',
    'MODULE_NOT_FOUND',
    'ERR_UNSUPPORTED_DIR_IMPORT',
    'ERR_INVALID_MODULE_SPECIFIER',
    'ERR_PACKAGE_PATH_NOT_EXPORTED',
    'ERR_UNSUPPORTED_ESM_URL_SCHEME',
    'ERR_INVALID_PACKAGE_CONFIG',
]);

function createRelativeSpecifierRegex() {
    return /(?:from\s*|import\s*\(\s*|require\s*\(\s*|import\s+)(['"])(\.[^'"]*)\1/g;
}

const ALL_PACKAGE_NAMES = [
    ...EXECUTABLE_PACKAGES.map(entry => entry.pkg),
    ...RESOLUTION_ONLY_PACKAGES.map(entry => entry.pkg),
];
const ESM_INVARIANT_EXEMPT_PACKAGES = new Set(
    RESOLUTION_ONLY_PACKAGES.filter(entry => entry.hasRealEsmOutput === false).map(entry => entry.pkg)
);

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
        JSON.stringify(
            {
                name: 'smoke-esm-scratch',
                private: true,
                version: '1.0.0',
                dependencies: collectExternalRuntimeDependencies(),
            },
            null,
            4
        )
    );

    execFileSync(
        'npm',
        ['install', '--legacy-peer-deps', '--no-audit', '--no-fund', '--no-package-lock', '--loglevel=error'],
        {
            cwd: projectDir,
            stdio: 'inherit',
        }
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

function collectExternalRuntimeDependencies() {
    return ALL_PACKAGE_NAMES.reduce((merged, pkg) => {
        const pkgJson = JSON.parse(fs.readFileSync(path.join(repoRoot, 'packages', pkg, 'package.json'), 'utf8'));
        for (const dependencySection of ['dependencies', 'peerDependencies']) {
            for (const [name, version] of Object.entries(pkgJson[dependencySection] ?? {})) {
                if (name.startsWith('@rnw-community/')) {
                    continue;
                }
                if (name in merged && merged[name] !== version) {
                    throw new Error(`Conflicting '${name}' specifiers: '${merged[name]}' vs '${version}'`);
                }
                merged[name] = version;
            }
        }

        return merged;
    }, {});
}

function runNode(args, cwd) {
    return execFileSync('node', args, { cwd, encoding: 'utf8' });
}

function checkExecutable({ pkg, exportName }) {
    const specifier = `@rnw-community/${pkg}`;

    try {
        const out = runNode(
            [
                '-e',
                `const m = require('${specifier}'); console.log(typeof m['${exportName}'] !== 'undefined' ? 'OK' : 'MISSING');`,
            ],
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
    const specRe = createRelativeSpecifierRegex();
    let match;
    while ((match = specRe.exec(content))) {
        if (match[2] !== eslintPluginPackageJsonSpecifier) {
            return match[2];
        }
    }

    return undefined;
}

function checkResolutionOnly({ pkg, unloadableBecause, hasRealEsmOutput = true, unresolvedExternalPackages = [] }) {
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

    if (!hasRealEsmOutput) {
        log(
            `  --   ${pkg}: skipping ESM deep-specifier probe — dist/esm is byte-equivalent CommonJS, not real ESM (see AGENTS.md)`
        );

        return;
    }

    const entryRelative = pkgJson.exports['.'].import.default;
    const entryFile = path.join(pkgDir, entryRelative);
    const deepSpecifier = findSpotCheckableRelativeSpecifier(entryFile);
    if (deepSpecifier === undefined) {
        fail(pkg, `could not find a relative specifier inside ${entryRelative} to spot-check`);

        return;
    }

    const resolutionErrorCodesLiteral = JSON.stringify([...MODULE_RESOLUTION_ERROR_CODES]);
    const unresolvedExternalPackagesLiteral = JSON.stringify(unresolvedExternalPackages);
    const probeFile = path.join(path.dirname(entryFile), '.rnw-smoke-deep-specifier-probe.mjs');
    fs.writeFileSync(
        probeFile,
        `
        const resolutionErrorCodes = new Set(${resolutionErrorCodesLiteral});
        const unresolvedExternalPackages = ${unresolvedExternalPackagesLiteral};
        import('${deepSpecifier}').then(
            () => { console.log('imported'); },
            e => {
                const isAllowedUnresolvedExternal = e.code === 'ERR_MODULE_NOT_FOUND' && unresolvedExternalPackages.some(
                    externalPackage => e.message.includes("Cannot find package '" + externalPackage + "'")
                );
                if (isAllowedUnresolvedExternal) {
                    console.log('resolved-but-external-missing ' + e.message.split('\\n')[0]);
                    return;
                }
                if (resolutionErrorCodes.has(e.code)) {
                    console.error(e.code, e.message);
                    process.exit(1);
                }
                console.log('resolved-but-not-executable ' + e.constructor.name + ' ' + e.code);
            }
        );
        `
    );
    try {
        const out = runNode([probeFile], projectDir).trim();
        log(
            `  OK   ${pkg} (ESM deep specifier '${deepSpecifier}', resolved from a probe placed next to the real entry: ${out})`
        );
    } catch (error) {
        fail(pkg, `import('${deepSpecifier}') relative to ${entryRelative} threw: ${error.message.split('\n')[0]}`);
    } finally {
        fs.rmSync(probeFile, { force: true });
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
    let totalFound = 0;

    for (const pkg of ALL_PACKAGE_NAMES) {
        if (ESM_INVARIANT_EXEMPT_PACKAGES.has(pkg)) {
            log(
                `  --   ${pkg}: skipping extensionless-specifier scan — dist/esm is byte-equivalent CommonJS, not real ESM (see AGENTS.md)`
            );
            continue;
        }

        const pkgJson = JSON.parse(fs.readFileSync(path.join(scopeDir, pkg, 'package.json'), 'utf8'));
        const importCondition = pkgJson.exports?.['.']?.import;
        const scannedEntries = [importCondition?.default ?? './dist/esm/index.js', importCondition?.types].filter(
            entry => entry != null
        );
        const scannedDirs = [...new Set(scannedEntries.map(entry => path.dirname(path.join(scopeDir, pkg, entry))))];
        const missingDir = scannedDirs.find(dir => !fs.existsSync(dir));
        if (missingDir) {
            fail(pkg, `installed package has no ESM directory at ${path.relative(scopeDir, missingDir)}`);
            continue;
        }

        for (const file of scannedDirs.flatMap(dir => collectJsAndDtsFiles(dir))) {
            const content = fs.readFileSync(file, 'utf8');
            const specRe = createRelativeSpecifierRegex();
            let match;
            while ((match = specRe.exec(content))) {
                const spec = match[2];
                const isExemptRuntimeRequire =
                    spec === nativePaymentsNativeModuleRequireSpecifier && isRuntimeRequireCall(match[0]);
                if (!isExemptRuntimeRequire && !/\.(js|mjs|cjs|json)$/.test(spec)) {
                    fail(
                        pkg,
                        `installed dist/esm has an extensionless relative specifier '${spec}' in ${path.relative(scopeDir, file)}`
                    );
                    totalFound++;
                }
            }
        }
    }

    log(`static scan of installed dist/esm: ${totalFound} extensionless relative specifiers found`);
}

log('Building publishable packages...');
execFileSync('pnpm', ['turbo', 'run', 'build', ...ALL_PACKAGE_NAMES.map(pkg => `--filter=@rnw-community/${pkg}`)], {
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
