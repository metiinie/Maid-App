import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VacanciesService } from './vacancies.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Vacancies')
@Controller('vacancies')
export class VacanciesController {
    constructor(private readonly vacanciesService: VacanciesService) { }

    @Get()
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Browse active job vacancies with filters' })
    async findAll(@Query() query: any) {
        return this.vacanciesService.findAllPublic(query);
    }

    @Get(':id')
    @UseGuards(UserJwtGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get single job vacancy details' })
    async findOne(@Param('id') id: string) {
        return this.vacanciesService.findOnePublic(id);
    }
}
