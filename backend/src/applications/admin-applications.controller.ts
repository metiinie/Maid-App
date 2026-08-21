import { Controller, Get, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Admin Applications')
@Controller('admin/applications')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminApplicationsController {
    constructor(private readonly applicationsService: ApplicationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get job applications for agency' })
    async getAgencyApplications(@Req() req: any, @Query() query: any) {
        return this.applicationsService.getAgencyApplications(req.user.agencyId, query);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Update job application status' })
    async updateStatus(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { status: string; reviewerNotes?: string },
    ) {
        return this.applicationsService.updateApplicationStatus(
            req.user.agencyId,
            id,
            body.status,
            body.reviewerNotes,
        );
    }
}
