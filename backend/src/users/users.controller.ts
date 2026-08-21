import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('me')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getMe(@Req() req: any) {
        return this.usersService.getMe(req.user.sub || req.user.id);
    }

    @Put('me/jobseeker-profile')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update job seeker profile details' })
    async updateJobseekerProfile(@Req() req: any, @Body() data: any) {
        return this.usersService.updateJobseekerProfile(req.user.sub || req.user.id, data);
    }

    @Put('me/employer-profile')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update employer profile details' })
    async updateEmployerProfile(@Req() req: any, @Body() data: any) {
        return this.usersService.updateEmployerProfile(req.user.sub || req.user.id, data);
    }

    @Put('me/device-token')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Register Expo push token for notifications' })
    async registerDeviceToken(@Req() req: any, @Body() body: { token: string; platform?: string }) {
        return this.usersService.registerDeviceToken(req.user.sub || req.user.id, body.token, body.platform);
    }
}
