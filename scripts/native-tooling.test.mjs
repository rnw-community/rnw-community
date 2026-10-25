import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { ESLint } from 'eslint';

const root = fileURLToPath(new URL('../', import.meta.url));
const binaries = {
    tsc: '@typescript/native/bin/tsc',
    tsrs: 'tsrs/bin/tsrs',
    oxlint: 'oxlint/bin/oxlint',
    turbo: 'turbo/bin/turbo',
};
const run = (binary, args, options = {}) => {
    const result = spawnSync(process.execPath, [path.join(root, 'node_modules', binaries[binary]), ...args], {
        cwd: root,
        encoding: 'utf8',
        timeout: 60000,
        ...options,
    });
    assert.ifError(result.error);
    assert.equal(result.signal, null, `${binary} terminated by ${result.signal}: ${result.stderr}`);
    return result;
};
const { default: getTsrsBinary } = await import(pathToFileURL(path.join(root, 'node_modules/tsrs/lib/getExePath.js')));
let tsrsUnavailable;
try {
    getTsrsBinary();
} catch (error) {
    tsrsUnavailable = error.message;
}

const withProject = async (source, check) => {
    await mkdir(path.join(root, '.scratch'), { recursive: true });
    const directory = await mkdtemp(path.join(root, '.scratch/native-tooling-'));
    try {
        await writeFile(
            path.join(directory, 'tsconfig.json'),
            JSON.stringify({ extends: '../../tsconfig.json', compilerOptions: { incremental: false }, include: ['*.ts'] })
        );
        const file = path.join(directory, 'probe.ts');
        await writeFile(file, source);
        await check(directory, file);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
};

test('package-local full lint catches floating promises while fast lint skips type analysis', async () => {
    await withProject('Promise.resolve(1);\n', async (_directory, file) => {
        const full = run('oxlint', ['--no-ignore', '--format', 'json', file], { cwd: path.join(root, 'packages/shared') });
        assert.equal(full.status, 1, full.stdout + full.stderr);
        assert.ok(JSON.parse(full.stdout).diagnostics.some(item => item.code?.includes('no-floating-promises')));
        const fast = run('oxlint', ['--no-ignore', '--config', '.oxlintrc.fast.json', '--format', 'json', file]);
        assert.ok(!JSON.parse(fast.stdout).diagnostics.some(item => item.code?.includes('no-floating-promises')));
    });
});

test('ESLint hands floating promises to oxlint and retains the typed public API rule', async () => {
    const config = await new ESLint({ cwd: root }).calculateConfigForFile('packages/shared/src/index.ts');
    assert.equal(config.rules['@typescript-eslint/no-floating-promises'][0], 0);
    assert.equal(config.rules['@rnw-community/public-api-tsdoc'][0], 2);
    assert.equal(config.languageOptions.parserOptions.projectService, true);
});

test('both compilers reject invalid assignments', { skip: tsrsUnavailable }, async () => {
    await withProject('export const value: string = 123;\n', async directory => {
        for (const compiler of ['tsc', 'tsrs']) {
            const result = run(compiler, ['-p', directory, '--noEmit', '--pretty', 'false']);
            assert.ok(result.status > 0, result.stdout + result.stderr);
            assert.match(result.stdout, /TS2322/u);
        }
    });
});

test('migrated rules preserve diagnostics on invalid typed code', async () => {
    const { eslintConfigWithoutOxlint } = await import('../eslint.config.mjs');
    const baseline = new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: eslintConfigWithoutOxlint });
    const cases = [
        ['no-floating-promises', 'Promise.resolve(1);\n'],
        ['await-thenable', 'async function probe() { await 1; } void probe();\n'],
        ['no-unsafe-call', "const value: any = JSON.parse('{}'); value.missing();\n"],
        ['no-unsafe-member-access', "const value: any = JSON.parse('{}'); value.missing();\n"],
        ['no-misused-promises', 'const schedule = (callback: () => void) => callback; schedule(async () => {});\n'],
        ['only-throw-error', "throw 'error';\n"],
        ['restrict-template-expressions', 'const value: object = {}; export const output = `${value}`;\n'],
    ];
    for (const [rule, source] of cases) {
        await withProject(source, async (_directory, file) => {
            const original = await baseline.lintFiles([file]);
            const expected = original
                .flatMap(result => result.messages)
                .filter(message => message.ruleId === `@typescript-eslint/${rule}`)
                .map(message => message.line)
                .sort();
            assert.ok(expected.length > 0, rule);
            const migrated = run('oxlint', ['--no-ignore', '--format', 'json', file]);
            const actual = JSON.parse(migrated.stdout)
                .diagnostics.filter(item => item.code === `typescript(${rule})`)
                .map(item => item.labels.at(-1).span.line)
                .sort();
            assert.deepEqual(actual, expected, rule);
        });
    }
});

