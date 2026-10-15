#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import oxlintPlugin from 'eslint-plugin-oxlint';
import prettier from 'prettier';

import { eslintConfigWithoutOxlint, oxlintConfigPath } from '../eslint.config.mjs';

const repoRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const fileCategories = [
    { files: ['**/*.tsx'], probe: 'packages/oxlint-probe/src/probe.tsx' },
    { files: ['**/*.ts'], probe: 'packages/oxlint-probe/src/probe.ts' },
    { files: ['**/*.spec.ts'], probe: 'packages/oxlint-probe/src/probe.spec.ts' },
    { files: ['**/*.spec.tsx'], probe: 'packages/oxlint-probe/src/probe.spec.tsx' },
];

const oxlintPluginByEslintPrefix = {
    '': 'eslint',
    '@typescript-eslint': 'typescript',
    'import-x': 'import',
    jest: 'jest',
    n: 'node',
    promise: 'promise',
    react: 'react',
    'react-hooks': 'react',
};

const severityNames = ['off', 'warn', 'error'];

const toSeverityName = severity => (typeof severity === 'number' ? severityNames[severity] : severity);

const splitRuleName = eslintRuleName => {
    const separatorIndex = eslintRuleName.lastIndexOf('/');

    return separatorIndex === -1
        ? { prefix: '', name: eslintRuleName }
        : { prefix: eslintRuleName.slice(0, separatorIndex), name: eslintRuleName.slice(separatorIndex + 1) };
};

const pluginsKeptInEslint = new Map([
    [
        'jest',
        'oxlint detects jest calls the jest plugin ignores, so no-conditional-expect, valid-expect and valid-title diverge',
    ],
    [
        'react-hooks',
        'oxlint ports the React Compiler checks independently, so refs, immutability and rules-of-hooks diverge',
    ],
]);

const rulesKeptInEslint = new Map([
    ['id-length', 'oxlint also reports single-letter TypeScript type parameters, which ESLint core never visits'],
    [
        'max-params',
        'oxlint reports at the parameter list, ESLint at the function head, so disable directives cannot serve both',
    ],
    [
        'import-x/no-duplicates',
        'oxlint merges `import type` with value imports from the same module, import-x keeps them apart',
    ],
    ...[
        'ban-ts-comment',
        'no-empty-object-type',
        'no-explicit-any',
        'no-invalid-void-type',
        'no-namespace',
        'complexity',
        'default-case',
        'func-style',
        'logical-assignment-operators',
        'max-lines',
        'max-lines-per-function',
        'max-statements',
        'no-bitwise',
        'no-console',
        'no-div-regex',
        'no-else-return',
        'no-global-assign',
        'no-implicit-globals',
        'no-lone-blocks',
        'no-lonely-if',
        'no-misleading-character-class',
        'no-negated-condition',
        'no-param-reassign',
        'no-shadow-restricted-names',
        'no-underscore-dangle',
        'no-unmodified-loop-condition',
        'no-unsafe-optional-chaining',
        'no-unused-vars',
        'no-use-before-define',
        'prefer-const',
        'prefer-destructuring',
        'prefer-template',
        'promise/always-return',
        'react/jsx-max-depth',
        'sort-imports',
        'vars-on-top',
    ].map(ruleName => [ruleName, 'oxlint reports a different set or position of problems than ESLint on the parity corpus']),
]);

const isKeptInEslint = eslintRuleName => {
    const { prefix, name } = splitRuleName(eslintRuleName);
    const unprefixedTypescriptName = prefix === '@typescript-eslint' ? name : eslintRuleName;

    return (
        pluginsKeptInEslint.has(prefix) ||
        rulesKeptInEslint.has(eslintRuleName) ||
        rulesKeptInEslint.has(unprefixedTypescriptName)
    );
};

const oxlintBinary = path.join(repoRoot, 'node_modules/.bin/oxlint');

const readOxlintRuleCatalog = () => {
    const output = execFileSync(oxlintBinary, ['--rules', '--format=json'], {
        cwd: os.tmpdir(),
        encoding: 'utf8',
    });

    return new Map(JSON.parse(output).map(rule => [`${rule.scope}/${rule.value}`, rule]));
};

