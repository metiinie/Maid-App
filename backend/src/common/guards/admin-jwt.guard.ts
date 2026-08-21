import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AdminJwtGuard extends AuthGuard('admin-jwt') {
    canActivate(context: ExecutionContext) {
        return super.canActivate(context);
    }

    handleRequest(err: any, admin: any) {
        if (err || !admin) {
            throw err || new UnauthorizedException('Invalid or expired admin token');
        }
        return admin;
    }
}
