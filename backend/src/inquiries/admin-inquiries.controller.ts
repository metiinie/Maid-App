import { Controller, Get, Put, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Admin Inquiries')
@Controller('admin/inquiries')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminInquiriesController {
    constructor(private readonly inquiriesService: InquiriesService) { }

    @Get()
    @ApiOperation({ summary: 'Get employer candidate inquiries inbox' })
    async getAgencyInquiries(@Req() req: any, @Query('status') status?: string) {
        return this.inquiriesService.getAgencyInquiries(req.user.agencyId, status);
    }

    @Put(':id/respond')
    @ApiOperation({ summary: 'Respond to employer candidate inquiry' })
    async respondInquiry(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { response: string; status?: string },
    ) {
        return this.inquiriesService.respondInquiry(req.user.agencyId, id, body.response, body.status);
    }
}
