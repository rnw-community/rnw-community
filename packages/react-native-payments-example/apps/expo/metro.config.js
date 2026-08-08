const path = require('path');

const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const packageRoot = path.resolve(projectRoot, '../..');
const monorepoRoot = path.resolve(projectRoot, '../../../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(packageRoot, 'node_modules'),
    path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.resolveRequest = (context, moduleName, platform) => {
    try {
        return context.resolveRequest(context, moduleName, platform);
    } catch (error) {
        if (moduleName.startsWith('.') && /\.m?js$/.test(moduleName)) {
            return context.resolveRequest(context, moduleName.replace(/\.m?js$/, ''), platform);
        }

        throw error;
    }
};

module.exports = config;
