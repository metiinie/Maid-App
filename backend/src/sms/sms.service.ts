import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsEthiopiaService {
    private readonly logger = new Logger(SmsEthiopiaService.name);
    private readonly apiKey: string;
    private readonly senderId: string;

    constructor(private configService: ConfigService) {
        this.apiKey = this.configService.get<string>('SMS_ETHIOPIA_API_KEY') || '';
        this.senderId = this.configService.get<string>('SMS_ETHIOPIA_SENDER_ID') || 'AGENCY';
    }

    async sendSMS(to: string, message: string): Promise<boolean> {
        try {
            const response = await axios.post('https://api.smsethiopia.com/v1/sms/send', {
                key: this.apiKey,
                to,
                message,
                sender: this.senderId,
            });
            return response.data?.status === 'success';
        } catch (error) {
            this.logger.error(`SMSEthiopia dispatch failed to ${to}: ${error.message}`);
            return false;
        }
    }

    async sendOTP(phone: string, otp: string, purpose: string): Promise<boolean> {
        const templates: Record<string, string> = {
            registration: `Your verification code is: ${otp}. Valid for 10 minutes.`,
            password_reset: `Your password reset code is: ${otp}. Valid for 10 minutes.`,
        };
        const message = templates[purpose] || `Your verification code is: ${otp}`;
        return this.sendSMS(phone, message);
    }
}
