import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VacanciesService } from './vacancies.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';

@ApiTags('Admin Vacancies')
@Controller('admin/vacancies')
@UseGuards(AdminJwtGuard)
@ApiBearerAuth()
export class AdminVacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Get()
    @ApiOperation({ summary: 'List all vacancies for current agency' })
    async findAllAdmin(@Req() req: any) {
        return this.vacanciesService.findAllAdmin(req.user.agencyId);
    }

    @Post()
    @ApiOperation({ summary: 'Create new job vacancy posting' })
    async createAdmin(@Req() req: any, @Body() body: any) {
        return this.vacanciesService.createAdmin(req.user.agencyId, body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update job vacancy details' })
    async updateAdmin(@Req() req: any, @Param('id') id: string, @Body() body: any) {
        return this.vacanciesService.updateAdmin(req.user.agencyId, id, body);
    }

    @Put(':id/publish')
    @ApiOperation({ summary: 'Publish or change status of vacancy' })
    async updateStatusAdmin(@Req() req: any, @Param('id') id: string, @Body() body: { status: string }) {
        return this.vacanciesService.updateStatusAdmin(req.user.agencyId, id, body.status);
    }
}
