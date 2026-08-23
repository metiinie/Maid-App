import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';

@ApiTags('Admin Conversations')
@Controller('admin/conversations')
@UseGuards(AdminJwtGuard, WorkspaceGuard)
@ApiBearerAuth()
export class AdminConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get conversations for agency workspace' })
    async getAgencyConversations(@CurrentWorkspace() workspaceId: string) {
        return this.conversationsService.getAgencyConversations(workspaceId);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Get messages for conversation thread' })
    async getMessages(@Param('id') id: string) {
        return this.conversationsService.getConversationMessages(id);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Send message as agency admin' })
    async sendMessage(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { text: string; attachmentUrl?: string },
    ) {
        const adminId = req.user.sub || req.user.id;
        return this.conversationsService.sendMessage(
            id,
            'agency',
            adminId,
            body.text,
            body.attachmentUrl,
        );
    }
}