test('unused directives for multiple migrated rules are ignored without hiding retained rules', async () => {
    const eslint = new ESLint({ cwd: root });
    await withProject(
        "// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment\nconst value = require('node:path');\n",
        async (_directory, file) => {
            const results = await eslint.lintFiles([file]);
            assert.ok(results.every(result => result.messages.every(message => message.ruleId !== null)));
        }
    );
    await withProject(
        '// eslint-disable-next-line @typescript-eslint/no-floating-promises, id-length\nPromise.resolve(1);\n',
        async (_directory, file) => {
            const results = await eslint.lintFiles([file]);
            const messages = results.flatMap(result => result.messages);
            assert.ok(messages.some(message => message.message.startsWith('Unused eslint-disable directive')));
        }
    );
});

test('autofix preserves native suppressions in mixed unused directives', async () => {
    const eslint = new ESLint({ cwd: root, fix: true });
    await withProject(
        '// eslint-disable-next-line @typescript-eslint/no-floating-promises, id-length\nPromise.resolve(1);\n',
        async (_directory, file) => {
            const [result] = await eslint.lintFiles([file]);
            const source = result.output ?? (await readFile(file, 'utf8'));
            assert.match(source, /eslint-disable-next-line @typescript-eslint\/no-floating-promises/u);
            const unused = result.messages.filter(message => message.ruleId === null);
            assert.equal(unused.length, 1);
            assert.match(unused[0].message, /'id-length'/u);
            assert.doesNotMatch(unused[0].message, /no-floating-promises/u);
            assert.equal(unused[0].fix, undefined);
            await writeFile(file, source);
            const native = run('oxlint', ['--no-ignore', '--format', 'json', file]);
            assert.ok(JSON.parse(native.stdout).diagnostics.every(item => !item.code?.includes('no-floating-promises')));
        }
    );
});

test('fast lint retains inherited syntax rules', async () => {
    await withProject('if (true) {} else { if (false) {} }\n', async (_directory, file) => {
        const fast = run('oxlint', ['--no-ignore', '--config', '.oxlintrc.fast.json', '--format', 'json', file]);
        assert.equal(fast.status, 1, fast.stdout + fast.stderr);
        assert.ok(JSON.parse(fast.stdout).diagnostics.some(item => item.code?.includes('no-lonely-if')));
    });
});

test('missing async returns remain an ESLint error', async () => {
    const eslint = new ESLint({ cwd: root });
    await withProject(
        'async function probe(flag: boolean) { if (flag) { return await Promise.resolve(1); } } void probe(true);\n',
        async (_directory, file) => {
            const results = await eslint.lintFiles([file]);
            assert.ok(
                results.some(result =>
                    result.messages.some(message => message.ruleId === 'consistent-return' && message.severity === 2)
                )
            );
        }
    );
});

test('dot notation violations have one owner', async () => {
    const eslint = new ESLint({ cwd: root });
    await withProject("const object = { value: 1 }; export const value = object['value'];\n", async (_directory, file) => {
        const results = await eslint.lintFiles([file]);
        assert.equal(
            results.flatMap(result => result.messages).filter(message => message.ruleId === 'dot-notation').length,
            1
        );
        const native = run('oxlint', ['--no-ignore', '--format', 'json', file]);
        assert.ok(JSON.parse(native.stdout).diagnostics.every(item => !item.code?.includes('dot-notation')));
    });
});

