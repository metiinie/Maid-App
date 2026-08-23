import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AgenciesService } from './agencies.service';
import { OnboardAgencyDto } from './dto/onboard-agency.dto';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Agencies')
@Controller('agencies')
export class AgenciesController {
    constructor(private readonly agenciesService: AgenciesService) { }

    @Post('onboard')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit self-service agency onboarding request' })
    async onboardAgency(@Req() req: any, @Body() body: OnboardAgencyDto) {
        const userId = req.user.sub || req.user.id;
        return this.agenciesService.onboardAgency(userId, body);
    }

    @Get('admin/pending')
    @UseGuards(AdminJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get list of pending agency onboarding applications (Platform Admin)' })
    async getPendingAgencies() {
        return this.agenciesService.getPendingAgencies();
    }

    @Patch('admin/:id/verify')
    @UseGuards(AdminJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Approve or reject agency license onboarding (Platform Admin)' })
    async verifyAgency(
        @Param('id') id: string,
        @Body() body: { status: 'VERIFIED' | 'REJECTED' },
    ) {
        return this.agenciesService.verifyAgency(id, body.status);
    }
}
