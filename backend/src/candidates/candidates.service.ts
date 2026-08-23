import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class CandidatesService {
    constructor(
        private prisma: PrismaService,
        private mediaService: MediaService,
    ) { }

    async findAll(query: { categoryId?: string; status?: string; search?: string }) {
        const where: any = {};
        if (query.status) where.status = query.status;
        if (query.categoryId) where.categoryId = query.categoryId;
        if (query.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.candidate.findMany({
            where,
            include: { category: true, agency: { select: { id: true, name: true, logoUrl: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    async findOne(id: string) {
        const candidate = await this.prisma.candidate.findUnique({
            where: { id },
            include: {
                documents: true,
                agency: { include: { contactChannels: true } },
                category: true,
            },
        });

        if (!candidate) {
            throw new NotFoundException(`Candidate #${id} not found`);
        }

        return candidate;
    }

    async create(agencyId: string, data: any) {
        return this.prisma.candidate.create({
            data: {
                agencyId,
                firstName: data.firstName,
                lastName: data.lastName,
                gender: data.gender || 'female',
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
                nationality: data.nationality || 'Ethiopian',
                religion: data.religion || 'Orthodox',
                maritalStatus: data.maritalStatus || 'Single',
                currentCountry: data.currentCountry || 'Ethiopia',
                city: data.city || 'Addis Ababa',
                educationLevel: data.educationLevel,
                yearsOfExperience: Number(data.yearsOfExperience || 0),
                medicalStatus: data.medicalStatus || 'pending',
                medicalClearanceDate: data.medicalClearanceDate ? new Date(data.medicalClearanceDate) : null,
                photoUrl: data.photoUrl,
                videoUrl: data.videoUrl,
                summary: data.summary,
                skills: data.skills || [],
                languages: data.languages || [],
                categoryId: data.categoryId,
            },
        });
    }

    async update(id: string, data: any) {
        const candidate = await this.findOne(id);
        const { agencyId, ...updateData } = data;
        return this.prisma.candidate.update({
            where: { id },
            data: {
                ...updateData,
                dateOfBirth: updateData.dateOfBirth ? new Date(updateData.dateOfBirth) : candidate.dateOfBirth,
                yearsOfExperience: updateData.yearsOfExperience !== undefined ? Number(updateData.yearsOfExperience) : candidate.yearsOfExperience,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.candidate.delete({ where: { id } });
    }

    async findAgencyCandidates(agencyId: string, query?: any) {
        const where: any = { agencyId };
        if (query?.search) {
            where.OR = [
                { firstName: { contains: query.search, mode: 'insensitive' } },
                { lastName: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.candidate.findMany({
            where,
            include: { category: true, documents: true, hiringPipelines: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async verifyDocument(candidateId: string, documentId: string, status: 'VERIFIED' | 'REJECTED', notes?: string) {
        const document = await this.prisma.candidateDocument.findFirst({
            where: { id: documentId, candidateId },
        });

        if (!document) {
            throw new NotFoundException('Document not found for this candidate');
        }

        const updatedDoc = await this.prisma.candidateDocument.update({
            where: { id: documentId },
            data: {
                verificationStatus: status,
                verifiedAt: status === 'VERIFIED' ? new Date() : null,
            },
        });

        if (document.type === 'MEDICAL' || document.type === 'MEDICAL_CLEARANCE') {
            await this.prisma.candidate.update({
                where: { id: candidateId },
                data: {
                    medicalStatus: status === 'VERIFIED' ? 'cleared' : 'failed',
                    medicalClearanceDate: status === 'VERIFIED' ? new Date() : null,
                },
            });
        } else if (document.type === 'VISA') {
            await this.prisma.candidate.update({
                where: { id: candidateId },
                data: {
                    visaStatus: status === 'VERIFIED' ? 'issued' : 'rejected',
                },
            });
        }

        return updatedDoc;
    }
}
