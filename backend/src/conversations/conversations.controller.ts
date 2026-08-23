import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConversationsService } from './conversations.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Conversations')
@Controller('conversations')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class ConversationsController {
    constructor(private readonly conversationsService: ConversationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get user active conversation threads' })
    async getUserConversations(@Req() req: any) {
        return this.conversationsService.getUserConversations(req.user.sub || req.user.id);
    }

    @Post()
    @ApiOperation({ summary: 'Initialize or retrieve conversation thread with an agency' })
    async getOrCreateConversation(@Req() req: any, @Body() body: { agencyId?: string; agency_id?: string }) {
        const userId = req.user.sub || req.user.id;
        const agencyId = body.agencyId || body.agency_id;
        return this.conversationsService.getOrCreateConversation(userId, agencyId);
    }

    @Get(':id/messages')
    @ApiOperation({ summary: 'Get messages for thread' })
    async getMessages(@Param('id') id: string) {
        return this.conversationsService.getConversationMessages(id);
    }

    @Post(':id/messages')
    @ApiOperation({ summary: 'Send message in conversation thread' })
    async sendMessage(
        @Req() req: any,
        @Param('id') id: string,
        @Body() body: { text: string; attachmentUrl?: string },
    ) {
        return this.conversationsService.sendMessage(
            id,
            'user',
            req.user.sub || req.user.id,
            body.text,
            body.attachmentUrl,
        );
    }
}
