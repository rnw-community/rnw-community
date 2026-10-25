import { fileURLToPath } from 'node:url';

import { fixupPluginRules } from '@eslint/compat';
import js from '@eslint/js';
import rxjs from '@smarttools/eslint-plugin-rxjs';
import importPlugin, { createNodeResolver } from 'eslint-plugin-import-x';
import jestPlugin from 'eslint-plugin-jest';
import nodePlugin from 'eslint-plugin-n';
import promisePlugin from 'eslint-plugin-promise';
import reactPluginLegacy from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import { defineConfig } from 'eslint/config';
import oxlint from 'eslint-plugin-oxlint';
import tseslint from 'typescript-eslint';

import rnwPlugin from '@rnw-community/eslint-plugin';

export const oxlintConfigPath = fileURLToPath(new URL('.oxlintrc.json', import.meta.url));

const importResolvableExtensions = ['.ts', '.cts', '.mts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

const reactPlugin = fixupPluginRules(reactPluginLegacy);
const reactRecommended = { ...reactPluginLegacy.configs.flat.recommended, plugins: { react: reactPlugin } };

export const eslintConfigWithoutOxlint = defineConfig(
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '.next/**',
            'build/**',
            '.turbo/**',
            '**/public/**',
            '**/*.html',
            '**/*.json',
            'eslint.config.mjs',
        ],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [js.configs.all],
        rules: {
            camelcase: ['error', { properties: 'never' }],
            complexity: ['error', 25],
            indent: 'off',
            strict: 'off',
            'init-declarations': 'off',
            'class-methods-use-this': 'off',
            'one-var': 'off',
            'new-cap': 'off',
            'lines-between-class-members': 'off',
            'no-duplicate-imports': 'off',
            'no-ternary': 'off',
            'no-void': 'off',
            'no-useless-constructor': 'off',
            'no-undef': 'off',
            'no-magic-numbers': 'off',
            'no-unused-vars': 'off',
            'sort-imports': [
                'error',
                {
                    allowSeparatedGroups: false,
                    ignoreCase: false,
                    ignoreDeclarationSort: true,
                    ignoreMemberSort: false,
                    memberSyntaxSortOrder: ['all', 'multiple', 'none', 'single'],
                },
            ],
            'no-warning-comments': ['error', { terms: ['fixme', 'xxx'], location: 'start' }],
            'sort-keys': 'off',
            'no-shadow': 'off',
            'no-return-await': 'off',
            'no-empty-function': ['error', { allow: ['constructors'] }],
            'capitalized-comments': 'off',
            'arrow-body-style': ['error', 'as-needed'],
            'multiline-ternary': 'off',
            'max-lines-per-function': ['error', { max: 85, skipBlankLines: true, skipComments: true }],
            'max-statements': ['error', { max: 12 }, { ignoreTopLevelFunctions: true }],
            'id-length': ['warn', { exceptions: ['x', 'y', 'z', 'i', 'j', 'e', '_', 'w', 'h'] }],
            'max-params': 'off',
            'operator-linebreak': 'off',
            'newline-before-return': 'error',
            'require-await': 'off',
            'prefer-named-capture-group': 'off',
            'member-ordering': 'off',
            'grouped-accessor-pairs': 'off',
            'no-restricted-syntax': [
                'error',
                ...['ImportDeclaration', 'ExportNamedDeclaration', 'ExportAllDeclaration', 'ImportExpression'].map(
                    nodeType => ({
                        selector: `${nodeType}[source.value=/^\\.[^'"]*\\.(js|jsx|mjs|cjs)$/]`,
                        message:
                            "Relative import/export specifiers must stay extensionless in source — scripts/rewrite-esm-extensions.mjs adds '.js' to the compiled dist/esm output after the build, and Jest resolves the bare specifier straight to the sibling .ts file with no moduleNameMapper to strip an extension back off.",
                    })
                ),
            ],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [tseslint.configs.strictTypeChecked],
        rules: {
            '@typescript-eslint/class-methods-use-this': 'off',
            '@typescript-eslint/consistent-type-exports': 'error',
            '@typescript-eslint/no-unnecessary-qualifier': 'error',
            '@typescript-eslint/prefer-find': 'error',
            '@typescript-eslint/prefer-includes': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/prefer-readonly': 'error',
            '@typescript-eslint/prefer-regexp-exec': 'error',
            '@typescript-eslint/prefer-string-starts-ends-with': 'error',
            '@typescript-eslint/require-array-sort-compare': ['error', { ignoreStringArrays: true }],
            '@typescript-eslint/strict-boolean-expressions': 'error',
            '@typescript-eslint/switch-exhaustiveness-check': [
                'error',
                { allowDefaultCaseForExhaustiveSwitch: true, considerDefaultExhaustiveForUnions: false },
            ],
            '@typescript-eslint/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
            '@typescript-eslint/no-magic-numbers': [
                'error',
                {
                    ignore: [
                        -20, -10, -2, -3, -6, -5, -1, -0.5, 0, 0.0001, 0.1, 0.2, 0.3, 0.35, 0.5, 0.6, 0.64, 0.65, 0.66, 0.75,
                        0.76, 0.79, 0.8, 0.81, 0.83, 1, 1.5, 1.8, 1.97, 2, 2.5, 3, 3.2, 3.25, 4, 4.25, 4.5, 5, 5.5, 6, 6.5,
                        7, 7.5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 18, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
                        31.5, 32, 33, 35, 34, 36, 37, 38, 39, 40, 41, 42, 45, 48, 50, 51, 59, 60, 70, 75, 80, 96, 99, 100,
                        125, 150, 180, 200, 201, 250, 255, 256, 300, 307, 308, 350, 360, 365, 400, 404, 405, 500, 600, 640,
                        725, 900, 1000, 1024, 1200, 1600, 2000, 2019, 2500, 3000, 3500, 3600, 5000, 6000, 10000, 10001,
                        10100, 30000, 60000, 120000, 1000000000,
                    ],
                },
            ],
            '@typescript-eslint/no-confusing-void-expression': ['error', { ignoreVoidOperator: true }],
            '@typescript-eslint/no-meaningless-void-operator': 'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/promise-function-async': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/max-params': ['error', { max: 4 }],
            '@typescript-eslint/no-misused-promises': [
                'error',
                {
                    checksVoidReturn: {
                        attributes: false,
                    },
                },
            ],
            '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
            '@typescript-eslint/no-deprecated': 'off',
            '@typescript-eslint/no-unsafe-type-assertion': 'off',
            '@typescript-eslint/non-nullable-type-assertion-style': 'off',
            '@typescript-eslint/prefer-optional-chain': 'off',
            '@typescript-eslint/prefer-readonly-parameter-types': 'off',
            '@typescript-eslint/strict-void-return': 'off',
            '@typescript-eslint/no-unnecessary-type-parameters': 1,
            '@typescript-eslint/ban-ts-comment': [
                'error',
                { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 5 },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '(^_)|(Fields$)',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/no-empty-object-type': 1,
            '@typescript-eslint/no-extraneous-class': [2, { allowWithDecorator: true }],
            '@typescript-eslint/naming-convention': [
                'error',
                { selector: 'enumMember', format: ['UPPER_CASE', 'PascalCase'] },
            ],
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    classes: [
                        'signature',
                        'public-static-field',
                        'protected-static-field',
                        'private-static-field',
                        'public-decorated-field',
                        'protected-decorated-field',
                        'private-decorated-field',
                        'public-instance-field',
                        'protected-instance-field',
                        'private-instance-field',
                        'public-abstract-field',
                        'protected-abstract-field',
                        'public-field',
                        'protected-field',
                        'private-field',
                        'static-field',
                        'instance-field',
                        'abstract-field',
                        'decorated-field',
                        'field',
                        'public-constructor',
                        'protected-constructor',
                        'private-constructor',
                        'constructor',
                        'public-static-get',
                        'protected-static-get',
                        'private-static-get',
                        'public-decorated-get',
                        'protected-decorated-get',
                        'private-decorated-get',
                        'public-instance-get',
                        'protected-instance-get',
                        'private-instance-get',
                        'public-abstract-get',
                        'protected-abstract-get',
                        'public-get',
                        'protected-get',
                        'private-get',
                        'static-get',
                        'instance-get',
                        'abstract-get',
                        'decorated-get',
                        'get',
                        'public-static-set',
                        'protected-static-set',
                        'private-static-set',
                        'public-decorated-set',
                        'protected-decorated-set',
                        'private-decorated-set',
                        'public-instance-set',
                        'protected-instance-set',
                        'private-instance-set',
                        'public-abstract-set',
                        'protected-abstract-set',
                        'public-set',
                        'protected-set',
                        'private-set',
                        'static-set',
                        'instance-set',
                        'abstract-set',
                        'decorated-set',
                        'set',
                        'public-decorated-method',
                        'protected-decorated-method',
                        'private-decorated-method',
                        'public-instance-method',
                        'protected-instance-method',
                        'private-instance-method',
                        'public-abstract-method',
                        'protected-abstract-method',
                        'public-method',
                        'protected-method',
                        'private-method',
                        'public-static-method',
                        'protected-static-method',
                        'private-static-method',
                        'static-method',
                        'instance-method',
                        'abstract-method',
                        'decorated-method',
                        'method',
                    ],
                },
            ],
        },
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    {
        files: ['**/*.ts'],
        extends: [rxjs.configs.recommended],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [importPlugin.flatConfigs.recommended],
        settings: {
            'import-x/extensions': importResolvableExtensions,
            'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
            'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx'] },
            'import-x/resolver-next': [createNodeResolver({ extensions: importResolvableExtensions })],
        },
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        rules: {
            'import-x/named': 'off',
            'import-x/namespace': 'off',
            'import-x/default': 'off',
            'import-x/no-named-as-default-member': 'off',
            'import-x/no-unresolved': 'off',
            'import-x/no-named-as-default': 'off',
            'import-x/no-cycle': 'off',
            'import-x/no-unused-modules': 'off',
            'import-x/no-deprecated': 'off',
            'import-x/extensions': 'off',
            'import-x/order': [
                'error',
                {
                    alphabetize: {
                        caseInsensitive: true,
                        order: 'asc',
                    },
                    groups: ['builtin', 'external', 'object', 'parent', 'sibling', 'index', 'type'],
                    'newlines-between': 'always',
                    pathGroups: [
                        {
                            group: 'external',
                            pattern: '@rnw-community/*',
                            position: 'after',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['builtin', 'type'],
                },
            ],
        },
    },
    {
        files: ['**/*.ts'],
        extends: [nodePlugin.configs['flat/recommended']],
        settings: {
            node: { version: '>=22.0.0' },
        },
        rules: {
            'n/no-missing-import': 'off',
            'n/no-unsupported-features/es-syntax': 'off',
            'n/no-extraneous-import': [
                'error',
                {
                    allowModules: ['@jest/globals'],
                },
            ],
        },
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [promisePlugin.configs['flat/recommended']],
    },
    {
        files: ['**/*.{ts,tsx}'],
        extends: [reactRecommended, reactHooksPlugin.configs.flat.recommended],
        settings: {
            react: { version: 'detect' },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/jsx-curly-newline': 'off',
            'react/display-name': 'off',
            'react/prop-types': 'off',
            'react/forbid-component-props': 'off',
            'react/function-component-definition': 'off',
            'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
            'react/require-default-props': 'off',
            'react/jsx-props-no-spreading': 'off',
            'react/jsx-max-depth': ['error', { max: 4 }],
            'react/jsx-no-literals': 'off',
            'react/jsx-no-bind': 'off',
            'react/jsx-no-constructed-context-values': 'off',
            'react/jsx-max-props-per-line': 'off',
            'react/jsx-newline': 'off',
            'react/jsx-one-expression-per-line': 'off',
            'react/jsx-indent': 'off',
            'react-native/no-raw-text': 'off',
            'react/jsx-child-element-spacing': 'off',
            'react/destructuring-assignment': 'off',
            'react/no-unknown-property': ['error', { ignore: ['popover', 'popoverTarget', 'popoverTargetAction'] }],
        },
    },
    {
        files: ['**/*.spec.ts'],
        extends: [jestPlugin.configs['flat/recommended']],
        rules: {
            'no-await-in-loop': 'off',

            'jest/require-hook': 'off',
            'jest/max-expects': 'off',
            'jest/unbound-method': 'off',
            'jest/expect-expect': 'off',
            'jest/no-done-callback': 'off',

            'no-undef': 'off',
            'no-undefined': 'off',
            'max-classes-per-file': 'off',
            'max-lines-per-function': 'off',
            'max-lines': 'off',
            'max-statements': 'off',
            'func-names': 'off',
            'promise/no-nesting': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/only-throw-error': 'off',
            '@typescript-eslint/no-invalid-void-type': 'off',
            'dot-notation': 'off',
            'require-unicode-regexp': 'off',
        },
    },
    {
        files: ['packages/*/src/**/*.{ts,tsx}'],
        plugins: { '@rnw-community': rnwPlugin },
        rules: { '@rnw-community/public-api-tsdoc': 'error' },
    }
);

