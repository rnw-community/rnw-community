import { isDefined } from '@rnw-community/shared';

import type { HmrModuleInterface } from './hmr-module.interface';
import type { INestApplication } from '@nestjs/common';

/**
 * Handle NestJS and webpack HMR.
 *
 * @param INestApplication app NestJS application
 * @param HmrModuleInterface webpackModule NestJS application
 */
export const handleNestJSWebpackHmr = (app: INestApplication, webpackModule: HmrModuleInterface): void => {
    if (isDefined(webpackModule.hot)) {
        webpackModule.hot.accept();
        webpackModule.hot.dispose(() => app.close());
    }
};
