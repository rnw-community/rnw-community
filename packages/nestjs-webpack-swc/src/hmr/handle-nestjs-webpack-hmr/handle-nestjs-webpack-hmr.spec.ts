import { describe, expect, it, jest } from '@jest/globals';

import { handleNestJSWebpackHmr } from './handle-nestjs-webpack-hmr';

import type { HmrModuleInterface } from '../hmr-module.interface';
import type { INestApplication } from '@nestjs/common';

describe('handleNestJSWebpackHmr', () => {
    it('accepts hot updates and closes the app on dispose when webpack HMR is available', () => {
        expect.assertions(3);

        const close = jest.fn(() => Promise.resolve());
        const app = { close } as unknown as INestApplication;
        const accept = jest.fn();
        const dispose = jest.fn();
        const webpackModule: HmrModuleInterface = { hot: { accept, dispose } };

        handleNestJSWebpackHmr(app, webpackModule);

        expect(accept).toHaveBeenCalledTimes(1);
        expect(dispose).toHaveBeenCalledTimes(1);

        const disposeCallback = dispose.mock.calls[0][0] as () => Promise<void>;
        void disposeCallback();

        expect(close).toHaveBeenCalledTimes(1);
    });

    it('registers nothing when the module carries no hot-reloading handle', () => {
        expect.assertions(1);

        const close = jest.fn(() => Promise.resolve());
        const app = { close } as unknown as INestApplication;

        handleNestJSWebpackHmr(app, {});

        expect(close).not.toHaveBeenCalled();
    });
});
