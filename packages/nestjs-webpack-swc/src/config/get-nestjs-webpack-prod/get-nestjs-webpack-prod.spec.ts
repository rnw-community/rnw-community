import { describe, expect, it } from '@jest/globals';
import TerserPlugin from 'terser-webpack-plugin';

import { getNestJSWebpackProdConfig } from './get-nestjs-webpack-prod.config';

import type Webpack from 'webpack';

describe('getNestJSWebpackProdConfig', () => {
    it('produces a production config minimized by a class-name-preserving terser plugin', () => {
        expect.assertions(3);

        const config = getNestJSWebpackProdConfig({ target: 'node' }, {} as typeof Webpack);

        expect(config.mode).toBe('production');
        expect(config.optimization?.minimize).toBe(true);
        expect(config.optimization?.minimizer?.[0]).toBeInstanceOf(TerserPlugin);
    });
});
