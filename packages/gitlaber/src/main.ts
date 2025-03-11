import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './@app/app.module';

// @ts-expect-error TODO: Add env types
const port = process.env.PORT ?? 3000;

const bootstrap = async (): Promise<void> => {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api');

    await app.listen(port);

    logger.log(`GitLaber AI Review Service is running on port ${port}`);
};

void bootstrap();
