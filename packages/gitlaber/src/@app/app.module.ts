import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { GitlabModule } from '../gitlab/gitlab.module';
import { ReviewModule } from '../review/review.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [ConfigModule.forRoot({ isGlobal: true }), GitlabModule, ReviewModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
