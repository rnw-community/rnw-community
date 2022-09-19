import { isDefined } from '@rnw-community/shared';

import type { HmrModuleInterface } from './hmr-module.interface';
import type { INestApplication } from '@nestjs/common';

// eslint-disable-next-line init-declarations
declare const module: HmrModuleInterface;

/**
 * Handle NestJS and webpack HMR.
 *
 * @param INestApplication app NestJS application
 */
export const handleNestJSWebpackHmr = (app: INestApplication): void => {
    if (isDefined(module.hot)) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
};
