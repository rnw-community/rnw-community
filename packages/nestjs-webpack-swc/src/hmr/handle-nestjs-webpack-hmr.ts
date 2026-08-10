import { isDefined } from '@rnw-community/shared';

import type { HmrModuleInterface } from './hmr-module.interface';
import type { INestApplication, INestMicroservice } from '@nestjs/common';

/**
 * Handle NestJS and webpack HMR.
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
