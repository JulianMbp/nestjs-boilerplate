import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleEnum } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<(number | string)[]>(
      'roles',
      [context.getClass(), context.getHandler()],
    );
    if (!roles.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Verificar si el rol del usuario coincide con los roles permitidos
    const hasRole = roles.some((role) => {
      if (typeof role === 'string') {
        // Si es un string, buscar el enum correspondiente
        const roleEnum = this.getRoleEnumByName(role);
        return roleEnum && String(user?.role?.id) === String(roleEnum);
      }
      return String(user?.role?.id) === String(role);
    });

    if (!hasRole) {
      throw new UnauthorizedException(
        'No tienes los permisos necesarios para acceder a este recurso',
      );
    }

    // Verificar si se requiere obra_id
    const requiereObra = this.reflector.getAllAndOverride<boolean>(
      'requiere_obra',
      [context.getClass(), context.getHandler()],
    );

    if (requiereObra && !user?.obra_id) {
      throw new UnauthorizedException(
        'Debes especificar una obra para acceder a este recurso',
      );
    }

    return true;
  }

  private getRoleEnumByName(roleName: string): number | null {
    const roleMap: { [key: string]: number } = {
      admin: RoleEnum.admin,
      user: RoleEnum.user,
      admin_general: RoleEnum.admin_general,
      admin_obra: RoleEnum.admin_obra,
      encargado_area: RoleEnum.encargado_area,
      obrero: RoleEnum.obrero,
      sst: RoleEnum.sst,
      compras: RoleEnum.compras,
      rrhh: RoleEnum.rrhh,
      consultor: RoleEnum.consultor,
    };

    return roleMap[roleName] ?? null;
  }
}
