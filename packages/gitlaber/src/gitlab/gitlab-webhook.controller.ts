import { Body, Controller, Headers, HttpException, HttpStatus, Logger, Post, Req } from '@nestjs/common';

import { Log } from '@rnw-community/nestjs-enterprise';
import { isDefined, isError } from '@rnw-community/shared';

import { ReviewService } from '../review/review.service';

import { GitlabService } from './gitlab.service';

import type { Request } from 'express';

// GitLab event types and merge request actions as constants
const GITLAB_EVENT_MERGE_REQUEST = 'Merge Request Hook';
const MERGE_REQUEST_ACTION_OPEN = 'open';
const MERGE_REQUEST_ACTION_REOPEN = 'reopen';
const MERGE_REQUEST_ACTION_UPDATE = 'update';

// Interface for webhook payload
interface WebhookPayload {
    object_attributes?: {
        action?: string;
        iid?: number;
    };
    object_kind: string;
    project?: {
        id?: number;
    };
}

@Controller('webhooks/gitlab')
export class GitlabWebhookController {
    private readonly logger = new Logger(GitlabWebhookController.name);

    constructor(
        private readonly gitlabService: GitlabService,
        private readonly reviewService: ReviewService
    ) {}

    @Post()
    async handleWebhook(
        @Headers('x-gitlab-token') token: string,
        @Headers('x-gitlab-event') eventType: string,
        @Body() payload: WebhookPayload,
        @Req() _request: Request
    ): Promise<{ message: string }> {
        if (!this.gitlabService.validateWebhookSignature(token, JSON.stringify(payload))) {
            throw new HttpException('Invalid webhook signature', HttpStatus.UNAUTHORIZED);
        }

        if (eventType === GITLAB_EVENT_MERGE_REQUEST) {
            await this.handleMergeRequestEvent(payload);
        }

        return { message: 'Webhook processed successfully' };
    }

    @Log(
        payload => `Processing merge request event with action: ${payload.object_attributes?.action}`,
        () => 'Merge request event processed successfully',
        (error, payload) =>
            `Error processing merge request event with action ${payload.object_attributes?.action}: ${isError(error) ? error.message : String(error)}`
    )
    private async handleMergeRequestEvent(payload: WebhookPayload): Promise<void> {
        const action = payload.object_attributes?.action;
        const projectId = payload.project?.id;
        const mergeRequestIid = payload.object_attributes?.iid;

        if (!isDefined(action) || !isDefined(projectId) || !isDefined(mergeRequestIid)) {
            this.logger.warn('Missing required fields in webhook payload');

            return;
        }

        if (
            action !== MERGE_REQUEST_ACTION_OPEN &&
            action !== MERGE_REQUEST_ACTION_REOPEN &&
            action !== MERGE_REQUEST_ACTION_UPDATE
        ) {
            this.logger.debug(`Ignoring merge request action: ${action}`);

            return;
        }

        const mrChanges = await this.gitlabService.getMergeRequest(projectId, mergeRequestIid);

        const review = await this.reviewService.reviewMergeRequest(mrChanges);

        await this.gitlabService.postMergeRequestComment(projectId, mergeRequestIid, review);
    }
}
