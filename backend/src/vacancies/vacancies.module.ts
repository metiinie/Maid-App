import { Module } from '@nestjs/common';
import { VacanciesController } from './vacancies.controller';
import { AdminVacanciesController } from './admin-vacancies.controller';
import { VacanciesService } from './vacancies.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [VacanciesController, AdminVacanciesController],
    providers: [VacanciesService],
    exports: [VacanciesService],
})
export class VacanciesModule { }
