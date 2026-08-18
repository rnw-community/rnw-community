import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

const targetDirs = process.argv.slice(2);

if (targetDirs.length === 0) {
    console.error('Usage: node assert-react-compiler-output.mjs <dist-dir> [...more-dist-dirs]');
    process.exit(1);
}

const collectJsFiles = dir =>
    readdirSync(dir).flatMap(entry => {
        const entryPath = join(dir, entry);
        if (statSync(entryPath).isDirectory()) {
            return collectJsFiles(entryPath);
        }

        return entryPath.endsWith('.js') ? [entryPath] : [];
    });

for (const targetDirArg of targetDirs) {
    const targetDir = resolve(process.cwd(), targetDirArg);
    const compiledCount = collectJsFiles(targetDir).filter(file =>
        readFileSync(file, 'utf8').includes('react-compiler-runtime')
    ).length;

    if (compiledCount === 0) {
        console.error(`assert-react-compiler-output: no React Compiler memoization found in ${targetDir}`);
        process.exit(1);
    }
    console.log(`assert-react-compiler-output: React Compiler memoized ${String(compiledCount)} file(s) in ${targetDir}`);
}
