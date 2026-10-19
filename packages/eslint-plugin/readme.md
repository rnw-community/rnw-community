# RNW ESLint plugin

Elevate your React/ReactNative projects with our [ESLint](https://eslint.org) plugin, meticulously crafted to ensure adherence to the best practices in the industry.

[![npm version](https://badge.fury.io/js/%40rnw-community%2Feslint-plugin.svg)](https://badge.fury.io/js/%40rnw-community%2Feslint-plugin)
[![coverage](https://img.shields.io/codecov/c/github/rnw-community/rnw-community?flag=eslint-plugin&label=coverage)](https://app.codecov.io/gh/rnw-community/rnw-community)
[![npm downloads](https://img.shields.io/npm/dm/%40rnw-community%2Feslint-plugin.svg)](https://www.npmjs.com/package/%40rnw-community%2Feslint-plugin)

## Notable Rule: no-complex-jsx-logic

Our plugin features the no-complex-jsx-logic rule, specifically designed to streamline JSX in your React components.
It ensures simplicity in JSX by restricting complex expressions, thus enhancing readability and maintainability.
For a comprehensive guide on this rule, see our [detailed documentation](https://github.com/rnw-community/rnw-community/blob/master/packages/eslint-plugin/src/rules/no-complex-jsx-logic/no-complex-jsx-logic.md).

## Rule: public-api-tsdoc

The `public-api-tsdoc` rule requires a one-sentence TSDoc block with `@see` links on every declaration reachable from a
package's entry points (`src/index.ts` plus the `types`/`exports` targets of its `package.json`), and forbids TSDoc
everywhere else. It needs type information, and it is not part of the `recommended` configs:

```js
import rnwcPlugin from '@rnw-community/eslint-plugin';

export default [
    {
        files: ['packages/*/src/**/*.{ts,tsx}'],
        ignores: ['**/*.spec.{ts,tsx}'],
        plugins: { '@rnw-community': rnwcPlugin },
        languageOptions: { parserOptions: { projectService: true } },
        rules: { '@rnw-community/public-api-tsdoc': 'error' },
    },
];
```

See the [rule documentation](https://github.com/rnw-community/rnw-community/blob/master/packages/eslint-plugin/src/rules/public-api-tsdoc/public-api-tsdoc.md)
for what counts as public and which tags are allowed.

## Installation

Incorporating our plugin into your project is straightforward. Follow these simple steps:

### Install via NPM: Run the following command in your project directory:
```sh
npm install @rnw-community/eslint-plugin --save-dev
```

### Configuration(legacy: .eslintrc*):
#### Custom rule configuration:
```json
{
  "plugins": [
    "@rnw-community"
  ],
  "rules": {
    "@rnw-community/no-complex-jsx-logic": "error"
  }
}
```

#### Extending "recommended":
```json
{
    "extends": [
        "plugin:@rnw-community/recommended"
    ]
}
```

### Configuration(new: eslint.config.js):

#### Custom rule configuration
```js
import rnwcPlugin from '@rnw-community/eslint-plugin';

module.exports = [
  {
      files: ['**/*.{js,jsx,ts,tsx}'],
      plugins: {
          rnwcPlugin,
      },
      rules: {
          "@rnw-community/no-complex-jsx-logic": "error"
      },
  }
];
```

#### Extending "recommended"
```js
import rnwcPlugin from '@rnw-community/eslint-plugin';

module.exports = [
  {
      files: ['**/*.{js,jsx,ts,tsx}'],
      extends: [rnwcPlugin.configs['flat/recommended']],
  }
];
```

## License

This library is licensed under The [MIT License](./LICENSE.md).