const isUsableOxlintRule = rule => rule !== undefined && rule.category !== 'nursery' && !rule.type_aware;

const findOxlintRuleName = (eslintRuleName, catalog) => {
    const { prefix, name } = splitRuleName(eslintRuleName);
    const oxlintPluginName = oxlintPluginByEslintPrefix[prefix];
    if (oxlintPluginName === undefined) {
        return undefined;
    }
    if (isUsableOxlintRule(catalog.get(`${oxlintPluginName}/${name}`))) {
        return oxlintPluginName === 'eslint' ? name : `${oxlintPluginName}/${name}`;
    }
    if (prefix === '@typescript-eslint' && isUsableOxlintRule(catalog.get(`eslint/${name}`))) {
        return name;
    }

    return undefined;
};

const disabledOxlintCategories = Object.fromEntries(
    ['correctness', 'nursery', 'pedantic', 'perf', 'restriction', 'style', 'suspicious'].map(category => [category, 'off'])
);

const eslintRulesDisabledBy = oxlintRules =>
    new Set(
        oxlintPlugin
            .buildFromOxlintConfig({ categories: disabledOxlintCategories, rules: oxlintRules })
            .flatMap(config => Object.keys(config.rules ?? {}))
    );

const collectActiveEslintRules = async probe => {
    const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: eslintConfigWithoutOxlint });
    const { rules } = await eslint.calculateConfigForFile(path.join(repoRoot, probe));

    return new Map(
        Object.entries(rules)
            .map(([ruleName, entry]) => {
                const [severity, ...options] = Array.isArray(entry) ? entry : [entry];

                return [ruleName, [toSeverityName(severity), ...options]];
            })
            .filter(([, [severity]]) => severity !== 'off')
    );
};

const migrateCategory = (activeEslintRules, catalog) => {
    const candidates = new Map();
    for (const [eslintRuleName, entry] of activeEslintRules) {
        const oxlintRuleName = isKeptInEslint(eslintRuleName) ? undefined : findOxlintRuleName(eslintRuleName, catalog);
        if (oxlintRuleName !== undefined) {
            const sources = candidates.get(oxlintRuleName) ?? [];
            candidates.set(oxlintRuleName, [...sources, { eslintRuleName, entry }]);
        }
    }

    const oxlintRules = {};
    const migratedEslintRules = new Set();
    for (const [oxlintRuleName, sources] of candidates) {
        const [{ eslintRuleName, entry }] = sources;
        const sharesOneEntry = sources.every(source => JSON.stringify(source.entry) === JSON.stringify(entry));
        const sourceNames = new Set(sources.map(source => source.eslintRuleName));
        const disabledEslintRules = eslintRulesDisabledBy({ [oxlintRuleName]: entry[0] });
        const disablesOnlyItsSources =
            disabledEslintRules.has(eslintRuleName) &&
            [...disabledEslintRules].every(disabled => !activeEslintRules.has(disabled) || sourceNames.has(disabled));
        if (sharesOneEntry && disablesOnlyItsSources) {
            oxlintRules[oxlintRuleName] = entry.length === 1 ? entry[0] : entry;
            sourceNames.forEach(sourceName => migratedEslintRules.add(sourceName));
        }
    }

    return { oxlintRules, migratedEslintRules };
};

const assertNoEslintRuleDropped = (activeEslintRules, { oxlintRules, migratedEslintRules }) => {
    for (const disabled of eslintRulesDisabledBy(oxlintRules)) {
        if (activeEslintRules.has(disabled) && !migratedEslintRules.has(disabled)) {
            throw new Error(`oxlint config would silently disable ESLint rule "${disabled}"`);
        }
    }
};

const globalIgnores = eslintConfigWithoutOxlint.filter(config =>
    Object.keys(config).every(key => key === 'ignores' || key === 'name')
);

