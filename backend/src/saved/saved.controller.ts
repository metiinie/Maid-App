import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SavedService } from './saved.service';
import { UserJwtGuard } from '../common/guards/user-jwt.guard';

@ApiTags('Saved Bookmarks')
@Controller('saved')
@UseGuards(UserJwtGuard)
@ApiBearerAuth()
export class SavedController {
    constructor(private readonly savedService: SavedService) { }

    @Get('candidates')
    @ApiOperation({ summary: 'Get saved bookmarked candidates' })
    async getSavedCandidates(@Req() req: any) {
        return this.savedService.getSavedCandidates(req.user.sub || req.user.id);
    }

    @Post('candidates/:candidateId')
    @ApiOperation({ summary: 'Bookmark or un-bookmark a candidate' })
    async toggleSaveCandidate(@Req() req: any, @Param('candidateId') candidateId: string) {
        return this.savedService.toggleSaveCandidate(req.user.sub || req.user.id, candidateId);
    }

    @Get('vacancies')
    @ApiOperation({ summary: 'Get saved bookmarked vacancies' })
    async getSavedVacancies(@Req() req: any) {
        return this.savedService.getSavedVacancies(req.user.sub || req.user.id);
    }

    @Post('vacancies/:vacancyId')
    @ApiOperation({ summary: 'Bookmark or un-bookmark a job vacancy' })
    async toggleSaveVacancy(@Req() req: any, @Param('vacancyId') vacancyId: string) {
        return this.savedService.toggleSaveVacancy(req.user.sub || req.user.id, vacancyId);
    }
}
