import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    @ApiOperation({ summary: 'Get list of available candidate profiles' })
    async findAll(@Query() query: { categoryId?: string; status?: string; search?: string }) {
        return this.candidatesService.findAll(query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get candidate profile details' })
    async findOne(@Param('id') id: string) {
        return this.candidatesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create candidate profile' })
    async create(@Body() body: CreateCandidateDto) {
        return this.candidatesService.create(body.agencyId, body);
    }
}