test('native emit preserves legacy decorator metadata and declarations', { skip: tsrsUnavailable }, async () => {
    await withProject(
        'function marker(_target: object, _name: string, _descriptor: PropertyDescriptor): void {}\nexport class Item { @marker read(value: string): string { return value; } }\n',
        async directory => {
            const outputs = [];
            for (const compiler of ['tsc', 'tsrs']) {
                const outDir = path.join(directory, compiler);
                const result = run(compiler, [
                    '-p',
                    directory,
                    '--noEmit',
                    'false',
                    '--outDir',
                    outDir,
                    '--pretty',
                    'false',
                ]);
                assert.equal(result.status, 0, result.stdout + result.stderr);
                const javascript = await readFile(path.join(outDir, 'probe.js'), 'utf8');
                const declarations = await readFile(path.join(outDir, 'probe.d.ts'), 'utf8');
                assert.match(javascript, /__metadata\("design:paramtypes", \[String\]\)/u);
                assert.match(declarations, /read\(value: string\): string/u);
                assert.ok(await readFile(path.join(outDir, 'probe.js.map'), 'utf8'));
                assert.ok(await readFile(path.join(outDir, 'probe.d.ts.map'), 'utf8'));
                outputs.push({ javascript, declarations });
            }
            assert.deepEqual(outputs[1], outputs[0]);
        }
    );
});

test('updated native syntax rules preserve baseline diagnostic positions and have one owner', async () => {
    const { eslintConfigWithoutOxlint } = await import('../eslint.config.mjs');
    const baseline = new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: eslintConfigWithoutOxlint });
    const current = new ESLint({ cwd: root });
    const cases = [
        ['sort-imports', "export const value = 1;\nimport { resolve, basename } from 'node:path';\n"],
        [
            'no-lonely-if',
            'declare const first: () => boolean, second: () => boolean, third: () => boolean;\nif (first()) { first(); } else if (second()) { second(); } else { if (third()) { third(); } }\n',
        ],
        ['no-div-regex', 'export const pattern = /=+$/;\n'],
    ];
    for (const [rule, source] of cases) {
        await withProject(source, async (_directory, file) => {
            const config = await current.calculateConfigForFile(file);
            assert.equal(config.rules[rule][0], 0, rule);
            const expected = (await baseline.lintFiles([file]))
                .flatMap(result => result.messages)
                .filter(message => message.ruleId === rule)
                .map(message => [message.line, message.column]);
            assert.ok(expected.length > 0, rule);
            const native = run('oxlint', ['--no-ignore', '--format', 'json', file]);
            const actual = JSON.parse(native.stdout)
                .diagnostics.filter(item => item.code === `eslint(${rule})`)
                .map(item => [item.labels.at(-1).span.line, item.labels.at(-1).span.column]);
            assert.deepEqual(actual, expected, rule);
        });
    }
});

