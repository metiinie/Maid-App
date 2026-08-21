import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Applications')
@Controller('applications')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class ApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Post('apply/:vacancyId')
    @ApiOperation({ summary: 'Submit job application' })
    async apply(@Req() req: any, @Param('vacancyId') vacancyId: string, @Body() body: any) {
        return this.applicationsService.applyForJob(req.user.sub || req.user.id, vacancyId, body);
    }

    @Get('my-applications')
    @ApiOperation({ summary: 'Get current user job applications' })
    async getMyApplications(@Req() req: any) {
        return this.applicationsService.getUserApplications(req.user.sub || req.user.id);
    }
}
