import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { afterAll, describe, expect, it } from '@jest/globals';
import { RuleTester } from '@typescript-eslint/rule-tester';
import ts from 'typescript';

import { collectPublicApi } from './collect-public-api';
import { publicApiTsDocRule } from './public-api-tsdoc.rule';

const fixtureRoot = mkdtempSync(join(tmpdir(), 'public-api-tsdoc-'));

const tsconfig = (module: string, exclude: readonly string[] = []): string =>
    JSON.stringify({
        compilerOptions: {
            strict: true,
            target: 'ES2021',
            module,
            moduleResolution: module === 'Node16' ? 'Node16' : 'Bundler',
            experimentalDecorators: true,
            skipLibCheck: true,
            noEmit: true,
            lib: ['es2021'],
            types: [],
        },
        include: ['src', 'outside.ts'],
        exclude,
    });

const doc = (sentence: string, ...tags: string[]): string =>
    ['/**', ` * ${sentence}`, ...(tags.length > 0 ? [' *', ...tags.map(tag => ` * ${tag}`)] : []), ' */'].join('\n');

const see = '@see https://example.com/docs';

const fixtureFiles: Record<string, string> = {
    'pkg/package.json': JSON.stringify({
        name: 'fixture-pkg',
        types: 'dist/esm/index.d.ts',
        exports: {
            '.': { types: './dist/esm/index.d.ts', default: './dist/esm/index.js' },
            './sub': { types: './dist/typescript/module/sub/sub.d.ts' },
            './script': { types: './dist/esm/script.d.ts' },
            './excluded': { types: './dist/esm/excluded.d.ts' },
            './missing': { types: './dist/esm/missing.d.ts' },
            './package.json': './package.json',
            './flag': true,
        },
    }),
    'pkg/tsconfig.json': tsconfig('ESNext', ['src/excluded.ts']),
    'pkg/outside.ts': 'export const outside = 1;\n',
    'pkg/src/index.ts': [
        "export { AbstractService, ChildClass, ClassFactory, DecoratedClass, exportedConst, overloaded, PublicEnum, referencedQuery } from './public';",
        "export type { BrokenReference, GlobalShape, PublicInterface, PublicType } from './public';",
        "export { forbiddenTags, InvalidClass, lineCommented, missingDoc, missingSee, plainCommented } from './invalid';",
        "export type { InvalidInterface } from './invalid';",
        "export { platformValue } from './platform';",
        "export { default as defaultFn } from './default-export';",
        "export { outside } from '../outside';",
        "export { nothing } from './does-not-exist';",
        doc('A constant declared in the entry point.', see),
        'export const directExport = 1;',
        '',
    ].join('\n'),
    'pkg/src/referenced.ts': [
        doc('A shape referenced from the public API.'),
        'export interface ReferencedShape {',
        `    ${doc('The identifier.').split('\n').join('\n    ')}`,
        '    readonly id: number;',
        '}',
        '',
        doc('A class referenced from the public API.'),
        'export class ReferencedClass {',
        `    ${doc('A field of a referenced class.').split('\n').join('\n    ')}`,
        '    readonly field = 1;',
        '',
        `    ${doc('A method of a referenced class.').split('\n').join('\n    ')}`,
        '    run(): void {',
        '        void this.field;',
        '    }',
        '}',
        '',
    ].join('\n'),
    'pkg/src/public.ts': [
        "import { ReferencedClass } from './referenced';",
        '',
        "import type { ReferencedShape } from './referenced';",
        '',
        'const sealed = (): ClassDecorator => () => void 0;',
        'const logged = (): MethodDecorator => () => void 0;',
        '',
        doc('A value only reachable through a type query.'),
        'const referencedValue = { kind: 1 };',
        '',
        doc('An exported constant.', see),
        '// eslint-disable-next-line no-magic-numbers',
        'export const exportedConst = 1;',
        '',
        doc('A constant typed through a type query.', see),
        'export const referencedQuery: typeof referencedValue = referencedValue;',
        '',
        doc('A type referencing an unresolved name.', see),
        'export type BrokenReference = MissingType;',
        '',
        doc('A type referencing a symbol without declarations.', see),
        'export type GlobalShape = typeof globalThis;',
        '',
        doc('Overload accepting a string.', see),
        'export function overloaded(value: string): string;',
        doc('Overload accepting a number.', see),
        'export function overloaded(value: number): number;',
        'export function overloaded(value: number | string): number | string {',
        '    const internal: ReferencedShape | undefined = void 0;',
        '',
        '    return internal ?? value;',
        '}',
        '',
        doc('A decorated exported class.', see),
        '@sealed()',
        'export class DecoratedClass {',
        `    ${doc('A documented public field.').split('\n').join('\n    ')}`,
        '    readonly field = 1;',
        '    readonly undocumentedField = 2;',
        '    protected readonly hidden = 3;',
        '    #secret = 4;',
        '',
        '    constructor(private readonly value: number) {}',
        '',
        `    ${doc('The current value.', see).split('\n').join('\n    ')}`,
        '    get current(): number {',
        '        return this.value + this.#secret;',
        '    }',
        '',
        '    set current(next: number) {',
        '        void next;',
        '    }',
        '',
        `    ${doc('A decorated method.', see).split('\n').join('\n    ')}`,
        '    @logged()',
        '    run(): ReferencedShape {',
        '        return { id: this.hidden };',
        '    }',
        '',
        `    ${doc('Formats a value.', see).split('\n').join('\n    ')}`,
        '    format(value: string): string;',
        '    format(value: string): string {',
        '        return value;',
        '    }',
        '',
        `    ${doc('A method with a string-literal name.', see).split('\n').join('\n    ')}`,
        "    'quoted-name'(): void {",
        '        void this.field;',
        '    }',
        '',
        '    protected internal(): void {',
        '        void this.field;',
        '    }',
        '}',
        '',
        doc('A class extending a referenced class.', see),
        'export class ChildClass extends ReferencedClass {}',
        '',
        doc('A class expression assigned to an exported constant.', see),
        'export const ClassFactory = class {',
        '    run(): void {',
        '        void this;',
        '    }',
        '};',
        '',
        doc('An exported abstract class.', see),
        'export abstract class AbstractService {',
        `    ${doc('The service name.').split('\n').join('\n    ')}`,
        '    abstract readonly name: string;',
        '',
        `    ${doc('Executes the service.', see).split('\n').join('\n    ')}`,
        '    abstract execute(): Promise<void>;',
        '}',
        '',
        doc('An exported interface.', see),
        'export interface PublicInterface {',
        `    ${doc('A member with a default.', '@defaultValue `1`').split('\n').join('\n    ')}`,
        '    readonly count?: number;',
        '    readonly [key: string]: unknown;',
        `    ${doc('Runs the interface.').split('\n').join('\n    ')}`,
        '    run(): PublicType;',
        '}',
        '',
        doc('An exported type alias.', see),
        'export type PublicType = { readonly shape: ReferencedShape; readonly again: ReferencedShape };',
        '',
        doc('An exported enum.', see),
        'export enum PublicEnum {',
        `    ${doc('The first member.').split('\n').join('\n    ')}`,
        "    First = 'first',",
        '}',
        '',
        'export const exportedButNotPublic = 1;',
        '',
    ].join('\n'),
    'pkg/src/invalid.ts': [
        'export const missingDoc = 1;',
        '',
        doc('A constant without a see tag.'),
        'export const missingSee = 2;',
        '',
        doc('A constant with forbidden tags.', '@example usage', see),
        'export const forbiddenTags = 3;',
        '',
        doc('A constant that is not re-exported.'),
        'export const notReexported = 4;',
        '',
        '// a plain line comment',
        'export const lineCommented = 5;',
        '',
        '/* a plain block comment */',
        'export const plainCommented = 6;',
        '',
        doc('An exported class.', see),
        'export class InvalidClass {',
        '    run(): void {',
        '        void this;',
        '    }',
        '',
        "    'quoted-name'(): void {",
        '        void this;',
        '    }',
        '',
        `    ${doc('A private method.').split('\n').join('\n    ')}`,
        '    private hidden(): void {',
        '        void this;',
        '    }',
        '}',
        '',
        doc('An exported interface.', see),
        'export interface InvalidInterface {',
        `    ${doc('A member with a forbidden tag.', '@example usage').split('\n').join('\n    ')}`,
        '    readonly member: string;',
        '}',
        '',
        'interface InternalShape {',
        `    ${doc('An internal member.').split('\n').join('\n    ')}`,
        '    readonly member: string;',
        '}',
        '',
        `void ({} as { ${doc('An orphan member.').split('\n').join(' ')} readonly member: InternalShape });`,
        '',
    ].join('\n'),
    'pkg/src/platform.ts': [doc('The platform value.', see), "export const platformValue = 'native';", ''].join('\n'),
    'pkg/src/platform.web.ts': [doc('The platform value.', see), "export const platformValue = 'web';", ''].join('\n'),
    'pkg/src/platform.ios.ts': [
        doc('A value missing from the base file.', see),
        "export const otherValue = 'ios';",
        '',
    ].join('\n'),
    'pkg/src/other.web.ts': [doc('A variant without a public base file.', see), 'export const otherWeb = 1;', ''].join('\n'),
    'pkg/src/default-export.ts': 'export default function (): void {}\n',
    'pkg/src/sub/sub.ts': [doc('A subpath entry point export.', see), 'export const subEntry = 1;', ''].join('\n'),
    'pkg/src/script.ts': 'const scriptValue = 1;\n',
    'pkg/src/excluded.ts': 'export const excluded = 1;\n',
    'cjs-pkg/package.json': JSON.stringify({ name: 'fixture-cjs', types: 'dist/main.d.ts' }),
    'cjs-pkg/tsconfig.json': tsconfig('Node16'),
    'cjs-pkg/src/main.ts': [
        doc('The plugin object.', see),
        "const plugin = { name: 'plugin' };",
        '',
        'export = plugin;',
        '',
    ].join('\n'),
    'private-pkg/package.json': JSON.stringify({ name: 'fixture-private', private: true }),
    'private-pkg/tsconfig.json': tsconfig('ESNext'),
    'private-pkg/src/index.ts': [doc('A private package export.', see), 'export const privateValue = 1;', ''].join('\n'),
    'no-pkg/tsconfig.json': tsconfig('ESNext'),
    'no-pkg/src/index.ts': [doc('A file outside of any package.', see), 'export const loose = 1;', ''].join('\n'),
};

