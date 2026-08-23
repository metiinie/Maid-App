import { Controller, Get, Patch, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get notifications for current authenticated user' })
    async getUserNotifications(@Req() req: any) {
        const userId = req.user.sub || req.user.id;
        return this.notificationsService.getUserNotifications(userId);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get count of unread notifications' })
    async getUnreadCount(@Req() req: any) {
        const userId = req.user.sub || req.user.id;
        return this.notificationsService.getUnreadCount(userId);
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    async markAsRead(@Req() req: any, @Param('id') id: string) {
        const userId = req.user.sub || req.user.id;
        return this.notificationsService.markAsRead(userId, id);
    }

    @Post('device-token')
    @ApiOperation({ summary: 'Register Expo push notification token for device' })
    async registerDeviceToken(@Req() req: any, @Body() body: { token: string }) {
        const userId = req.user.sub || req.user.id;
        return this.notificationsService.registerDeviceToken(userId, body.token);
    }
}
