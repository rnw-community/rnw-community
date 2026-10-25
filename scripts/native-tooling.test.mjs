import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (binary, args) => spawnSync(path.join(root, 'node_modules/.bin', binary), args, { cwd: root, encoding: 'utf8' });

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

test('full lint catches floating promises while fast lint skips type analysis', async () => {
    await withProject('Promise.resolve(1);\n', async (_directory, file) => {
        const full = run('oxlint', ['--no-ignore', '--format', 'json', file]);
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

test('both compilers reject invalid assignments', async () => {
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
            assert.ok(results.some(result => result.messages.some(message => message.ruleId === null)));
        }
    );
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
