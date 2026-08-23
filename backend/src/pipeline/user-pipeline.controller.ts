import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PipelineService } from './pipeline.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('User Pipelines')
@Controller('users/me/pipelines')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class UserPipelineController {
    constructor(private readonly pipelineService: PipelineService) { }

    @Get()
    @ApiOperation({ summary: 'Get active recruitment pipeline stages for authenticated user' })
    async getUserPipelines(@Req() req: any) {
        const userId = req.user.sub || req.user.id;
        return this.pipelineService.getUserPipelines(userId);
    }
}
