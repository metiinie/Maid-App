import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminJwtGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid authorization header');
        }

        const token = authHeader.split(' ')[1];
        try {
            const secret = this.configService.get<string>('JWT_SECRET') || 'supersecretkey123';
            const payload = this.jwtService.verify(token, { secret });

            // Reject non-admin tokens (e.g. candidate or employer user tokens)
            if (payload.type === 'USER' && !payload.role && !payload.agencyId) {
                throw new ForbiddenException('Access denied: Agency Admin credentials required');
            }

            request.user = payload;
            request.admin = payload;
            return true;
        } catch (err) {
            if (err instanceof ForbiddenException) throw err;
            throw new UnauthorizedException('Invalid or expired admin token');
        }
    }
}
