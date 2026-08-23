import { Controller, Get, Post, Put, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CandidatesService } from './candidates.service';
import { AdminJwtGuard } from '../common/guards/admin-jwt.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@ApiTags('Admin Candidates')
@Controller('admin/candidates')
@UseGuards(AdminJwtGuard, WorkspaceGuard)
@ApiBearerAuth()
export class AdminCandidatesController {
    constructor(private readonly candidatesService: CandidatesService) { }

    @Get()
    @ApiOperation({ summary: 'Get agency candidates list' })
    async findAll(@CurrentWorkspace() workspaceId: string, @Query() query: any) {
        return this.candidatesService.findAgencyCandidates(workspaceId, query);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get agency candidate details' })
    async findOne(@Param('id') id: string) {
        return this.candidatesService.findOne(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new candidate profile for agency' })
    async create(@CurrentWorkspace() workspaceId: string, @Body() body: CreateCandidateDto) {
        return this.candidatesService.create(workspaceId, body);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update agency candidate profile' })
    async update(@Param('id') id: string, @Body() body: any) {
        return this.candidatesService.update(id, body);
    }

    @Patch(':candidateId/documents/:docId/verify')
    @ApiOperation({ summary: 'Verify candidate document clearance (Passport, Medical, Visa)' })
    async verifyDocument(
        @Param('candidateId') candidateId: string,
        @Param('docId') docId: string,
        @Body() body: { status: 'VERIFIED' | 'REJECTED'; notes?: string },
    ) {
        return this.candidatesService.verifyDocument(candidateId, docId, body.status, body.notes);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete candidate profile' })
    async remove(@Param('id') id: string) {
        return this.candidatesService.remove(id);
    }
}
