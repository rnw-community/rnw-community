// Jest transform shared by every package without its own babel config. None of them contain JSX or
// execute React Native's Flow-typed internals — the react-native-facing packages either import
// types only or mock the module — so a plain TypeScript transform is enough, and the React Native
// packages that do parse those internals (platform, react-native-collapsible-header) declare
// `module:@react-native/babel-preset` themselves.
//
// `setPublicClassFields` keeps class fields on assignment semantics instead of the spec's
// `Object.defineProperty`. The repository's `experimentalDecorators` decorators are applied to
// fields as well as methods, and under define semantics a decorated field initializer loses its
// `this`, which surfaces as "Cannot read properties of undefined" inside the decorated body.
module.exports = {
    assumptions: { setPublicClassFields: true },
    presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-typescript'],
    plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
};
