import { Module } from '@nestjs/common';
import { PipelineController } from './pipeline.controller';
import { UserPipelineController } from './user-pipeline.controller';
import { PipelineService } from './pipeline.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PipelineController, UserPipelineController],
    providers: [PipelineService],
    exports: [PipelineService],
})
export class PipelineModule { }
