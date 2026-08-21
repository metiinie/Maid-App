import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                jobseekerProfile: true,
                employerProfile: true,
            },
        });
        if (!user) throw new NotFoundException('User profile not found');
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async updateJobseekerProfile(userId: string, data: any) {
        return this.prisma.jobseekerProfile.upsert({
            where: { userId },
            update: { ...data },
            create: { userId, ...data },
        });
    }

    async updateEmployerProfile(userId: string, data: any) {
        return this.prisma.employerProfile.upsert({
            where: { userId },
            update: { ...data },
            create: { userId, ...data },
        });
    }

    async registerDeviceToken(userId: string, token: string, platform: string = 'expo') {
        return this.prisma.deviceToken.upsert({
            where: { token },
            update: { userId, platform, isActive: true },
            create: { userId, token, platform },
        });
    }
}
