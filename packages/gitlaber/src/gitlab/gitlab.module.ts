import { Module } from '@nestjs/common';

import { GitlabWebhookController } from './gitlab-webhook.controller';
import { GitlabService } from './gitlab.service';

@Module({
    providers: [GitlabService],
    controllers: [GitlabWebhookController],
    exports: [GitlabService],
})
export class GitlabModule {}
