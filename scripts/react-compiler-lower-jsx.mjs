import { existsSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, relative, resolve } from 'node:path';
import process from 'node:process';

const [, , targetDirArg, moduleModeArg] = process.argv;

if (targetDirArg === undefined || !['esm', 'cjs'].includes(moduleModeArg)) {
    console.error('Usage: node react-compiler-lower-jsx.mjs <dist-dir> <esm|cjs>');
    process.exit(1);
}

const targetDir = resolve(process.cwd(), targetDirArg);
const esmMirrorDir = resolve(targetDir, '../esm');
const requireFromPackage = createRequire(join(process.cwd(), 'package.json'));
const babel = requireFromPackage('@babel/core');
const reactCompilerPlugin = requireFromPackage.resolve('babel-plugin-react-compiler');
const jsxTransformPlugin = requireFromPackage.resolve('@babel/plugin-transform-react-jsx');
const commonjsTransformPlugin = requireFromPackage.resolve('@babel/plugin-transform-modules-commonjs');

const collectJsxFiles = dir =>
    readdirSync(dir).flatMap(entry => {
        const entryPath = join(dir, entry);
        if (statSync(entryPath).isDirectory()) {
            return collectJsxFiles(entryPath);
        }

        return entryPath.endsWith('.jsx') ? [entryPath] : [];
    });

const transformOrExit = (source, filename, plugins) => {
    const result = babel.transformSync(source, {
        babelrc: false,
        configFile: false,
        filename,
        sourceType: 'module',
        parserOpts: { plugins: ['jsx'] },
        plugins,
    });

    if (typeof result?.code !== 'string') {
        console.error(`react-compiler-lower-jsx: no output produced for ${filename}`);
        process.exit(1);
    }

    return result.code;
};

const jsxFiles = collectJsxFiles(targetDir);

if (jsxFiles.length === 0) {
    console.error(`react-compiler-lower-jsx: no .jsx files found in ${targetDir} - is "jsx": "preserve" configured?`);
    process.exit(1);
}

let compiledCount = 0;

for (const jsxFile of jsxFiles) {
    let code = '';
    if (moduleModeArg === 'esm') {
        code = transformOrExit(readFileSync(jsxFile, 'utf8'), jsxFile, [
            [reactCompilerPlugin, { panicThreshold: 'all_errors', target: '18' }],
            [jsxTransformPlugin, { runtime: 'automatic' }],
        ]);
    } else {
        const esmMirrorFile = join(esmMirrorDir, relative(targetDir, jsxFile)).replace(/\.jsx$/u, '.js');
        if (!existsSync(esmMirrorFile)) {
            console.error(`react-compiler-lower-jsx: missing compiled ESM mirror ${esmMirrorFile} - run the esm pass first`);
            process.exit(1);
        }
        code = transformOrExit(readFileSync(esmMirrorFile, 'utf8'), esmMirrorFile, [commonjsTransformPlugin]);
    }

    if (code.includes('react-compiler-runtime')) {
        compiledCount += 1;
    }
    writeFileSync(jsxFile.replace(/\.jsx$/u, '.js'), code);
    unlinkSync(jsxFile);
}

if (compiledCount < jsxFiles.length) {
    console.error(
        `react-compiler-lower-jsx: React Compiler memoized only ${String(compiledCount)} of ${String(jsxFiles.length)} component file(s) in ${targetDir}`
    );
    process.exit(1);
}

console.log(
    `react-compiler-lower-jsx: lowered ${String(jsxFiles.length)} file(s), React Compiler memoized ${String(compiledCount)} in ${targetDir}`
);
