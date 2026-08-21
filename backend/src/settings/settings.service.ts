import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
    constructor(private prisma: PrismaService) { }

    async getAgencySettings(agencyId: string) {
        let settings = await this.prisma.agencySetting.findUnique({ where: { agencyId } });
        if (!settings) {
            settings = await this.prisma.agencySetting.create({
                data: { agencyId },
            });
        }

        const channels = await this.prisma.agencyContactChannel.findMany({
            where: { agencyId },
            orderBy: { isPrimary: 'desc' },
        });

        const agency = await this.prisma.agency.findUnique({
            where: { id: agencyId },
            select: { name: true, licenseNumber: true, logoUrl: true, bannerUrl: true, phone: true, email: true, city: true, address: true },
        });

        return { agency, settings, contactChannels: channels };
    }

    async updateSettings(agencyId: string, data: any) {
        return this.prisma.agencySetting.upsert({
            where: { agencyId },
            update: { ...data },
            create: { agencyId, ...data },
        });
    }

    async addContactChannel(agencyId: string, data: any) {
        return this.prisma.agencyContactChannel.create({
            data: {
                agencyId,
                channelType: data.channelType, // whatsapp, telegram, imo, phone, email
                channelValue: data.channelValue,
                label: data.label,
                isPrimary: data.isPrimary ?? false,
            },
        });
    }

    async deleteContactChannel(agencyId: string, channelId: string) {
        const channel = await this.prisma.agencyContactChannel.findFirst({ where: { id: channelId, agencyId } });
        if (!channel) throw new NotFoundException('Contact channel not found');

        return this.prisma.agencyContactChannel.delete({ where: { id: channelId } });
    }
}