test('additional typed policies reject unsafe or weaker constructs with one lint owner', async () => {
    const { eslintConfigWithoutOxlint } = await import('../eslint.config.mjs');
    const baseline = new ESLint({ cwd: root, overrideConfigFile: true, overrideConfig: eslintConfigWithoutOxlint });
    const current = new ESLint({ cwd: root });
    const cases = [
        ['consistent-type-exports', 'type Value = string; export { Value };\n'],
        [
            'no-unnecessary-qualifier',
            "namespace Example { export type Value = string; export const value: Example.Value = 'ok'; }\n",
        ],
        ['prefer-find', 'export const value = [1, 2].filter(item => item === 1)[0];\n'],
        ['prefer-includes', 'export const present = [1, 2].indexOf(1) !== -1;\n'],
        [
            'prefer-nullish-coalescing',
            "export const fallback = (value: string | undefined): string => value || 'fallback';\n",
        ],
        ['prefer-readonly', 'export class Example { private value = 1; read(): number { return this.value; } }\n'],
        ['prefer-regexp-exec', "export const result = 'value'.match(/value/);\n"],
        [
            'prefer-string-starts-ends-with',
            "export const matched = (value: string): boolean => value.indexOf('prefix') === 0;\n",
        ],
        ['require-array-sort-compare', 'export const values = [3, 1, 2].sort();\n'],
        [
            'strict-boolean-expressions',
            "enum Mixed { ZERO = 0, YES = 'yes' } export const active = (value: Mixed): number => value ? 1 : 0;\n",
        ],
        [
            'switch-exhaustiveness-check',
            "export const result = (value: 'a' | 'b'): number => { switch (value) { case 'a': return 1; default: return 0; } };\n",
        ],
    ];
    for (const [rule, source] of cases) {
        await withProject(source, async (_directory, file) => {
            const name = `@typescript-eslint/${rule}`;
            const expected = (await baseline.lintFiles([file]))
                .flatMap(result => result.messages)
                .filter(message => message.ruleId === name)
                .map(message => [message.line, message.column]);
            assert.ok(expected.length > 0, rule);
            const config = await current.calculateConfigForFile(file);
            const native = run('oxlint', ['--no-ignore', '--format', 'json', file]);
            const actual = JSON.parse(native.stdout)
                .diagnostics.filter(item => item.code === `typescript(${rule})`)
                .map(item => [item.labels.at(-1).span.line, item.labels.at(-1).span.column]);
            if (rule === 'strict-boolean-expressions') {
                assert.equal(config.rules[name][0], 2);
                const retained = (await current.lintFiles([file]))
                    .flatMap(result => result.messages)
                    .filter(message => message.ruleId === name)
                    .map(message => [message.line, message.column]);
                assert.deepEqual(retained, expected);
                assert.deepEqual(actual, []);
            } else {
                assert.equal(config.rules[name][0], 0, rule);
                assert.deepEqual(actual, expected, rule);
            }
        });
    }
});

test('native await checking rejects mixed promise aggregators', async () => {
    await withProject(
        "export const result = async () => await Promise.all([Promise.resolve(1), 'value']);\n",
        async (_directory, file) => {
            const native = run('oxlint', ['--no-ignore', '--format', 'json', file]);
            assert.ok(JSON.parse(native.stdout).diagnostics.some(item => item.code === 'typescript(await-thenable)'));
        }
    );
});

test('exhaustive switches and intentional string sorting remain valid', async () => {
    await withProject(
        "export const values = ['b', 'a'].sort();\nexport const result = (value: 'a' | 'b'): number => { switch(value) { case 'a': return 1; case 'b': return 2; default: throw new Error('unknown'); } };\n",
        async (_directory, file) => {
            const native = run('oxlint', ['--no-ignore', '--format', 'json', file]);
            assert.ok(
                JSON.parse(native.stdout).diagnostics.every(
                    item =>
                        !['typescript(require-array-sort-compare)', 'typescript(switch-exhaustiveness-check)'].includes(
                            item.code
                        )
                )
            );
        }
    );
});

test('type-aware catalog upgrades require a policy for every newly supported rule', async () => {
    const { assertTypeAwareRuleCoverage } = await import('./assert-type-aware-rule-coverage.mjs');
    assert.throws(() => assertTypeAwareRuleCoverage({}, ['@typescript-eslint/new-typed-check']), /new-typed-check/u);
    assert.doesNotThrow(() =>
        assertTypeAwareRuleCoverage(
            { '@typescript-eslint/await-thenable': [2], '@typescript-eslint/strict-void-return': [0] },
            ['@typescript-eslint/await-thenable', '@typescript-eslint/strict-void-return']
        )
    );
    assert.doesNotThrow(() =>
        assertTypeAwareRuleCoverage({ 'consistent-return': [2], 'dot-notation': [0] }, [
            '@typescript-eslint/consistent-return',
            '@typescript-eslint/dot-notation',
        ])
    );
});

