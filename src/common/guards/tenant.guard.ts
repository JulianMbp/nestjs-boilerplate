import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraUsuarioEntity } from '../../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(
    @InjectRepository(ObraUsuarioEntity)
    private readonly obraUsuarioRepository: Repository<ObraUsuarioEntity>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Extract obra_id from JWT payload
    const obraIdFromJWT = user.obra_id;

    // Also check if obra_id is in route params (for nested routes like /obras/:obraId/...)
    const obraIdFromParams = request.params?.obraId;

    const obraId = obraIdFromJWT || obraIdFromParams;

    if (!obraId) {
      throw new ForbiddenException('No obra context found');
    }

    // Verify user has access to this obra
    const obraUsuario = await this.obraUsuarioRepository.findOne({
      where: {
        user_id: user.id,
        obra_id: obraId,
      },
    });

    if (!obraUsuario) {
      throw new ForbiddenException('User does not have access to this obra');
    }

    // Inject obra_id into request for later use
    request.obraId = obraId;
    request.obraUsuario = obraUsuario;

    return true;
  }
}
