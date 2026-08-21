import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PushNotificationService {
    private readonly expo: Expo;
    private readonly logger = new Logger(PushNotificationService.name);

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        const accessToken = this.configService.get<string>('EXPO_ACCESS_TOKEN');
        this.expo = new Expo({ accessToken });
    }

    async sendToUser(userId: string, title: string, body: string, data: Record<string, any> = {}) {
        const tokens = await this.prisma.deviceToken.findMany({
            where: { userId, isActive: true },
        });

        if (!tokens.length) {
            this.logger.log(`No active push tokens found for user ${userId}`);
            return;
        }

        const messages: ExpoPushMessage[] = [];
        for (const tokenRecord of tokens) {
            if (!Expo.isExpoPushToken(tokenRecord.token)) {
                this.logger.warn(`Invalid Expo Push Token: ${tokenRecord.token}`);
                continue;
            }
            messages.push({
                to: tokenRecord.token,
                sound: 'default',
                title,
                body,
                data,
            });
        }

        const chunks = this.expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
                this.logger.log(`Pushed ${ticketChunk.length} notification tickets to Expo`);
            } catch (error) {
                this.logger.error('Error sending Expo push notification chunk', error);
            }
        }
    }
}
