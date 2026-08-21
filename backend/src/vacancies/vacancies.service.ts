import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VacanciesService {
    constructor(private prisma: PrismaService) { }

    async findAllPublic(query: any) {
        const { categoryId, country, search, minSalary, maxSalary, limit = 20, offset = 0 } = query;
        const where: any = { status: 'ACTIVE' };

        if (categoryId) where.categoryId = categoryId;
        if (country) where.country = { contains: country, mode: 'insensitive' };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (minSalary) where.salaryMin = { gte: Number(minSalary) };
        if (maxSalary) where.salaryMax = { lte: Number(maxSalary) };

        const [vacancies, total] = await Promise.all([
            this.prisma.jobVacancy.findMany({
                where,
                include: {
                    agency: {
                        select: { id: true, name: true, logoUrl: true, city: true, phone: true, email: true },
                    },
                    category: true,
                },
                orderBy: { publishedAt: 'desc' },
                take: Number(limit),
                skip: Number(offset),
            }),
            this.prisma.jobVacancy.count({ where }),
        ]);

        return { vacancies, total, limit: Number(limit), offset: Number(offset) };
    }

    async findOnePublic(id: string) {
        const vacancy = await this.prisma.jobVacancy.findUnique({
            where: { id },
            include: {
                agency: {
                    include: { contactChannels: true, settings: true },
                },
                category: true,
            },
        });
        if (!vacancy) throw new NotFoundException('Job vacancy not found');

        // Track view count async
        await this.prisma.vacancyView.create({ data: { vacancyId: id } }).catch(() => { });

        return vacancy;
    }

    // Admin methods
    async findAllAdmin(agencyId: string) {
        return this.prisma.jobVacancy.findMany({
            where: { agencyId },
            include: { category: true, _count: { select: { applications: true, views: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createAdmin(agencyId: string, data: any) {
        return this.prisma.jobVacancy.create({
            data: {
                agencyId,
                title: data.title,
                categoryId: data.categoryId,
                description: data.description,
                requirements: data.requirements || [],
                country: data.country,
                city: data.city,
                employerType: data.employerType || 'individual_family',
                employerName: data.employerName,
                showEmployerName: data.showEmployerName ?? false,
                salaryMin: Number(data.salaryMin),
                salaryMax: Number(data.salaryMax),
                salaryCurrency: data.salaryCurrency || 'USD',
                contractPeriodYears: Number(data.contractPeriodYears || 2),
                workingHoursPerDay: Number(data.workingHoursPerDay || 8),
                workingDaysPerWeek: Number(data.workingDaysPerWeek || 6),
                visaSponsorship: data.visaSponsorship ?? true,
                accommodationProvided: data.accommodationProvided ?? true,
                mealsProvided: data.mealsProvided ?? true,
                transportationProvided: data.transportationProvided ?? false,
                healthInsurance: data.healthInsurance ?? true,
                annualLeaveDays: Number(data.annualLeaveDays || 30),
                genderPreference: data.genderPreference || 'any',
                ageMin: data.ageMin ? Number(data.ageMin) : null,
                ageMax: data.ageMax ? Number(data.ageMax) : null,
                experienceRequired: Number(data.experienceRequired || 0),
                vacanciesCount: Number(data.vacanciesCount || 1),
                applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : null,
                status: data.status || 'DRAFT',
                publishedAt: data.status === 'ACTIVE' ? new Date() : null,
            },
        });
    }

    async updateAdmin(agencyId: string, id: string, data: any) {
        const vacancy = await this.prisma.jobVacancy.findFirst({ where: { id, agencyId } });
        if (!vacancy) throw new NotFoundException('Vacancy not found or access denied');
        return this.prisma.jobVacancy.update({ where: { id }, data });
    }

    async updateStatusAdmin(agencyId: string, id: string, status: any) {
        const vacancy = await this.prisma.jobVacancy.findFirst({ where: { id, agencyId } });
        if (!vacancy) throw new NotFoundException('Vacancy not found or access denied');
        return this.prisma.jobVacancy.update({
            where: { id },
            data: {
                status,
                publishedAt: status === 'ACTIVE' && !vacancy.publishedAt ? new Date() : vacancy.publishedAt,
            },
        });
    }
}
