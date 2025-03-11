import { Body, Controller, Logger, Post } from '@nestjs/common';

import { Log } from '@rnw-community/nestjs-enterprise';

import { GitlabService } from '../gitlab/gitlab.service';

import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
    private readonly logger = new Logger(ReviewController.name);

    constructor(
        private readonly reviews: ReviewService,
        private readonly gitlab: GitlabService
    ) {}

    @Post('merge-request')
    @Log(
        dto => `Manual review requested for MR !${dto?.mergeRequestIid} in project ${dto?.projectId}`,
        (_result, dto) =>
            dto?.postComment
                ? `Posted review for MR !${dto.mergeRequestIid} in project ${dto.projectId}`
                : `Generated review for MR !${dto.mergeRequestIid} in project ${dto.projectId} (not posted)`,
        (error, dto) =>
            `Error reviewing MR !${dto?.mergeRequestIid} in project ${dto?.projectId}: ${error instanceof Error ? error.message : String(error)}`
    )
    async reviewMergeRequest(@Body() dto: ReviewMergeRequestDto): Promise<ReviewResponse> {
        const mrChanges = await this.gitlab.getMergeRequestChanges(dto.projectId, dto.mergeRequestIid);

        const review = await this.reviews.reviewMergeRequest(mrChanges);

        if (dto.postComment) {
            await this.gitlab.postMergeRequestComment(dto.projectId, dto.mergeRequestIid, review);

            this.logger.log(`Successfully posted review for MR !${dto.mergeRequestIid}`);

            return { message: 'Review posted successfully', reviewPosted: true };
        }

        return {
            message: 'Review generated successfully',
            review,
            reviewPosted: false,
        };
    }
}
