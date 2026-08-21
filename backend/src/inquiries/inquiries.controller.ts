import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InquiriesService } from './inquiries.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Inquiries')
@Controller('inquiries')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class InquiriesController {
    constructor(private readonly inquiriesService: InquiriesService) { }

    @Post(':candidateId')
    @ApiOperation({ summary: 'Submit employer inquiry for candidate' })
    async createInquiry(@Req() req: any, @Param('candidateId') candidateId: string, @Body() body: any) {
        return this.inquiriesService.createInquiry(req.user.sub || req.user.id, candidateId, body);
    }

    @Get('my-inquiries')
    @ApiOperation({ summary: 'Get employer inquiries history' })
    async getMyInquiries(@Req() req: any) {
        return this.inquiriesService.getUserInquiries(req.user.sub || req.user.id);
    }
}
