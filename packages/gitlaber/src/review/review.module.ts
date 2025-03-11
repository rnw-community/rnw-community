import { Module } from '@nestjs/common';

import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';

@Module({
    providers: [ReviewService],
    controllers: [ReviewController],
    exports: [ReviewService],
})
export class ReviewModule {}
