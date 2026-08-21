import { Module } from '@nestjs/common';
import { ApplicationsController } from './applications.controller';
import { AdminApplicationsController } from './admin-applications.controller';
import { ApplicationsService } from './applications.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ApplicationsController, AdminApplicationsController],
    providers: [ApplicationsService],
    exports: [ApplicationsService],
})
export class ApplicationsModule { }
