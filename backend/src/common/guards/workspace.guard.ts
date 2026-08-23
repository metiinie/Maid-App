import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest();
        const user = req.user;

        if (!user) {
            throw new UnauthorizedException('Authentication required');
        }

        const workspaceId = (req.headers['x-workspace-id'] as string) || 'personal';

        if (workspaceId === 'personal') {
            req.workspace = { id: 'personal', type: 'PERSONAL', role: 'JOB_SEEKER' };
            return true;
        }

        if (workspaceId === 'admin') {
            const userDb: any = await this.prisma.user.findUnique({ where: { id: user.sub || user.id } });
            if (!userDb?.isPlatformAdmin && user.role !== 'SUPER_ADMIN') {
                throw new ForbiddenException('Access denied to Platform Admin workspace');
            }
            req.workspace = { id: 'admin', type: 'PLATFORM_ADMIN', role: 'SUPER_ADMIN' };
            return true;
        }

        // Validate organization membership
        const membership = await (this.prisma as any).organizationMember.findFirst({
            where: {
                userId: user.sub || user.id,
                organizationId: workspaceId,
                isActive: true,
            },
            include: { organization: true },
        });

        if (!membership) {
            throw new ForbiddenException('Access denied to requested organization workspace');
        }

        req.workspace = {
            id: membership.organizationId,
            type: membership.organization.type,
            role: membership.role,
            organizationName: membership.organization.name,
        };

        return true;
    }
}
