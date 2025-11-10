import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Priorizar el rol de obra_usuario (después de TenantGuard)
    // Si no está disponible, usar el rol del JWT (rol base del usuario)
    let userRoleName: string | undefined;

    if (request.obraUsuario?.role_name) {
      // Usar el rol de obra_usuario (rol específico por obra)
      userRoleName = request.obraUsuario.role_name;
    } else if (user?.role?.name) {
      // Fallback al rol del JWT (rol base del usuario)
      userRoleName = user.role.name;
    }

    if (!userRoleName) {
      throw new ForbiddenException('User role not found');
    }

    // Comparar roles (case-insensitive)
    const hasRole = requiredRoles.some(
      (role) => userRoleName.toLowerCase() === role.toLowerCase(),
    );

    if (!hasRole) {
      throw new ForbiddenException(
        `User does not have required role. Required: ${requiredRoles.join(', ')}. Current role: ${userRoleName}`,
      );
    }

    return true;
  }
}
