import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Admin Pipeline')
@Controller('admin/pipeline')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) { }

    @Get()
    @ApiOperation({ summary: 'Get active 5-stage hiring pipelines for agency' })
    async getAgencyPipelines(@Req() req: any, @Query('stage') stage?: string) {
        return this.pipelineService.getAgencyPipelines(req.user.agencyId, stage);
    }

    @Post()
    @ApiOperation({ summary: 'Start new hiring pipeline for candidate' })
    async createPipeline(@Req() req: any, @Body() body: any) {
        return this.pipelineService.createPipeline(req.user.agencyId, body);
    }

    @Put(':id/stage')
    @ApiOperation({ summary: 'Advance hiring pipeline to next stage' })
    async updateStage(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { stage: string; notes?: string },
    ) {
        return this.pipelineService.updateStage(req.user.agencyId, id, body.stage, body.notes, req.user.email);
    }
}