const buildOxlintConfig = (categoryRules, rejectedOxlintRules) => {
    const everyMigratedRule = [...new Set(categoryRules.flatMap(({ rules }) => Object.keys(rules)))]
        .filter(ruleName => !rejectedOxlintRules.has(ruleName))
        .sort();

    return {
        $schema: './node_modules/oxlint/configuration_schema.json',
        plugins: [
            ...new Set(
                everyMigratedRule.filter(ruleName => ruleName.includes('/')).map(ruleName => splitRuleName(ruleName).prefix)
            ),
        ].sort(),
        categories: disabledOxlintCategories,
        ignorePatterns: globalIgnores.flatMap(config => config.ignores),
        overrides: categoryRules.map(({ files, rules }) => ({
            files,
            rules: Object.fromEntries(everyMigratedRule.map(ruleName => [ruleName, rules[ruleName] ?? 'off'])),
        })),
    };
};

const findRulesOxlintRejects = oxlintConfig => {
    const scratchDir = fs.mkdtempSync(path.join(os.tmpdir(), 'oxlintrc-'));
    const scratchConfig = path.join(scratchDir, '.oxlintrc.json');
    fs.writeFileSync(scratchConfig, JSON.stringify({ ...oxlintConfig, $schema: undefined }));
    fs.writeFileSync(path.join(scratchDir, 'empty.ts'), '');
    try {
        execFileSync(oxlintBinary, ['--config', scratchConfig, path.join(scratchDir, 'empty.ts')], {
            encoding: 'utf8',
            stdio: 'pipe',
        });

        return [];
    } catch (error) {
        const output = `${error.stdout ?? ''}${error.stderr ?? ''}`;
        const rejected = [...output.matchAll(/Invalid configuration for rule `([^`]+)`/gu)].map(([, ruleName]) => ruleName);
        if (rejected.length === 0) {
            throw new Error(`oxlint failed to load the generated config:\n${output}`);
        }

        return rejected;
    } finally {
        fs.rmSync(scratchDir, { recursive: true, force: true });
    }
};

const catalog = readOxlintRuleCatalog();
const categoryRules = [];
for (const category of fileCategories) {
    const activeEslintRules = await collectActiveEslintRules(category.probe);
    const migration = migrateCategory(activeEslintRules, catalog);
    assertNoEslintRuleDropped(activeEslintRules, migration);
    categoryRules.push({ files: category.files, rules: migration.oxlintRules });
}

const rejectedOxlintRules = new Set();
let oxlintConfig = buildOxlintConfig(categoryRules, rejectedOxlintRules);
for (
    let rejected = findRulesOxlintRejects(oxlintConfig);
    rejected.length > 0;
    rejected = findRulesOxlintRejects(oxlintConfig)
) {
    rejected.forEach(ruleName => rejectedOxlintRules.add(ruleName.replace(/^eslint\//u, '')));
    oxlintConfig = buildOxlintConfig(categoryRules, rejectedOxlintRules);
}
const everyMigratedRule = Object.keys(oxlintConfig.overrides[0].rules);

const prettierConfig = await prettier.resolveConfig(oxlintConfigPath);
const generated = await prettier.format(JSON.stringify(oxlintConfig), { ...prettierConfig, filepath: oxlintConfigPath });

if (process.argv.includes('--check')) {
    const committed = fs.existsSync(oxlintConfigPath) ? fs.readFileSync(oxlintConfigPath, 'utf8') : '';
    if (committed !== generated) {
        console.error(
            '.oxlintrc.json is out of sync with eslint.config.mjs; run `pnpm lint:oxlint:generate` and commit the result.'
        );
        process.exit(1);
    }
    console.log(`.oxlintrc.json is in sync (${everyMigratedRule.length} rules run in oxlint).`);
} else {
    fs.writeFileSync(oxlintConfigPath, generated);
    console.log(`wrote ${path.relative(repoRoot, oxlintConfigPath)} with ${everyMigratedRule.length} rules.`);
    for (const [ruleName, reason] of [...pluginsKeptInEslint, ...rulesKeptInEslint]) {
        console.log(`  kept in ESLint: ${ruleName} (${reason})`);
    }
    for (const ruleName of rejectedOxlintRules) {
        console.log(`  kept in ESLint: ${ruleName} (oxlint rejects the configured options)`);
    }
}
