import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getClass(),
      context.getHandler(),
    ]);

    if (!roles || !roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role || !user.role.name) {
      throw new UnauthorizedException(
        'User role information is missing from token',
      );
    }

    // Check if user's role name matches any of the allowed roles
    const hasRole = roles.some((role) =>
      user.role.name.toLowerCase().includes(role.toLowerCase()),
    );

    if (!hasRole) {
      throw new UnauthorizedException(
        `You do not have the necessary permissions to access this resource. Required roles: ${roles.join(', ')}`,
      );
    }

    return true;
  }
}
