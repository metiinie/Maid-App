import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('otp/request')
    @ApiOperation({ summary: 'Request OTP verification code via SMSEthiopia' })
    async requestOtp(@Body() body: { phone: string; purpose?: string }) {
        return this.authService.requestOtp(body.phone, body.purpose);
    }

    @Post('otp/verify')
    @ApiOperation({ summary: 'Verify OTP code' })
    async verifyOtp(@Body() body: { phone: string; otp: string }) {
        return this.authService.verifyOtp(body.phone, body.otp);
    }

    @Post('login/user')
    @ApiOperation({ summary: 'User login with Phone and PIN' })
    async loginUser(@Body() body: { phone: string; pin: string }) {
        return this.authService.loginUser(body.phone, body.pin);
    }

    @Post('login/admin')
    @ApiOperation({ summary: 'Agency Admin login with Email and Password' })
    async loginAdmin(@Body() body: { email: string; password: string }) {
        return this.authService.loginAdmin(body.email, body.password);
    }

    @Get('workspaces')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get available workspaces/organizations for authenticated user' })
    async getWorkspaces(@Req() req: any) {
        const userId = req.user.sub || req.user.id;
        return this.authService.getUserWorkspaces(userId);
    }
}

