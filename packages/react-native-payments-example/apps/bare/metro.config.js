const path = require('path');

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '../..');
const monorepoRoot = path.resolve(projectRoot, '../../../..');

module.exports = mergeConfig(getDefaultConfig(projectRoot), {
    watchFolders: [monorepoRoot],
    resolver: {
        nodeModulesPaths: [
            path.resolve(projectRoot, 'node_modules'),
            path.resolve(packageRoot, 'node_modules'),
            path.resolve(monorepoRoot, 'node_modules'),
        ],
        unstable_enableSymlinks: true,
        resolveRequest: (context, moduleName, platform) => {
            try {
                return context.resolveRequest(context, moduleName, platform);
            } catch (error) {
                if (moduleName.startsWith('.') && /\.m?js$/.test(moduleName)) {
                    return context.resolveRequest(context, moduleName.replace(/\.m?js$/, ''), platform);
                }

                throw error;
            }
        },
    },
});
