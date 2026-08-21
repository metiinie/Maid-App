import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CandidatesModule } from './candidates/candidates.module';
import { MediaService } from './media/media.service';
import { SmsEthiopiaService } from './sms/sms.service';
import { PushNotificationService } from './notifications/push.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        PrismaModule,
        AuthModule,
        CandidatesModule,
    ],
    providers: [
        MediaService,
        SmsEthiopiaService,
        PushNotificationService,
    ],
    exports: [
        MediaService,
        SmsEthiopiaService,
        PushNotificationService,
    ],
})
export class AppModule { }
