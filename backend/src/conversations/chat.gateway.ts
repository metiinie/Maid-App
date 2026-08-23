import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    ConnectedSocket,
    MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly conversationsService: ConversationsService) { }

    handleConnection(client: Socket) {
        // Client connection event
    }

    handleDisconnect(client: Socket) {
        // Client disconnection event
    }

    @SubscribeMessage('join_room')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        if (data.conversationId) {
            client.join(`conversation_${data.conversationId}`);
            return { event: 'joined_room', room: `conversation_${data.conversationId}` };
        }
    }

    @SubscribeMessage('leave_room')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        if (data.conversationId) {
            client.leave(`conversation_${data.conversationId}`);
        }
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody()
        data: {
            conversationId: string;
            senderType: 'user' | 'agency';
            senderId: string;
            text: string;
            attachmentUrl?: string;
        },
    ) {
        const message = await this.conversationsService.sendMessage(
            data.conversationId,
            data.senderType,
            data.senderId,
            data.text,
            data.attachmentUrl,
        );

        this.server
            .to(`conversation_${data.conversationId}`)
            .emit('new_message', message);

        return message;
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string; userId: string; isTyping: boolean },
    ) {
        client.to(`conversation_${data.conversationId}`).emit('user_typing', data);
    }
}
