import { Gitlab } from '@gitbeaker/rest';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Log } from '@rnw-community/nestjs-enterprise';
import { getErrorMessage } from '@rnw-community/shared';

import type { Gitlab as COREGitlab } from '@gitbeaker/core';
import type { ExpandedMergeRequestSchema, MergeRequestNoteSchema } from '@gitbeaker/rest';

@Injectable()
export class GitlabService {
    private readonly api: COREGitlab;

    constructor(readonly configs: ConfigService) {
        this.api = new Gitlab({
            host: this.configs.get<string>('GITLAB_API_URL') ?? '',
            token: this.configs.get<string>('GITLAB_API_TOKEN') ?? '',
        });
    }

    @Log(
        signature => `Validating webhook signature "${signature}"`,
        result => `Webhook signature validation result: ${result ? 'valid' : 'invalid'}`,
        error => `Error validating webhook signature: ${getErrorMessage(error)}`
    )
    validateWebhookSignature(_signature: string, _body: string): boolean {
        // TODO: Implement webhook signature validation
        const webhookToken = this.configs.get<string>('GITLAB_WEBHOOK_TOKEN');

        return _signature === webhookToken;
    }

    @Log(
        (projectId, mrIid) => `Getting merge request #${mrIid} for project ${projectId}`,
        (_, projectId, mrIid) => `Retrieved merge request #${mrIid} for project ${projectId}`,
        (error, projectId, mrIid) =>
            `Error getting merge request #${mrIid} for project ${projectId}: ${getErrorMessage(error)}`
    )
    async getMergeRequest(projectId: number, mergeRequestIid: number): Promise<ExpandedMergeRequestSchema> {
        return this.api.MergeRequests.show(projectId, mergeRequestIid);
    }

    @Log(
        (projectId, mrIid) => `Posting comment to merge request #${mrIid} in project ${projectId}`,
        (_, projectId, mrIid) => `Posted comment to merge request #${mrIid} in project ${projectId}`,
        (error, projectId, mrIid) =>
            `Error posting comment to merge request #${mrIid} in project ${projectId}: ${getErrorMessage(error)}`
    )
    async postMergeRequestComment(
        projectId: number,
        mergeRequestIid: number,
        comment: string
    ): Promise<MergeRequestNoteSchema> {
        return this.api.MergeRequestNotes.create(projectId, mergeRequestIid, comment);
    }
}
