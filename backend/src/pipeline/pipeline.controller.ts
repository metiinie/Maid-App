import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';

@ApiTags('Admin Pipeline')
@Controller(['admin/pipelines', 'admin/pipeline'])
@UseGuards(AdminJwtGuard, WorkspaceGuard)
@ApiBearerAuth()
export class PipelineController {
    constructor(private readonly pipelineService: PipelineService) { }

    @Get()
    @ApiOperation({ summary: 'Get active 5-stage hiring pipelines for agency' })
    async getAgencyPipelines(@CurrentWorkspace() workspaceId: string, @Query('stage') stage?: string) {
        return this.pipelineService.getAgencyPipelines(workspaceId, stage);
    }

    @Post()
    @ApiOperation({ summary: 'Start new hiring pipeline for candidate' })
    async createPipeline(@CurrentWorkspace() workspaceId: string, @Body() body: any) {
        return this.pipelineService.createPipeline(workspaceId, body);
    }

    @Put(':id/stage')
    @ApiOperation({ summary: 'Advance hiring pipeline to next stage (PUT)' })
    async updateStagePut(
        @Req() req: any,
        @CurrentWorkspace() workspaceId: string,
        @Param('id') id: string,
        @Body() body: { stage: string; notes?: string },
    ) {
        return this.pipelineService.updateStage(workspaceId, id, body.stage, body.notes, req.user?.email || 'admin');
    }

    @Patch(':id/stage')
    @ApiOperation({ summary: 'Advance hiring pipeline to next stage (PATCH)' })
    async updateStagePatch(
        @Req() req: any,
        @CurrentWorkspace() workspaceId: string,
        @Param('id') id: string,
        @Body() body: { stage: string; notes?: string },
    ) {
        return this.pipelineService.updateStage(workspaceId, id, body.stage, body.notes, req.user?.email || 'admin');
    }
}
