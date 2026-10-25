#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

import migrate from '@oxlint/migrate';
import { ESLint } from 'eslint';
import oxlintPlugin from 'eslint-plugin-oxlint';
import prettier from 'prettier';
import tseslint from 'typescript-eslint';

import { eslintConfigWithoutOxlint, oxlintConfigPath } from '../eslint.config.mjs';

import { assertTypeAwareRuleCoverage } from './assert-type-aware-rule-coverage.mjs';

const repoRoot = path.dirname(oxlintConfigPath);

const fileCategories = [
    { files: ['**/*.tsx'], probe: 'packages/oxlint-probe/src/probe.tsx' },
    { files: ['**/*.ts'], probe: 'packages/oxlint-probe/src/probe.ts' },
    { files: ['**/*.spec.ts'], probe: 'packages/oxlint-probe/src/probe.spec.ts' },
    { files: ['**/*.spec.tsx'], probe: 'packages/oxlint-probe/src/probe.spec.tsx' },
];

const nativeRuleCatalog = [
    ...oxlintPlugin.configs['flat/all'],
    ...oxlintPlugin.buildFromOxlintConfig(
        { plugins: ['typescript'], categories: { correctness: 'off', nursery: 'error' } },
        { typeAware: true, withNursery: true }
    ),
];
const supportedTypeAwareRules = new Set(
    nativeRuleCatalog
        .flatMap(config => Object.keys(config.rules ?? {}))
        .filter(
            name =>
                name.startsWith('@typescript-eslint/') &&
                tseslint.plugin.rules[name.slice('@typescript-eslint/'.length)]?.meta.docs?.requiresTypeChecking
        )
);

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
    ['strict-boolean-expressions', 'native checks miss non-nullable heterogeneous enums in conditions'],
    ['no-unnecessary-condition', 'optional-chain diagnostics span different lines, changing disable directive behavior'],
    ['dot-notation', 'the typed oxlint rule does not disable the active core ESLint rule'],
    ['consistent-return', 'tsgolint skips missing final returns in async functions'],
    ['id-length', 'oxlint also reports single-letter TypeScript type parameters, which ESLint core never visits'],
    [
        'max-params',
        'oxlint reports at the parameter list, ESLint at the function head, so disable directives cannot serve both',
    ],
    [
        'import-x/no-duplicates',
        'oxlint merges `import type` with value imports from the same module, import-x keeps them apart',
    ],
    ['preserve-caught-error', 'oxlint rejects the configured options'],
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
        'no-else-return',
        'no-global-assign',
        'no-implicit-globals',
        'no-lone-blocks',
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
        'vars-on-top',
    ].map(ruleName => [ruleName, 'oxlint reports a different set or position of problems than ESLint on the parity corpus']),
]);

const isKeptInEslint = ruleName =>
    pluginsKeptInEslint.has(ruleName.split('/')[0]) ||
    rulesKeptInEslint.has(ruleName) ||
    rulesKeptInEslint.has(ruleName.replace(/^@typescript-eslint\//u, ''));

const isOff = entry => [0, 'off'].includes(Array.isArray(entry) ? entry[0] : entry);

const withoutRules = (rules, isDropped) =>
    Object.fromEntries(Object.entries(rules).filter(([ruleName]) => !isDropped(ruleName)));

const assertOxlintTakesOverWhatItDisables = (eslintRules, oxlintRules) => {
    for (const [oxlintRuleName, oxlintEntry] of Object.entries(oxlintRules)) {
        const [disabledInEslint] = oxlintPlugin.buildFromOxlintConfig({
            categories: { correctness: 'off' },
            options: { typeAware: true },
            rules: { [oxlintRuleName]: 'error' },
        });
        const disabledRules = Object.keys(disabledInEslint?.rules ?? {});
        if (!isOff(oxlintEntry) && disabledRules.every(ruleName => isOff(eslintRules[ruleName] ?? 'off'))) {
            throw new Error(`oxlint "${oxlintRuleName}" would not replace an active ESLint rule`);
        }
        for (const eslintRuleName of disabledRules) {
            const eslintEntry = eslintRules[eslintRuleName] ?? 'off';
            if (!isOff(eslintEntry) && JSON.stringify(eslintEntry) !== JSON.stringify(oxlintEntry)) {
                throw new Error(
                    `oxlint "${oxlintRuleName}" would replace ESLint "${eslintRuleName}" with different options`
                );
            }
        }
    }
};

const eslint = new ESLint({ cwd: repoRoot, overrideConfigFile: true, overrideConfig: eslintConfigWithoutOxlint });
const categories = await Promise.all(
    fileCategories.map(async ({ files, probe }) => {
        const { rules } = await eslint.calculateConfigForFile(path.join(repoRoot, probe));
        assertTypeAwareRuleCoverage(rules, supportedTypeAwareRules);

        return { files, eslintRules: rules, migratableRules: withoutRules(rules, isKeptInEslint) };
    })
);
const activeInAnyCategory = new Set(
    categories.flatMap(({ migratableRules }) =>
        Object.keys(withoutRules(migratableRules, ruleName => isOff(migratableRules[ruleName])))
    )
);
const globalIgnores = eslintConfigWithoutOxlint.filter(config =>
    Object.keys(config).every(key => ['ignores', 'name'].includes(key))
);
const migrated = await migrate(
    [
        ...globalIgnores,
        ...categories.map(({ files, migratableRules }) => ({
            files,
            rules: withoutRules(migratableRules, ruleName => !activeInAnyCategory.has(ruleName)),
        })),
    ],
    undefined,
    { typeAware: true, jsPlugins: false }
);
for (const { files, eslintRules } of categories) {
    const override = migrated.overrides.find(candidate => JSON.stringify(candidate.files) === JSON.stringify(files));
    if (!override) {
        throw new Error(`Missing oxlint override for ${files.join(', ')}`);
    }
    override.rules['sort-imports'] = eslintRules['sort-imports'];
    assertOxlintTakesOverWhatItDisables(eslintRules, override.rules);
}

const prettierConfig = await prettier.resolveConfig(oxlintConfigPath);
const generated = await prettier.format(JSON.stringify(migrated), { ...prettierConfig, filepath: oxlintConfigPath });

if (process.argv.includes('--check')) {
    const committed = fs.existsSync(oxlintConfigPath) ? fs.readFileSync(oxlintConfigPath, 'utf8') : '';
    if (committed !== generated) {
        console.error(
            '.oxlintrc.json is out of sync with eslint.config.mjs; run `pnpm lint:oxlint:generate` and commit the result.'
        );
        process.exit(1);
    }
    console.log('.oxlintrc.json is in sync.');
} else {
    fs.writeFileSync(oxlintConfigPath, generated);
    console.log(`wrote ${path.relative(repoRoot, oxlintConfigPath)}`);
    for (const [ruleName, reason] of [...pluginsKeptInEslint, ...rulesKeptInEslint]) {
        console.log(`  kept in ESLint: ${ruleName} (${reason})`);
    }
}
