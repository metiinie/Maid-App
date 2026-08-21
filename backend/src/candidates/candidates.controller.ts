import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    @ApiOperation({ summary: 'Get list of available candidate profiles' })
    async findAll(@Query() query: { category?: string; status?: string; search?: string }) {
        return this.candidatesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get candidate profile details' })
    async findOne(@Param('id') id: string) {
        return this.candidatesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create candidate profile' })
    async create(@Body() body: any) {
        const agencyId = body.agencyId || 'default-agency-id';
        return this.candidatesService.create(agencyId, body);
    }
}
