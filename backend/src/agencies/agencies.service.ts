import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OnboardAgencyDto } from './dto/onboard-agency.dto';

@Injectable()
export class AgenciesService {
    constructor(private prisma: PrismaService) { }

    async onboardAgency(userId: string, dto: OnboardAgencyDto) {
        const existing = await this.prisma.organization.findFirst({
            where: {
                OR: [
                    { licenseNumber: dto.licenseNumber },
                    { name: dto.name },
                ],
            },
        });

        if (existing) {
            throw new BadRequestException('An agency with this license number or name already exists');
        }

        const agency = await this.prisma.organization.create({
            data: {
                name: dto.name,
                type: 'AGENCY',
                licenseNumber: dto.licenseNumber,
                city: dto.city,
                country: dto.country,
                phone: dto.contactPhone,
                email: dto.contactEmail,
                logoUrl: dto.logoUrl,
                isVerified: false,
                members: {
                    create: {
                        userId,
                        role: 'OWNER',
                        isActive: true,
                    },
                },
            },
        });

        return {
            success: true,
            message: 'Agency onboarding application submitted successfully. Pending platform admin verification.',
            agency,
        };
    }

    async getPendingAgencies() {
        return this.prisma.organization.findMany({
            where: {
                type: 'AGENCY',
                isVerified: false,
            },
            include: {
                members: { include: { user: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async verifyAgency(agencyId: string, status: 'VERIFIED' | 'REJECTED') {
        const agency = await this.prisma.organization.findUnique({ where: { id: agencyId } });
        if (!agency) throw new NotFoundException('Agency not found');

        return this.prisma.organization.update({
            where: { id: agencyId },
            data: {
                isVerified: status === 'VERIFIED',
                isActive: status === 'VERIFIED',
            },
        });
    }

    async getVerifiedAgencies() {
        return this.prisma.organization.findMany({
            where: {
                type: 'AGENCY',
                isVerified: true,
            },
            orderBy: { name: 'asc' },
        });
    }
}

