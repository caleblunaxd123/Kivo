// Learn more: https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot];

// 2. Force Metro to resolve packages from these paths in order:
//    - workspace node_modules first (local installs like expo-audio)
//    - monorepo root node_modules second (hoisted packages)
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// 3. Map workspace packages so Metro los resuelve directamente desde su carpeta
config.resolver.extraNodeModules = {
  '@vozpe/shared': path.resolve(monorepoRoot, 'packages/shared'),
};

module.exports = config;
