import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InquiriesService {
    constructor(private prisma: PrismaService) { }

    async createInquiry(userId: string, candidateId: string, data: any) {
        const candidate = await this.prisma.candidate.findUnique({ where: { id: candidateId } });
        if (!candidate) throw new NotFoundException('Candidate not found');

        return this.prisma.candidateInquiry.create({
            data: {
                userId,
                candidateId,
                message: data.message,
                preferredContactChannel: data.preferredContactChannel || 'whatsapp',
                purpose: data.purpose,
                requiredStartDate: data.requiredStartDate ? new Date(data.requiredStartDate) : null,
            },
        });
    }

    async getUserInquiries(userId: string) {
        return this.prisma.candidateInquiry.findMany({
            where: { userId },
            include: {
                candidate: {
                    select: { id: true, firstName: true, lastName: true, photoUrl: true, agency: { select: { name: true, phone: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Admin methods
    async getAgencyInquiries(agencyId: string, status?: string) {
        const where: any = { candidate: { agencyId } };
        if (status) where.status = status;

        return this.prisma.candidateInquiry.findMany({
            where,
            include: {
                user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true, employerProfile: true } },
                candidate: { select: { id: true, firstName: true, lastName: true, photoUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async respondInquiry(agencyId: string, id: string, response: string, status: any = 'RESPONDED') {
        const inquiry = await this.prisma.candidateInquiry.findFirst({
            where: { id, candidate: { agencyId } },
        });
        if (!inquiry) throw new NotFoundException('Inquiry not found or unauthorized');

        return this.prisma.candidateInquiry.update({
            where: { id },
            data: {
                adminResponse: response,
                status,
            },
        });
    }
}
