import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
    constructor(private prisma: PrismaService) { }

    async applyForJob(userId: string, vacancyId: string, data: any) {
        const vacancy = await this.prisma.jobVacancy.findUnique({ where: { id: vacancyId } });
        if (!vacancy) throw new NotFoundException('Job vacancy not found');
        if (vacancy.status !== 'ACTIVE') throw new BadRequestException('Vacancy is not active');

        const existing = await this.prisma.application.findFirst({
            where: { userId, vacancyId },
        });
        if (existing) throw new BadRequestException('You have already applied for this vacancy');

        return this.prisma.application.create({
            data: {
                userId,
                vacancyId,
                coverLetter: data.coverLetter,
                additionalNotes: data.additionalNotes,
            },
        });
    }

    async getUserApplications(userId: string) {
        return this.prisma.application.findMany({
            where: { userId },
            include: {
                vacancy: {
                    include: { agency: { select: { id: true, name: true, logoUrl: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Admin methods
    async getAgencyApplications(agencyId: string, query: any) {
        const { status, vacancyId } = query;
        const where: any = { vacancy: { agencyId } };
        if (status) where.status = status;
        if (vacancyId) where.vacancyId = vacancyId;

        return this.prisma.application.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, jobseekerProfile: true } },
                vacancy: { select: { id: true, title: true, country: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateApplicationStatus(agencyId: string, id: string, status: any, reviewerNotes?: string) {
        const application = await this.prisma.application.findFirst({
            where: { id, vacancy: { agencyId } },
        });
        if (!application) throw new NotFoundException('Application not found or unauthorized');

        return this.prisma.application.update({
            where: { id },
            data: {
                status,
                reviewerNotes: reviewerNotes || application.reviewerNotes,
            },
        });
    }
}
