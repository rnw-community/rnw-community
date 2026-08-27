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
        const captured: { disposeCallback?: () => Promise<void> } = {};
        const dispose = jest.fn((callback: () => Promise<void>) => {
            captured.disposeCallback = callback;
        });
        const webpackModule: HmrModuleInterface = { hot: { accept, dispose } };

        handleNestJSWebpackHmr(app, webpackModule);

        expect(accept).toHaveBeenCalledTimes(1);
        expect(captured.disposeCallback).toBeDefined();

        void captured.disposeCallback?.();

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