const oxlintRulesLayer = oxlint.buildFromOxlintConfigFile(oxlintConfigPath);
const oxlintOwnedRules = new Set(oxlintRulesLayer.flatMap(config => Object.keys(config.rules ?? {})));
const unusedDirectiveRulePattern = /^Unused eslint-disable directive \(no problems were reported from (?<rules>.+)\)\.$/u;
const retainedDirectiveMessages = message => {
    const match = unusedDirectiveRulePattern.exec(message.message);
    const rules = [...(match?.groups?.rules ?? '').matchAll(/'([^']+)'/gu)].map(rule => rule[1]);
    if (message.ruleId !== null || rules.length === 0) {
        return [message];
    }
    const retainedRules = rules.filter(rule => !oxlintOwnedRules.has(rule));
    if (retainedRules.length === 0) {
        return [];
    }
    if (retainedRules.length === rules.length) {
        return [message];
    }
    const { fix, suggestions, ...retainedMessage } = message;
    return [
        {
            ...retainedMessage,
            message: `Unused eslint-disable directive (no problems were reported from ${retainedRules.map(rule => `'${rule}'`).join(' or ')}).`,
        },
    ];
};

export default [
    ...eslintConfigWithoutOxlint,
    ...oxlintRulesLayer,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'oxlint-handoff': {
                processors: {
                    'skip-unused-oxlint-directives': {
                        meta: { name: 'skip-unused-oxlint-directives' },
                        supportsAutofix: true,
                        preprocess: text => [text],
                        postprocess: messageLists => messageLists.flat().flatMap(retainedDirectiveMessages),
                    },
                },
            },
        },
        processor: 'oxlint-handoff/skip-unused-oxlint-directives',
    },
];
