import { join, sep } from 'node:path';

import ts from 'typescript';

import { isDefined } from '@rnw-community/shared';

import { resolveEntryFiles } from './resolve-entry-files';

import type { PackageManifestInterface } from './package-manifest.interface';
import type { PublicApiInterface } from './public-api.interface';

const publicApiCache = new WeakMap<ts.Program, Map<string, PublicApiInterface>>();

const resolveSymbol = (checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol =>
    // eslint-disable-next-line no-bitwise -- TypeScript exposes symbol kinds only as a bit field
    (symbol.flags & ts.SymbolFlags.Alias) === 0 ? symbol : checker.getAliasedSymbol(symbol);

const isOverloadImplementation = (declaration: ts.Declaration, declarationCount: number): boolean =>
    ts.isFunctionDeclaration(declaration) && isDefined(declaration.body) && declarationCount > 1;

const getReferenceTarget = (node: ts.Node): ts.Node | undefined => {
    if (ts.isTypeReferenceNode(node)) {
        return node.typeName;
    }
    if (ts.isTypeQueryNode(node)) {
        return node.exprName;
    }

    return ts.isExpressionWithTypeArguments(node) ? node.expression : void 0;
};

const getModuleSymbols = (program: ts.Program, entryFiles: readonly string[]): ts.Symbol[] => {
    const checker = program.getTypeChecker();

    return entryFiles.flatMap(entryFile => {
        const sourceFile = program.getSourceFile(entryFile);
        const moduleSymbol = isDefined(sourceFile) ? checker.getSymbolAtLocation(sourceFile) : void 0;

        if (!isDefined(moduleSymbol)) {
            return [];
        }

        const exportAssignment = moduleSymbol.exports?.get(ts.InternalSymbolName.ExportEquals);

        return [...(isDefined(exportAssignment) ? [exportAssignment] : []), ...checker.getExportsOfModule(moduleSymbol)];
    });
};

const collectReferenced = (
    checker: ts.TypeChecker,
    exported: ReadonlySet<ts.Node>,
    isInSource: (node: ts.Node) => boolean
): Set<ts.Node> => {
    const referenced = new Set<ts.Node>();
    const queue = [...exported];

    const visit = (node: ts.Node): void => {
        const referenceTarget = getReferenceTarget(node);
        const symbol = isDefined(referenceTarget) ? checker.getSymbolAtLocation(referenceTarget) : void 0;
        const declarations = isDefined(symbol) ? (resolveSymbol(checker, symbol).declarations ?? []) : [];

        for (const declaration of declarations) {
            if (isInSource(declaration) && !exported.has(declaration) && !referenced.has(declaration)) {
                referenced.add(declaration);
                queue.push(declaration);
            }
        }
        if (!ts.isBlock(node)) {
            ts.forEachChild(node, visit);
        }
    };

    for (let node = queue.pop(); isDefined(node); node = queue.pop()) {
        visit(node);
    }

    return referenced;
};

const getExportedDeclarations = (
    checker: ts.TypeChecker,
    moduleSymbols: readonly ts.Symbol[],
    isInSource: (node: ts.Node) => boolean
): (readonly [ts.Declaration, string])[] =>
    moduleSymbols.flatMap(exportedSymbol => {
        const symbol = resolveSymbol(checker, exportedSymbol);
        const symbolDeclarations = symbol.declarations ?? [];

        return symbolDeclarations
            .filter(
                declaration => isInSource(declaration) && !isOverloadImplementation(declaration, symbolDeclarations.length)
            )
            .map(declaration => [declaration, symbol.name] as const);
    });

const buildPublicApi = (program: ts.Program, packageDir: string, manifest: PackageManifestInterface): PublicApiInterface => {
    const checker = program.getTypeChecker();
    const sourceDir = `${join(packageDir, 'src')}${sep}`.split(sep).join('/');
    const isInSource = (node: ts.Node): boolean => node.getSourceFile().fileName.startsWith(sourceDir);
    const moduleSymbols = getModuleSymbols(program, resolveEntryFiles(packageDir, manifest));
    const exportedDeclarations = getExportedDeclarations(checker, moduleSymbols, isInSource);
    const exported = new Set<ts.Node>(exportedDeclarations.map(([declaration]) => declaration));
    const exportedNamesByFile = new Map<string, Set<string>>();

    for (const [declaration, name] of exportedDeclarations) {
        const { fileName } = declaration.getSourceFile();

        exportedNamesByFile.set(fileName, new Set([...(exportedNamesByFile.get(fileName) ?? []), name]));
    }

    return { exported, referenced: collectReferenced(checker, exported, isInSource), exportedNamesByFile };
};

export const collectPublicApi = (
    program: ts.Program,
    packageDir: string,
    manifest: PackageManifestInterface
): PublicApiInterface => {
    const programCache = publicApiCache.get(program) ?? new Map<string, PublicApiInterface>();
    const publicApi = programCache.get(packageDir) ?? buildPublicApi(program, packageDir, manifest);

    programCache.set(packageDir, publicApi);
    publicApiCache.set(program, programCache);

    return publicApi;
};