for (const [relativePath, content] of Object.entries(fixtureFiles)) {
    const filePath = join(fixtureRoot, relativePath);

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
}

afterAll(() => {
    rmSync(fixtureRoot, { recursive: true, force: true });
});

const fixture = (relativePath: string): { code: string; filename: string; languageOptions: object } => {
    const [packageName, ...packagePath] = relativePath.split('/');

    return {
        code: fixtureFiles[relativePath],
        filename: packagePath.join('/'),
        languageOptions: {
            parserOptions: { project: './tsconfig.json', tsconfigRootDir: join(fixtureRoot, packageName) },
        },
    };
};

const ruleTester = new RuleTester({ linterOptions: { reportUnusedDisableDirectives: 'off' } });

ruleTester.run('public-api-tsdoc', publicApiTsDocRule, {
    valid: [
        fixture('pkg/src/index.ts'),
        fixture('pkg/src/public.ts'),
        fixture('pkg/src/referenced.ts'),
        fixture('pkg/src/platform.ts'),
        fixture('pkg/src/platform.web.ts'),
        fixture('pkg/src/sub/sub.ts'),
        fixture('pkg/src/script.ts'),
        fixture('cjs-pkg/src/main.ts'),
    ],
    invalid: [
        {
            ...fixture('pkg/src/invalid.ts'),
            errors: [
                { messageId: 'missingTsDoc', data: { name: 'missingDoc' } },
                { messageId: 'missingSeeTag' },
                { messageId: 'forbiddenTag', data: { tag: 'example', allowed: 'see' } },
                { messageId: 'tsDocOutsidePublicApi' },
                { messageId: 'missingTsDoc', data: { name: 'lineCommented' } },
                { messageId: 'missingTsDoc', data: { name: 'plainCommented' } },
                { messageId: 'missingTsDoc', data: { name: 'run' } },
                { messageId: 'missingTsDoc', data: { name: "'quoted-name'" } },
                { messageId: 'tsDocOutsidePublicApi' },
                { messageId: 'forbiddenTag', data: { tag: 'example', allowed: 'defaultValue, see' } },
                { messageId: 'tsDocOutsidePublicApi' },
                { messageId: 'tsDocOutsidePublicApi' },
            ],
        },
        {
            ...fixture('pkg/src/default-export.ts'),
            errors: [{ messageId: 'missingTsDoc', data: { name: 'default' } }],
        },
        { ...fixture('pkg/src/platform.ios.ts'), errors: [{ messageId: 'tsDocOutsidePublicApi' }] },
        { ...fixture('pkg/src/other.web.ts'), errors: [{ messageId: 'tsDocOutsidePublicApi' }] },
        { ...fixture('private-pkg/src/index.ts'), errors: [{ messageId: 'tsDocOutsidePublicApi' }] },
        { ...fixture('no-pkg/src/index.ts'), errors: [{ messageId: 'tsDocOutsidePublicApi' }] },
    ],
});

describe('public-api-tsdoc', () => {
    it('links its documentation to the rule page in the repository', () => {
        expect.hasAssertions();

        expect(publicApiTsDocRule.meta.docs?.url).toBe(
            'https://github.com/rnw-community/rnw-community/blob/master/packages/eslint-plugin/src/rules/public-api-tsdoc/public-api-tsdoc.md'
        );
    });

    it('reuses the collected public API for the same program and package', () => {
        expect.hasAssertions();

        const packageDir = join(fixtureRoot, 'pkg');
        const program = ts.createProgram([join(packageDir, 'src/index.ts')], { noEmit: true });
        const manifest = { types: 'dist/esm/index.d.ts' };

        expect(collectPublicApi(program, packageDir, manifest)).toBe(collectPublicApi(program, packageDir, manifest));
    });
});
