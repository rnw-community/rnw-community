const coreAlternatives = {
    '@typescript-eslint/consistent-return': 'consistent-return',
    '@typescript-eslint/dot-notation': 'dot-notation',
};

export const assertTypeAwareRuleCoverage = (rules, supportedRules) => {
    const missing = [...supportedRules].filter(name => !(name in rules) && !((coreAlternatives[name] ?? name) in rules));

    if (missing.length > 0) {
        throw new Error(`Type-aware rules need explicit policies in eslint.config.mjs: ${missing.join(', ')}`);
    }
};
