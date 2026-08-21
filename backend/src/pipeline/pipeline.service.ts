import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PipelineService {
    constructor(private prisma: PrismaService) { }

    async getAgencyPipelines(agencyId: string, stage?: string) {
        const where: any = { agencyId, isActive: true };
        if (stage) where.currentStage = stage;

        return this.prisma.hiringPipeline.findMany({
            where,
            include: {
                candidate: {
                    select: { id: true, firstName: true, lastName: true, photoUrl: true, medicalStatus: true, visaStatus: true, category: true },
                },
                stageHistory: { orderBy: { enteredAt: 'desc' } },
                pipelineDocuments: true,
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async createPipeline(agencyId: string, data: any) {
        const candidate = await this.prisma.candidate.findFirst({
            where: { id: data.candidateId, agencyId },
        });
        if (!candidate) throw new NotFoundException('Candidate not found or unauthorized');

        const pipeline = await this.prisma.hiringPipeline.create({
            data: {
                agencyId,
                candidateId: data.candidateId,
                employerName: data.employerName,
                employerCountry: data.employerCountry,
                employerCity: data.employerCity,
                employerContact: data.employerContact,
                currentStage: data.currentStage || 'INTERVIEWING',
                expectedDeploymentDate: data.expectedDeploymentDate ? new Date(data.expectedDeploymentDate) : null,
                notes: data.notes,
            },
        });

        // Create initial stage history entry
        await this.prisma.pipelineStageHistory.create({
            data: {
                pipelineId: pipeline.id,
                stage: pipeline.currentStage,
                notes: 'Pipeline started',
            },
        });

        return pipeline;
    }

    async updateStage(agencyId: string, pipelineId: string, newStage: any, notes?: string, updatedBy?: string) {
        const pipeline = await this.prisma.hiringPipeline.findFirst({
            where: { id: pipelineId, agencyId },
            include: { stageHistory: { orderBy: { enteredAt: 'desc' }, take: 1 } },
        });
        if (!pipeline) throw new NotFoundException('Pipeline not found or unauthorized');

        const now = new Date();

        // Close previous stage history entry if exists
        if (pipeline.stageHistory && pipeline.stageHistory.length > 0) {
            const prev = pipeline.stageHistory[0];
            const duration = Math.ceil((now.getTime() - new Date(prev.enteredAt).getTime()) / (1000 * 3600 * 24));
            await this.prisma.pipelineStageHistory.update({
                where: { id: prev.id },
                data: { exitedAt: now, durationDays: duration },
            });
        }

        // Create new stage entry
        await this.prisma.pipelineStageHistory.create({
            data: {
                pipelineId,
                stage: newStage,
                notes,
                updatedBy,
            },
        });

        // Update pipeline status
        return this.prisma.hiringPipeline.update({
            where: { id: pipelineId },
            data: {
                currentStage: newStage,
                actualDeploymentDate: newStage === 'DEPLOYED' ? now : pipeline.actualDeploymentDate,
            },
        });
    }
}
