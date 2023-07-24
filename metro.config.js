/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 *
 * TODO: This is a temporary workaround as this config should be inside the react-native-payments-example package
 * This solution is from here: https://docs.expo.dev/guides/monorepos/
 */
const path = require('path');

const { getDefaultConfig } = require('@react-native/metro-config');

// Find the project and workspace directories
const projectRoot = path.resolve('./packages/react-native-payments-example');
// This can be replaced with `find-yarn-workspace-root`
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, 'node_modules'), path.resolve(workspaceRoot, 'node_modules')];
// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
