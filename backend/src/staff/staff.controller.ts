import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StaffService } from './staff.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Admin Staff')
@Controller('admin/staff')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    @Get()
    @ApiOperation({ summary: 'List agency staff members' })
    async getAgencyStaff(@Req() req: any) {
        return this.staffService.getAgencyStaff(req.user.agencyId);
    }

    @Post()
    @ApiOperation({ summary: 'Create new staff member account' })
    async createStaff(@Req() req: any, @Body() body: any) {
        return this.staffService.createStaff(req.user.agencyId, body);
    }

    @Put(':id/status')
    @ApiOperation({ summary: 'Activate or deactivate staff member account' })
    async toggleStaffStatus(@Req() req: any, @Param('id') id: string, @Body() body: { isActive: boolean }) {
        return this.staffService.toggleStaffStatus(req.user.agencyId, id, body.isActive);
    }
}
