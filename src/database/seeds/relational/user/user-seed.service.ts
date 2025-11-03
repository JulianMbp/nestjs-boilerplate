import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private repository: Repository<UserEntity>,
  ) {}

  async run() {
    const countAdmin = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.admin,
        },
      },
    });

    if (!countAdmin) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password,
          role: {
            id: RoleEnum.admin,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }

    const countUser = await this.repository.count({
      where: {
        role: {
          id: RoleEnum.user,
        },
      },
    });

    if (!countUser) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.repository.save(
        this.repository.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password,
          role: {
            id: RoleEnum.user,
            name: 'Admin',
          },
          status: {
            id: StatusEnum.active,
            name: 'Active',
          },
        }),
      );
    }

    // Usuarios de IngenierIA con contraseña "secret"
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('secret', salt);

    const ingenieriaUsers = [
      {
        firstName: 'Julian',
        lastName: 'Bastidas',
        email: 'admin.general@ingenieria.com',
        roleId: RoleEnum.admin_general,
        roleName: 'Admin General',
      },
      {
        firstName: 'Maria',
        lastName: 'Perez',
        email: 'admin.obra1@ingenieria.com',
        roleId: RoleEnum.admin_obra,
        roleName: 'Admin Obra',
      },
      {
        firstName: 'Carlos',
        lastName: 'Lopez',
        email: 'admin.obra2@ingenieria.com',
        roleId: RoleEnum.admin_obra,
        roleName: 'Admin Obra',
      },
      {
        firstName: 'Ana',
        lastName: 'Martinez',
        email: 'encargado.area1@ingenieria.com',
        roleId: RoleEnum.encargado_area,
        roleName: 'Encargado de Área',
      },
      {
        firstName: 'Luis',
        lastName: 'Ramirez',
        email: 'encargado.area2@ingenieria.com',
        roleId: RoleEnum.encargado_area,
        roleName: 'Encargado de Área',
      },
      {
        firstName: 'Andres',
        lastName: 'Castro',
        email: 'obrero.1@ingenieria.com',
        roleId: RoleEnum.obrero,
        roleName: 'Obrero',
      },
      {
        firstName: 'Pedro',
        lastName: 'Gomez',
        email: 'obrero.2@ingenieria.com',
        roleId: RoleEnum.obrero,
        roleName: 'Obrero',
      },
      {
        firstName: 'Sandra',
        lastName: 'Rodriguez',
        email: 'sst.1@ingenieria.com',
        roleId: RoleEnum.sst,
        roleName: 'SST',
      },
      {
        firstName: 'Roberto',
        lastName: 'Sanchez',
        email: 'compras.1@ingenieria.com',
        roleId: RoleEnum.compras,
        roleName: 'Compras',
      },
      {
        firstName: 'Laura',
        lastName: 'Hernandez',
        email: 'rrhh.1@ingenieria.com',
        roleId: RoleEnum.rrhh,
        roleName: 'RRHH',
      },
      {
        firstName: 'Miguel',
        lastName: 'Torres',
        email: 'consultor.1@ingenieria.com',
        roleId: RoleEnum.consultor,
        roleName: 'Consultor',
      },
    ];

    for (const userData of ingenieriaUsers) {
      const existingUser = await this.repository.findOne({
        where: { email: userData.email },
      });

      if (!existingUser) {
        await this.repository.save(
          this.repository.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password,
            role: {
              id: userData.roleId,
              name: userData.roleName,
            },
            status: {
              id: StatusEnum.active,
              name: 'Active',
            },
          }),
        );
        console.log(`✅ Usuario creado: ${userData.email}`);
      }
    }

    console.log('✅ Seeders de usuarios ejecutados correctamente');
  }
}
