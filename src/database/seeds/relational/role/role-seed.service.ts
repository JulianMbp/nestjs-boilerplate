import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(
    @InjectRepository(RoleEntity)
    private repository: Repository<RoleEntity>,
  ) {}

  async run() {
    console.log('🔄 Ejecutando seeder de roles...\n');

    // Crear roles base (User y Admin)
    const countUser = await this.repository.count({
      where: {
        id: RoleEnum.user,
      },
    });

    if (!countUser) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.user,
          name: 'User',
          descripcion: 'Usuario regular del sistema',
        }),
      );
      console.log('✅ Rol creado: User (id: 2)');
    } else {
      console.log('ℹ️  Rol User ya existe (id: 2)');
    }

    const countAdmin = await this.repository.count({
      where: {
        id: RoleEnum.admin,
      },
    });

    if (!countAdmin) {
      await this.repository.save(
        this.repository.create({
          id: RoleEnum.admin,
          name: 'Admin',
          descripcion: 'Administrador del sistema',
        }),
      );
      console.log('✅ Rol creado: Admin (id: 1)');
    } else {
      console.log('ℹ️  Rol Admin ya existe (id: 1)');
    }

    // Roles IngenierIA
    const rolesIngenierIA = [
      {
        id: RoleEnum.admin_general,
        name: 'Admin General',
        descripcion: 'Administrador general del sistema IngenierIA',
      },
      {
        id: RoleEnum.admin_obra,
        name: 'Admin Obra',
        descripcion: 'Administrador de una obra específica',
      },
      {
        id: RoleEnum.encargado_area,
        name: 'Encargado de Área',
        descripcion: 'Responsable de un área dentro de la obra',
      },
      {
        id: RoleEnum.obrero,
        name: 'Obrero',
        descripcion: 'Trabajador operativo de la obra',
      },
      {
        id: RoleEnum.sst,
        name: 'SST',
        descripcion: 'Responsable de Seguridad y Salud en el Trabajo',
      },
      {
        id: RoleEnum.compras,
        name: 'Compras',
        descripcion: 'Encargado de compras y suministros',
      },
      {
        id: RoleEnum.rrhh,
        name: 'RRHH',
        descripcion: 'Recursos Humanos',
      },
      {
        id: RoleEnum.consultor,
        name: 'Consultor',
        descripcion: 'Consultor externo del proyecto',
      },
    ];

    for (const roleData of rolesIngenierIA) {
      const existingRole = await this.repository.findOne({
        where: {
          id: roleData.id,
        },
      });

      if (!existingRole) {
        // Crear el rol si no existe
        await this.repository.save(this.repository.create(roleData));
        console.log(
          `✅ Rol creado: ${roleData.name} (id: ${roleData.id})`,
        );
      } else {
        // Actualizar el rol si existe pero ha cambiado
        if (
          existingRole.name !== roleData.name ||
          existingRole.descripcion !== roleData.descripcion
        ) {
          await this.repository.update(roleData.id, {
            name: roleData.name,
            descripcion: roleData.descripcion,
          });
          console.log(
            `🔄 Rol actualizado: ${roleData.name} (id: ${roleData.id})`,
          );
        } else {
          console.log(
            `ℹ️  Rol ${roleData.name} ya existe (id: ${roleData.id})`,
          );
        }
      }
    }

    console.log('✅ Seeder de roles ejecutado correctamente\n');
  }
}