test('compiler launcher falls back only when native binary resolution fails', async () => {
    for (const [available, status, compiler] of [
        [true, 0, 'tsrs'],
        [false, 0, 'tsc'],
        [true, 2, 'tsrs'],
    ]) {
        await withProject('', async directory => {
            await mkdir(path.join(directory, 'scripts'));
            await copyFile(path.join(root, 'scripts/typecheck.mjs'), path.join(directory, 'scripts/typecheck.mjs'));
            for (const [name, binary] of [
                ['tsrs', 'tsrs'],
                ['@typescript/native', 'tsc'],
            ]) {
                const packageRoot = path.join(directory, 'node_modules', name);
                await mkdir(path.join(packageRoot, 'lib'), { recursive: true });
                await mkdir(path.join(packageRoot, 'bin'));
                await writeFile(
                    path.join(packageRoot, 'package.json'),
                    JSON.stringify({ type: 'module', exports: { './package.json': './package.json' } })
                );
                await writeFile(
                    path.join(packageRoot, 'lib/getExePath.js'),
                    available
                        ? 'export default () => "binary";'
                        : 'export default () => { throw new Error("missing optional binary"); };'
                );
                await writeFile(
                    path.join(packageRoot, 'bin', binary),
                    `console.log(JSON.stringify({compiler: '${binary}', args: process.argv.slice(2)})); process.exit(${binary === 'tsrs' ? status : 0});`
                );
            }
            const result = spawnSync(
                process.execPath,
                [path.join(directory, 'scripts/typecheck.mjs'), '--noEmit', '-p', 'project with spaces'],
                { encoding: 'utf8', timeout: 10000, env: { ...process.env, TSRS_BINARY: '' } }
            );
            assert.equal(result.status, status, result.stderr);
            assert.deepEqual(JSON.parse(result.stdout), { compiler, args: ['--noEmit', '-p', 'project with spaces'] });
            assert.equal(result.stderr.includes('falling back'), !available);
        });
    }
});

test('compiler launcher rejects invalid explicit binary overrides', () => {
    const result = spawnSync(process.execPath, [path.join(root, 'scripts/typecheck.mjs'), '--version'], {
        encoding: 'utf8',
        timeout: 10000,
        env: { ...process.env, TSRS_BINARY: path.join(root, '.scratch/missing-compiler') },
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /TSRS_BINARY/u);
    assert.doesNotMatch(result.stderr, /falling back/u);
});

test('Turbo includes explicit compiler overrides in task hashes', () => {
    const hash = binary => {
        const env = { ...process.env, TSRS_BINARY: binary };
        const result = run('turbo', ['run', 'ts', '--filter=@rnw-community/shared', '--dry=json'], { env });
        assert.equal(result.status, 0, result.stdout + result.stderr);
        return JSON.parse(result.stdout).tasks[0].hash;
    };
    assert.notEqual(hash('/first/tsrs'), hash('/second/tsrs'));
});

test('root lint config changes select every package lint task in affected runs', async () => {
    await withProject('', async directory => {
        const write = (name, content) => writeFile(path.join(directory, name), content);
        const { packageManager } = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
        const { futureFlags, tasks } = JSON.parse(await readFile(path.join(root, 'turbo.json'), 'utf8'));
        await write('package.json', JSON.stringify({ name: 'fixture', private: true, packageManager }));
        await write('pnpm-workspace.yaml', 'packages:\n  - packages/*\n');
        await write('turbo.json', JSON.stringify({ futureFlags, tasks: { lint: { inputs: tasks.lint.inputs } } }));
        for (const name of ['first', 'second']) {
            await mkdir(path.join(directory, 'packages', name), { recursive: true });
            await write(`packages/${name}/package.json`, JSON.stringify({ name, scripts: { lint: 'true' } }));
        }
        const git = args => assert.equal(spawnSync('git', args, { cwd: directory }).status, 0, args.join(' '));
        git(['init', '--quiet']);
        git(['add', '.']);
        git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.com', 'commit', '--quiet', '-m', 'fixture']);
        const env = { ...process.env, TURBO_SCM_BASE: 'HEAD', TURBO_SCM_HEAD: 'HEAD' };
        const affected = () => {
            const result = run('turbo', ['run', 'lint', '--affected', '--dry=json'], { cwd: directory, env });
            assert.equal(result.status, 0, result.stdout + result.stderr);
            return JSON.parse(result.stdout)
                .tasks.map(task => task.taskId)
                .sort();
        };
        assert.deepEqual(affected(), []);
        for (const name of ['eslint.config.mjs', '.oxlintrc.json']) {
            await write(name, '{}');
            assert.deepEqual(affected(), ['first#lint', 'second#lint'], name);
            await rm(path.join(directory, name));
        }
    });
});
