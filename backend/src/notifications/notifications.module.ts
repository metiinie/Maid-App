import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push.service';
import { NotificationsController } from './notifications.controller';

@Module({
    controllers: [NotificationsController],
    providers: [NotificationsService, PushNotificationService],
    exports: [NotificationsService, PushNotificationService],
})
export class NotificationsModule { }
