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
    const roles = this.reflector.getAllAndOverride<(number | string)[]>(
      'roles',
      [context.getClass(), context.getHandler()],
    );

    if (!roles || !roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new UnauthorizedException(
        'User role information is missing from token',
      );
    }

    // Get user's role ID and name
    const userRoleId = user.role?.id;
    const userRoleName = user.role?.name?.toLowerCase() || '';

    if (!userRoleId && !userRoleName) {
      throw new UnauthorizedException(
        'User role information is invalid in token',
      );
    }

    // Check if user's role matches any of the allowed roles
    // Roles can be: RoleEnum (number) or role name (string)
    const hasRole = roles.some((allowedRole) => {
      // If allowedRole is a number (RoleEnum), compare by ID
      if (typeof allowedRole === 'number') {
        return userRoleId === allowedRole;
      }

      // If allowedRole is a string, compare by name (case-insensitive)
      if (typeof allowedRole === 'string') {
        const allowedRoleLower = allowedRole.toLowerCase();
        // Check exact match or if role name contains the allowed role
        return (
          userRoleName === allowedRoleLower ||
          userRoleName.includes(allowedRoleLower)
        );
      }

      return false;
    });

    if (!hasRole) {
      throw new UnauthorizedException(
        `You do not have the necessary permissions to access this resource. Required roles: ${roles.join(', ')}. Your role: ${userRoleName || userRoleId}`,
      );
    }

    return true;
  }
}
