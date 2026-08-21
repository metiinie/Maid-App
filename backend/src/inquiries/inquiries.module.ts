import { Module } from '@nestjs/common';
import { InquiriesController } from './inquiries.controller';
import { AdminInquiriesController } from './admin-inquiries.controller';
import { InquiriesService } from './inquiries.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [InquiriesController, AdminInquiriesController],
    providers: [InquiriesService],
    exports: [InquiriesService],
})
export class InquiriesModule { }
