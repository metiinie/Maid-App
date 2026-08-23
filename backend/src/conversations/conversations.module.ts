import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller';
import { AdminConversationsController } from './admin-conversations.controller';
import { ConversationsService } from './conversations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ConversationsController, AdminConversationsController],
    providers: [ConversationsService],
    exports: [ConversationsService],
})
export class ConversationsModule { }
