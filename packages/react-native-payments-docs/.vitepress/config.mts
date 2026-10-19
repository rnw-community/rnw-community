import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitepress';

import type { DefaultTheme } from 'vitepress';

const repoUrl = 'https://github.com/rnw-community/rnw-community';
const vitepressEntry = fileURLToPath(import.meta.resolve('vitepress'));
const repoDir = fileURLToPath(new URL('../../../', import.meta.url));
const packageDir = join(repoDir, 'packages/react-native-payments');
const docsDir = join(packageDir, 'docs');
const readmeFile = join(packageDir, 'readme.md');
const sectionOrder = ['getting-started', 'guides', 'platforms', 'api'];

const toPosix = (path: string): string => path.split(sep).join('/');
const isSitePage = (file: string): boolean =>
    file === readmeFile || (file.startsWith(docsDir + sep) && file.endsWith('.md'));

const resolveSiteHref = (href: string, sourceFile: string): string => {
    if (/^([a-z][a-z\d+.-]*:|#|\/)/iu.test(href)) {
        return href;
    }
    const [target, hash = ''] = href.split(/(?=#)/u);
    const targetFile = resolve(dirname(sourceFile), decodeURI(target));
    if (!existsSync(targetFile)) {
        throw new Error(`Dead link "${href}" in ${relative(repoDir, sourceFile)}`);
    }
    if (targetFile === readmeFile) {
        return `${toPosix(relative(dirname(sourceFile), join(packageDir, 'index.md')))}${hash}`;
    }

    return isSitePage(targetFile) ? href : `${repoUrl}/blob/master/${toPosix(relative(repoDir, targetFile))}${hash}`;
};

const pageTitle = (file: string): string =>
    (/^# (.+)$/mu.exec(readFileSync(file, 'utf8'))?.[1] ?? basename(file, '.md')).replaceAll('`', '');
const pageItem = (file: string): DefaultTheme.SidebarItem => ({
    text: pageTitle(file),
    link: `/${toPosix(relative(packageDir, file)).replace(/(index)?\.md$/u, '')}`,
});
const markdownFiles = (dir: string): string[] =>
    readdirSync(dir)
        .filter(name => name.endsWith('.md'))
        .sort((a, b) => Number(b === 'index.md') - Number(a === 'index.md') || a.localeCompare(b))
        .map(name => join(dir, name));
const sectionRank = (name: string): number => {
    const rank = sectionOrder.indexOf(name);

    return rank === -1 ? sectionOrder.length : rank;
};
const sectionTitle = (name: string): string => {
    const indexFile = join(docsDir, name, 'index.md');

    return existsSync(indexFile) ? pageTitle(indexFile) : `${name[0].toUpperCase()}${name.slice(1).replaceAll('-', ' ')}`;
};

const sidebar: DefaultTheme.SidebarItem[] = [
    { text: 'Overview', link: '/' },
    ...readdirSync(docsDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort((a, b) => sectionRank(a) - sectionRank(b) || a.localeCompare(b))
        .map(name => ({
            text: sectionTitle(name),
            collapsed: name === 'api',
            items: markdownFiles(join(docsDir, name)).map(pageItem),
        })),
    ...markdownFiles(docsDir).map(pageItem),
];

export default defineConfig({
    title: 'React Native Payments',
    description: 'Apple Pay and Google Pay for React Native through the W3C Payment Request API',
    base: '/rnw-community/',
    srcDir: '../react-native-payments',
    srcExclude: ['!(docs)/**/*', '!(readme).md'],
    rewrites: { 'readme.md': 'index.md' },
    cleanUrls: true,
    lastUpdated: true,
    sitemap: { hostname: 'https://rnw-community.github.io/rnw-community/' },
    vite: {
        plugins: [
            {
                name: 'resolve-vue-from-vitepress',
                enforce: 'pre',
                resolveId(id, _importer, options) {
                    return /^vue(\/|$)/u.test(id) ? this.resolve(id, vitepressEntry, { ...options, skipSelf: true }) : null;
                },
            },
        ],
    },
    markdown: {
        config: md => {
            md.core.ruler.push('github-markdown-compat', state => {
                const sourceFile: string = state.env.realPath ?? state.env.path;
                for (const token of state.tokens.flatMap(blockToken => blockToken.children ?? [])) {
                    const href = token.type === 'link_open' ? token.attrGet('href') : null;
                    if (href !== null) {
                        token.attrSet('href', resolveSiteHref(href, sourceFile));
                    }
                    if (token.type === 'code_inline') {
                        token.attrSet('v-pre', '');
                    }
                }
            });
        },
    },
    themeConfig: {
        sidebar,
        search: { provider: 'local' },
        outline: 'deep',
        socialLinks: [{ icon: 'github', link: repoUrl }],
        editLink: {
            pattern: ({ filePath }) =>
                `https://github.com/rnw-community/rnw-community/edit/master/packages/react-native-payments/${filePath}`,
            text: 'Edit this page on GitHub',
        },
    },
});
