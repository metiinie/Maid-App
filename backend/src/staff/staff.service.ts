import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class StaffService {
    constructor(private prisma: PrismaService) { }

    async getAgencyStaff(agencyId: string) {
        return this.prisma.adminUser.findMany({
            where: { agencyId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async createStaff(agencyId: string, data: any) {
        const existing = await this.prisma.adminUser.findUnique({ where: { email: data.email } });
        if (existing) throw new BadRequestException('Admin user with this email already exists');

        const hashedPassword = await bcrypt.hash(data.password, 12);

        return this.prisma.adminUser.create({
            data: {
                agencyId,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: hashedPassword,
                role: data.role || 'STAFF',
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
    }

    async toggleStaffStatus(agencyId: string, staffId: string, isActive: boolean) {
        const staff = await this.prisma.adminUser.findFirst({ where: { id: staffId, agencyId } });
        if (!staff) throw new NotFoundException('Staff account not found');

        return this.prisma.adminUser.update({
            where: { id: staffId },
            data: { isActive },
            select: { id: true, email: true, isActive: true },
        });
    }
}
