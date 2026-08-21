import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidatesModule } from './candidates/candidates.module';
import { VacanciesModule } from './vacancies/vacancies.module';
import { ApplicationsModule } from './applications/applications.module';
import { InquiriesModule } from './inquiries/inquiries.module';
import { SavedModule } from './saved/saved.module';
import { PipelineModule } from './pipeline/pipeline.module';
import { ConversationsModule } from './conversations/conversations.module';
import { StaffModule } from './staff/staff.module';
import { SettingsModule } from './settings/settings.module';
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
        UsersModule,
        CandidatesModule,
        VacanciesModule,
        ApplicationsModule,
        InquiriesModule,
        SavedModule,
        PipelineModule,
        ConversationsModule,
        StaffModule,
        SettingsModule,
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
