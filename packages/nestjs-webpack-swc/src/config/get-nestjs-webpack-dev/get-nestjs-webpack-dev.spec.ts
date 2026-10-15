import { describe, expect, it, jest } from '@jest/globals';
import { RunScriptWebpackPlugin } from 'run-script-webpack-plugin';

import { getNestJSWebpackDevConfig } from './get-nestjs-webpack-dev.config';

import type Webpack from 'webpack';

const webpackMock = {
    HotModuleReplacementPlugin: jest.fn(() => ({ hmrPlugin: true })),
    WatchIgnorePlugin: jest.fn((options: { paths: RegExp[] }) => ({ watchIgnorePlugin: options })),
} as unknown as typeof Webpack;

describe('getNestJSWebpackDevConfig', () => {
    it('prepends the webpack hot poll entry and appends HMR, watch-ignore and run-script plugins', () => {
        expect.assertions(3);

        const existingPlugin = { apply: () => void 0 };
        const config = getNestJSWebpackDevConfig(
            { entry: 'src/main.ts', plugins: [existingPlugin], output: { filename: 'main.js' } },
            webpackMock
        );

        expect(config.entry).toStrictEqual(['webpack/hot/poll?100', 'src/main.ts']);
        expect(config.plugins).toHaveLength(4);
        expect(config.plugins?.[3]).toBeInstanceOf(RunScriptWebpackPlugin);
    });

    it('builds the dev plugin set from scratch when the passed options carry no plugins', () => {
        expect.assertions(2);

        const config = getNestJSWebpackDevConfig({ entry: 'src/main.ts', output: { filename: 'main.js' } }, webpackMock);

        expect(config.plugins).toHaveLength(3);
        expect(config.plugins?.[2]).toBeInstanceOf(RunScriptWebpackPlugin);
    });

    it('spreads an array entry after the hot poll entry instead of nesting it', () => {
        expect.assertions(1);

        const config = getNestJSWebpackDevConfig(
            { entry: ['src/polyfills.ts', 'src/main.ts'], output: { filename: 'main.js' } },
            webpackMock
        );

        expect(config.entry).toStrictEqual(['webpack/hot/poll?100', 'src/polyfills.ts', 'src/main.ts']);
    });

    it('rejects entries the hot poll cannot be prepended to', () => {
        expect.assertions(1);

        expect(() => getNestJSWebpackDevConfig({ entry: { main: 'src/main.ts' } }, webpackMock)).toThrow(TypeError);
    });
});
