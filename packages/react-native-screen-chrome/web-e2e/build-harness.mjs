import { transformAsync } from '@babel/core';
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const harnessDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(harnessDir, '..', 'node_modules', '.cache', 'web-e2e');

const sourceDir = join(harnessDir, '..', 'src');

const workletsPlugin = {
    name: 'worklets',
    setup(pluginBuild) {
        pluginBuild.onLoad({ filter: /\.tsx?$/ }, async ({ path }) => {
            const source = await readFile(path, 'utf8');

            if (!path.startsWith(sourceDir) && !path.startsWith(harnessDir)) {
                return void 0;
            }

            const result = await transformAsync(source, {
                filename: path,
                babelrc: false,
                configFile: false,
                parserOpts: { plugins: ['jsx', 'typescript'] },
                plugins: ['react-native-worklets/plugin'],
            });

            return { contents: result?.code ?? source, loader: path.endsWith('.tsx') ? 'tsx' : 'ts' };
        });
    },
};

await mkdir(outDir, { recursive: true });

await build({
    entryPoints: { harness: join(harnessDir, 'edge-fade-harness.tsx'), matrix: join(harnessDir, 'edge-fade-matrix.tsx') },
    outdir: outDir,
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    alias: { 'react-native': 'react-native-web', '@rnw-community/react-native-screen-chrome': join(sourceDir, 'index.ts') },
    resolveExtensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.mjs', '.js'],
    mainFields: ['browser', 'module', 'main'],
    define: {
        __DEV__: 'false',
        'process.env.NODE_ENV': '"production"',
        global: 'globalThis',
    },
    loader: { '.js': 'jsx' },
    plugins: [workletsPlugin],
    logLevel: 'warning',
});

const page = script =>
    `<!doctype html><html><head><meta charset="utf-8"><style>html,body,#root{height:100%;margin:0;display:flex;flex-direction:column}#root{flex:1}</style></head><body><div id="root"></div><script src="./${script}.js"></script></body></html>`;

await writeFile(join(outDir, 'index.html'), page('harness'));
await writeFile(join(outDir, 'matrix.html'), page('matrix'));
