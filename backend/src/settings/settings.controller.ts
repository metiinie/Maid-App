import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Admin Settings')
@Controller('admin/settings')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @ApiOperation({ summary: 'Get workspace settings and contact channels' })
    async getAgencySettings(@Req() req: any) {
        return this.settingsService.getAgencySettings(req.user.agencyId);
    }

    @Put()
    @ApiOperation({ summary: 'Update agency workspace settings' })
    async updateSettings(@Req() req: any, @Body() body: any) {
        return this.settingsService.updateSettings(req.user.agencyId, body);
    }

    @Post('channels')
    @ApiOperation({ summary: 'Add contact channel (WhatsApp, Telegram, IMO, Phone)' })
    async addContactChannel(@Req() req: any, @Body() body: any) {
        return this.settingsService.addContactChannel(req.user.agencyId, body);
    }

    @Delete('channels/:channelId')
    @ApiOperation({ summary: 'Delete contact channel' })
    async deleteContactChannel(@Req() req: any, @Param('channelId') channelId: string) {
        return this.settingsService.deleteContactChannel(req.user.agencyId, channelId);
    }
}
