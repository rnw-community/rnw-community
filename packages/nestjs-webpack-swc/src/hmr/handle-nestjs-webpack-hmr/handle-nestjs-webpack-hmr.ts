import { isDefined } from '@rnw-community/shared';

import type { HmrModuleInterface } from '../hmr-module.interface';
import type { INestApplication, INestMicroservice } from '@nestjs/common';

/**
 * Accepts webpack hot updates for the NestJS app and closes the app before the module is disposed, a no-op when HMR is disabled.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/nestjs-webpack-swc/readme.md#nestjs-hmr
 * @see https://docs.nestjs.com/recipes/hot-reload
 */
export const handleNestJSWebpackHmr = (
    app: INestApplication | INestMicroservice,
    webpackModule: HmrModuleInterface
): void => {
    if (isDefined(webpackModule.hot)) {
        webpackModule.hot.accept();
        webpackModule.hot.dispose(() => app.close());
    }
};
