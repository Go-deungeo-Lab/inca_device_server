import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QaPasswordGuard implements CanActivate {
    constructor(private configService: ConfigService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const { password } = request.body;

        const qaPassword = this.configService.get<string>('QA_PASSWORD', '!incasys0');

        if (!password) {
            throw new UnauthorizedException('QA password is required');
        }

        if (password !== qaPassword) {
            throw new UnauthorizedException('Invalid QA password');
        }

        return true;
    }
}