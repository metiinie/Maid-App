import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class CandidatesService {
    constructor(
        private prisma: PrismaService,
        private mediaService: MediaService,
    ) { }

    async findAll(query: { category?: string; status?: string; search?: string }) {
        const where: any = { isDeleted: false };
        if (query.status) where.status = query.status;
        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.candidateProfile.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async findOne(id: string) {
        const candidate = await this.prisma.candidateProfile.findUnique({
            where: { id },
            include: {
                documents: true,
                agency: true,
            },
        });

        if (!candidate || candidate.isDeleted) {
            throw new NotFoundException(`Candidate #${id} not found`);
        }

        return candidate;
    }

    async create(agencyId: string, data: any) {
        return this.prisma.candidateProfile.create({
            data: {
                ...data,
                agencyId,
            },
        });
    }
}
