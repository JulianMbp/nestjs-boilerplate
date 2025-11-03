import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraUsuarioEntity } from '../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { RoleEntity } from '../roles/infrastructure/persistence/relational/entities/role.entity';
import { UserEntity } from '../users/infrastructure/persistence/relational/entities/user.entity';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Obra } from './domain/obra';
import { CreateObraDto } from './dto/create-obra.dto';
import { UpdateObraDto } from './dto/update-obra.dto';
import { ObrasRelationalRepository } from './infrastructure/persistence/relational/repositories/obras.repository';

@Injectable()
export class ObrasService {
  constructor(
    private readonly obrasRepository: ObrasRelationalRepository,
    @InjectRepository(ObraUsuarioEntity)
    private readonly obraUsuarioRepository: Repository<ObraUsuarioEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
  ) {}

  async create(createObraDto: CreateObraDto): Promise<Obra> {
    const obra = new Obra();
    obra.nombre = createObraDto.nombre;
    obra.direccion = createObraDto.direccion;

    const createdObra = await this.obrasRepository.create(obra);

    // Si se proporcionó un administrador, crear la asignación
    if (createObraDto.administradorId) {
      const user = await this.userRepository.findOne({
        where: { id: createObraDto.administradorId },
      });

      if (user) {
        const adminRole = await this.roleRepository.findOne({
          where: { name: 'Admin Obra' },
        });

        if (adminRole) {
          await this.asignarUsuarioObra(user.id, createdObra.id, adminRole.id);
        }
      }
    }

    return createdObra;
  }

  async findAll(paginationOptions: IPaginationOptions): Promise<Obra[]> {
    return this.obrasRepository.findAllWithPagination({
      paginationOptions,
    });
  }

  async findOne(id: string): Promise<Obra> {
    const obra = await this.obrasRepository.findById(id);
    if (!obra) {
      throw new NotFoundException(`Obra con ID ${id} no encontrada`);
    }
    return obra;
  }

  async update(id: string, updateObraDto: UpdateObraDto): Promise<Obra> {
    const obra = await this.obrasRepository.findById(id);
    if (!obra) {
      throw new NotFoundException(`Obra con ID ${id} no encontrada`);
    }

    return this.obrasRepository.update(id, updateObraDto);
  }

  async remove(id: string): Promise<void> {
    const obra = await this.obrasRepository.findById(id);
    if (!obra) {
      throw new NotFoundException(`Obra con ID ${id} no encontrada`);
    }

    await this.obrasRepository.remove(id);
  }

  async asignarUsuarioObra(
    userId: number,
    obraId: string,
    roleId: number,
  ): Promise<ObraUsuarioEntity> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
    }

    const obra = await this.obrasRepository.findById(obraId);
    if (!obra) {
      throw new NotFoundException(`Obra con ID ${obraId} no encontrada`);
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Rol con ID ${roleId} no encontrado`);
    }

    const asignacion = this.obraUsuarioRepository.create({
      user,
      obra: { id: obraId } as any,
      role,
      fechaAsignacion: new Date(),
    });

    return this.obraUsuarioRepository.save(asignacion);
  }

  async obtenerUsuariosObra(obraId: string): Promise<ObraUsuarioEntity[]> {
    return this.obraUsuarioRepository.find({
      where: { obra: { id: obraId } },
      relations: ['user', 'role'],
    });
  }
}
