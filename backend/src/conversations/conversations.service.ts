import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConversationsService {
    constructor(private prisma: PrismaService) { }

    async getUserConversations(userId: string) {
        return this.prisma.conversation.findMany({
            where: { userId },
            include: {
                agency: { select: { id: true, name: true, logoUrl: true, phone: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async getConversationMessages(conversationId: string) {
        return this.prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: 'asc' },
        });
    }

    async sendMessage(conversationId: string, senderType: 'user' | 'agency', senderId: string, text: string, attachmentUrl?: string) {
        const conversation = await this.prisma.conversation.findUnique({ where: { id: conversationId } });
        if (!conversation) throw new NotFoundException('Conversation thread not found');

        const message = await this.prisma.message.create({
            data: {
                conversationId,
                senderType,
                senderId,
                text,
                attachmentUrl,
            },
        });

        await this.prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });

        return message;
    }

    async getOrCreateConversation(userId: string, agencyId: string) {
        let conversation = await this.prisma.conversation.findFirst({
            where: { userId, agencyId },
        });

        if (!conversation) {
            conversation = await this.prisma.conversation.create({
                data: { userId, agencyId },
            });
        }

        return conversation;
    }

    async getAgencyConversations(agencyId: string) {
        return this.prisma.conversation.findMany({
            where: { agencyId },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true } },
                messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }
}
