import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SmsEthiopiaService } from '../sms/sms.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private smsService: SmsEthiopiaService,
    ) { }

    async requestOtp(phone: string, purpose: string = 'registration') {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        await this.prisma.otpVerification.create({
            data: {
                phone,
                code,
                purpose,
                expiresAt,
            },
        });

        await this.smsService.sendOTP(phone, code, purpose);
        return { success: true, message: 'OTP sent successfully' };
    }

    async verifyOtp(phone: string, code: string) {
        const record = await this.prisma.otpVerification.findFirst({
            where: {
                phone,
                code,
                verified: false,
                expiresAt: { gte: new Date() },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!record) {
            throw new BadRequestException('Invalid or expired OTP code');
        }

        await this.prisma.otpVerification.update({
            where: { id: record.id },
            data: { verified: true },
        });

        return { verified: true };
    }

    async loginUser(phone: string, pin: string) {
        const user = await this.prisma.user.findUnique({ where: { phone } });
        if (!user) {
            throw new UnauthorizedException('Invalid phone number or PIN');
        }

        const isValid = await bcrypt.compare(pin, user.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid phone number or PIN');
        }

        const payload = { sub: user.id, phone: user.phone, role: 'user' };
        const token = this.jwtService.sign(payload);

        return {
            token,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                preferredMode: user.preferredMode,
            },
        };
    }

    async loginAdmin(email: string, pass: string) {
        const admin = await this.prisma.adminUser.findUnique({
            where: { email },
            include: { agency: true },
        });

        if (!admin) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isValid = await bcrypt.compare(pass, admin.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: admin.id,
            email: admin.email,
            agencyId: admin.agencyId,
            role: admin.role,
        };
        const token = this.jwtService.sign(payload);

        return {
            token,
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                agencyId: admin.agencyId,
                agencyName: admin.agency.name,
            },
        };
    }
}
