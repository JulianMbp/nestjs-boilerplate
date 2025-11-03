import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraUsuarioEntity } from '../../../../obra-usuario/infrastructure/persistence/relational/entities/obra-usuario.entity';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { RoleEntity } from '../../../../roles/infrastructure/persistence/relational/entities/role.entity';
import { RoleEnum } from '../../../../roles/roles.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

interface AsignacionObra {
  user: UserEntity;
  obra: ObraEntity;
  role: RoleEntity;
  email: string | null;
  obraName: string;
  roleName: string;
}

@Injectable()
export class ObraUsuarioSeedService {
  constructor(
    @InjectRepository(ObraUsuarioEntity)
    private obraUsuarioRepository: Repository<ObraUsuarioEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ObraEntity)
    private obraRepository: Repository<ObraEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async run() {
    console.log('🔄 Ejecutando seeders de asignación obra-usuario...');

    // Obtener todas las obras
    const obras = await this.obraRepository.find();
    console.log(`📋 Obras encontradas: ${obras.length}`);

    if (obras.length === 0) {
      console.warn('⚠️  No hay obras en la base de datos');
      return;
    }

    // Obtener todos los usuarios
    const adminGeneral = await this.userRepository.findOne({
      where: { email: 'admin.general@ingenieria.com' },
    });
    const adminObra1 = await this.userRepository.findOne({
      where: { email: 'admin.obra1@ingenieria.com' },
    });
    const adminObra2 = await this.userRepository.findOne({
      where: { email: 'admin.obra2@ingenieria.com' },
    });
    const encargadoArea1 = await this.userRepository.findOne({
      where: { email: 'encargado.area1@ingenieria.com' },
    });
    const encargadoArea2 = await this.userRepository.findOne({
      where: { email: 'encargado.area2@ingenieria.com' },
    });
    const obrero1 = await this.userRepository.findOne({
      where: { email: 'obrero.1@ingenieria.com' },
    });
    const obrero2 = await this.userRepository.findOne({
      where: { email: 'obrero.2@ingenieria.com' },
    });
    const sst1 = await this.userRepository.findOne({
      where: { email: 'sst.1@ingenieria.com' },
    });
    const compras1 = await this.userRepository.findOne({
      where: { email: 'compras.1@ingenieria.com' },
    });
    const rrhh1 = await this.userRepository.findOne({
      where: { email: 'rrhh.1@ingenieria.com' },
    });
    const consultor1 = await this.userRepository.findOne({
      where: { email: 'consultor.1@ingenieria.com' },
    });

    // Obtener roles
    const roleAdminGeneral = await this.roleRepository.findOne({
      where: { id: RoleEnum.admin_general },
    });
    const roleAdminObra = await this.roleRepository.findOne({
      where: { id: RoleEnum.admin_obra },
    });
    const roleEncargadoArea = await this.roleRepository.findOne({
      where: { id: RoleEnum.encargado_area },
    });
    const roleObrero = await this.roleRepository.findOne({
      where: { id: RoleEnum.obrero },
    });
    const roleSST = await this.roleRepository.findOne({
      where: { id: RoleEnum.sst },
    });
    const roleCompras = await this.roleRepository.findOne({
      where: { id: RoleEnum.compras },
    });
    const roleRRHH = await this.roleRepository.findOne({
      where: { id: RoleEnum.rrhh },
    });
    const roleConsultor = await this.roleRepository.findOne({
      where: { id: RoleEnum.consultor },
    });

    // Asignaciones de usuarios a obras
    const asignaciones: AsignacionObra[] = [];

    // Admin General tiene acceso a todas las obras
    if (adminGeneral && roleAdminGeneral) {
      for (const obra of obras) {
        asignaciones.push({
          user: adminGeneral,
          obra: obra,
          role: roleAdminGeneral,
          email: adminGeneral.email,
          obraName: obra.nombre,
          roleName: 'Admin General',
        });
      }
    }

    // Admin Obra 1 → Obras 1 y 2
    if (adminObra1 && roleAdminObra && obras.length >= 2) {
      asignaciones.push(
        {
          user: adminObra1,
          obra: obras[0],
          role: roleAdminObra,
          email: adminObra1.email,
          obraName: obras[0].nombre,
          roleName: 'Admin Obra',
        },
        {
          user: adminObra1,
          obra: obras[1],
          role: roleAdminObra,
          email: adminObra1.email,
          obraName: obras[1].nombre,
          roleName: 'Admin Obra',
        },
      );
    }

    // Admin Obra 2 → Obras 3 y 4
    if (adminObra2 && roleAdminObra && obras.length >= 4) {
      asignaciones.push(
        {
          user: adminObra2,
          obra: obras[2],
          role: roleAdminObra,
          email: adminObra2.email,
          obraName: obras[2].nombre,
          roleName: 'Admin Obra',
        },
        {
          user: adminObra2,
          obra: obras[3],
          role: roleAdminObra,
          email: adminObra2.email,
          obraName: obras[3].nombre,
          roleName: 'Admin Obra',
        },
      );
    }

    // Encargado Área 1 → Obra 1
    if (encargadoArea1 && roleEncargadoArea && obras.length >= 1) {
      asignaciones.push({
        user: encargadoArea1,
        obra: obras[0],
        role: roleEncargadoArea,
        email: encargadoArea1.email,
        obraName: obras[0].nombre,
        roleName: 'Encargado de Área',
      });
    }

    // Encargado Área 2 → Obra 2
    if (encargadoArea2 && roleEncargadoArea && obras.length >= 2) {
      asignaciones.push({
        user: encargadoArea2,
        obra: obras[1],
        role: roleEncargadoArea,
        email: encargadoArea2.email,
        obraName: obras[1].nombre,
        roleName: 'Encargado de Área',
      });
    }

    // Obrero 1 → Obras 1, 2, 3 (obreros trabajan en múltiples obras)
    if (obrero1 && roleObrero && obras.length >= 3) {
      asignaciones.push(
        {
          user: obrero1,
          obra: obras[0],
          role: roleObrero,
          email: obrero1.email,
          obraName: obras[0].nombre,
          roleName: 'Obrero',
        },
        {
          user: obrero1,
          obra: obras[1],
          role: roleObrero,
          email: obrero1.email,
          obraName: obras[1].nombre,
          roleName: 'Obrero',
        },
        {
          user: obrero1,
          obra: obras[2],
          role: roleObrero,
          email: obrero1.email,
          obraName: obras[2].nombre,
          roleName: 'Obrero',
        },
      );
    }

    // Obrero 2 → Obras 2, 3, 4
    if (obrero2 && roleObrero && obras.length >= 4) {
      asignaciones.push(
        {
          user: obrero2,
          obra: obras[1],
          role: roleObrero,
          email: obrero2.email,
          obraName: obras[1].nombre,
          roleName: 'Obrero',
        },
        {
          user: obrero2,
          obra: obras[2],
          role: roleObrero,
          email: obrero2.email,
          obraName: obras[2].nombre,
          roleName: 'Obrero',
        },
        {
          user: obrero2,
          obra: obras[3],
          role: roleObrero,
          email: obrero2.email,
          obraName: obras[3].nombre,
          roleName: 'Obrero',
        },
      );
    }

    // SST 1 → Obras 1 y 2
    if (sst1 && roleSST && obras.length >= 2) {
      asignaciones.push(
        {
          user: sst1,
          obra: obras[0],
          role: roleSST,
          email: sst1.email,
          obraName: obras[0].nombre,
          roleName: 'SST',
        },
        {
          user: sst1,
          obra: obras[1],
          role: roleSST,
          email: sst1.email,
          obraName: obras[1].nombre,
          roleName: 'SST',
        },
      );
    }

    // Compras 1 → Todas las obras
    if (compras1 && roleCompras) {
      for (const obra of obras) {
        asignaciones.push({
          user: compras1,
          obra: obra,
          role: roleCompras,
          email: compras1.email,
          obraName: obra.nombre,
          roleName: 'Compras',
        });
      }
    }

    // RRHH 1 → Todas las obras
    if (rrhh1 && roleRRHH) {
      for (const obra of obras) {
        asignaciones.push({
          user: rrhh1,
          obra: obra,
          role: roleRRHH,
          email: rrhh1.email,
          obraName: obra.nombre,
          roleName: 'RRHH',
        });
      }
    }

    // Consultor 1 → Obras 1 y 3
    if (consultor1 && roleConsultor && obras.length >= 3) {
      asignaciones.push(
        {
          user: consultor1,
          obra: obras[0],
          role: roleConsultor,
          email: consultor1.email,
          obraName: obras[0].nombre,
          roleName: 'Consultor',
        },
        {
          user: consultor1,
          obra: obras[2],
          role: roleConsultor,
          email: consultor1.email,
          obraName: obras[2].nombre,
          roleName: 'Consultor',
        },
      );
    }

    // Insertar asignaciones evitando duplicados
    let created = 0;
    let skipped = 0;

    for (const asignacion of asignaciones) {
      const existe = await this.obraUsuarioRepository.findOne({
        where: {
          user: { id: asignacion.user.id },
          obra: { id: asignacion.obra.id },
          role: { id: asignacion.role.id },
        },
      });

      if (!existe) {
        await this.obraUsuarioRepository.save(
          this.obraUsuarioRepository.create({
            user: asignacion.user,
            obra: asignacion.obra,
            role: asignacion.role,
            fechaAsignacion: new Date(),
          }),
        );
        console.log(
          `✅ Asignado: ${asignacion.email} → ${asignacion.obraName} (${asignacion.roleName})`,
        );
        created++;
      } else {
        skipped++;
      }
    }

    console.log(
      `✅ Seeders de obra-usuario ejecutados: ${created} creados, ${skipped} omitidos`,
    );
  }
}
