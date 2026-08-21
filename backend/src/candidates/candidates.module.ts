import { Module } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { CandidatesController } from './candidates.controller';
import { MediaService } from '../media/media.service';

@Module({
    controllers: [CandidatesController],
    providers: [CandidatesService, MediaService],
    exports: [CandidatesService],
})
export class CandidatesModule { }
