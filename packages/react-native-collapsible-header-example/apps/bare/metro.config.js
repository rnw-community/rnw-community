const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '../..');
const monorepoRoot = path.resolve(projectRoot, '../../../..');
const libraryRoot = path.resolve(monorepoRoot, 'packages/react-native-collapsible-header');

// Yarn duplicates peer-dependent packages per consumer instead of hoisting one copy, so the
// monorepo root, this example package, and the library each carry their own react-native,
// reanimated, and worklets. Two instances of any of them in one bundle break at runtime: two
// Reanimated instances throw "[Worklets] Tried to synchronously call a Remote Function. Called
// 'value' on the UI Runtime" when a shared value crosses them, and two react-native instances
// register their callable modules separately, so the native side reports "HMRClient has not been
// registered as callable".
//
// `pod install` resolved the native side from this example package's copies (ios/Podfile.lock
// records ":path: ../../../node_modules/react-native/"), so that copy is the canonical one here:
// the JS the bundle loads has to be the JS its native code was built against. Every other copy is
// blocked and redirected to it.
const dedupedModules = ['react-native', 'react-native-reanimated', 'react-native-worklets'];
const shadowingRoots = [libraryRoot, monorepoRoot];
const escapeForRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');

const defaultConfig = getDefaultConfig(projectRoot);
const shadowedPatterns = shadowingRoots.flatMap(root =>
    dedupedModules.map(name => `^${escapeForRegExp(path.join(root, 'node_modules', name))}\\/.*$`)
);

module.exports = mergeConfig(defaultConfig, {
    watchFolders: [monorepoRoot],
    resolver: {
        nodeModulesPaths: [
            path.resolve(projectRoot, 'node_modules'),
            path.resolve(packageRoot, 'node_modules'),
            path.resolve(monorepoRoot, 'node_modules'),
        ],
        unstable_enableSymlinks: true,
        blockList: new RegExp(
            [defaultConfig.resolver.blockList?.source, ...shadowedPatterns].filter(Boolean).join('|'),
            'u'
        ),
        extraNodeModules: Object.fromEntries(
            dedupedModules.map(name => [name, path.join(packageRoot, 'node_modules', name)])
        ),
    },
});
