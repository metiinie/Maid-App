import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedService {
    constructor(private prisma: PrismaService) { }

    async getSavedCandidates(userId: string) {
        return this.prisma.savedCandidate.findMany({
            where: { userId },
            include: {
                candidate: {
                    include: { category: true, agency: { select: { id: true, name: true, logoUrl: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleSaveCandidate(userId: string, candidateId: string) {
        const existing = await this.prisma.savedCandidate.findUnique({
            where: { userId_candidateId: { userId, candidateId } },
        });

        if (existing) {
            await this.prisma.savedCandidate.delete({ where: { id: existing.id } });
            return { saved: false };
        } else {
            await this.prisma.savedCandidate.create({ data: { userId, candidateId } });
            return { saved: true };
        }
    }

    async getSavedVacancies(userId: string) {
        return this.prisma.savedVacancy.findMany({
            where: { userId },
            include: {
                vacancy: {
                    include: { category: true, agency: { select: { id: true, name: true, logoUrl: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleSaveVacancy(userId: string, vacancyId: string) {
        const existing = await this.prisma.savedVacancy.findUnique({
            where: { userId_vacancyId: { userId, vacancyId } },
        });

        if (existing) {
            await this.prisma.savedVacancy.delete({ where: { id: existing.id } });
            return { saved: false };
        } else {
            await this.prisma.savedVacancy.create({ data: { userId, vacancyId } });
            return { saved: true };
        }
    }
}
