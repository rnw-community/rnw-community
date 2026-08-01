const lernaScopes = require('@commitlint/config-lerna-scopes');

const dependencyScopes = ['deps', 'deps-dev'];

module.exports = {
    extends: ['@commitlint/config-conventional', '@commitlint/config-lerna-scopes'],
    rules: {
        'scope-enum': async context => {
            const [level, applicable, packageScopes] = await lernaScopes.default.rules['scope-enum'](context);

            return [level, applicable, [...packageScopes, ...dependencyScopes]];
        },
    },
};
