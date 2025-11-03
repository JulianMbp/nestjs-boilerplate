import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class ObraSeedService {
  constructor(
    @InjectRepository(ObraEntity)
    private obraRepository: Repository<ObraEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    console.log('🔄 Ejecutando seeders de obras...');

    // Obtener usuarios admin para asignar como administradores
    const adminGeneral = await this.userRepository.findOne({
      where: { email: 'admin.general@ingenieria.com' },
    });

    const adminObra1 = await this.userRepository.findOne({
      where: { email: 'admin.obra1@ingenieria.com' },
    });

    const adminObra2 = await this.userRepository.findOne({
      where: { email: 'admin.obra2@ingenieria.com' },
    });

    // Obra 1: Edificio Central Plaza
    const countObra1 = await this.obraRepository.count({
      where: { nombre: 'Edificio Central Plaza' },
    });

    if (!countObra1) {
      await this.obraRepository.save(
        this.obraRepository.create({
          nombre: 'Edificio Central Plaza',
          direccion: 'Calle 100 #15-20, Bogotá D.C.',
          admin_id: adminObra1?.id || adminGeneral?.id,
        }),
      );
      console.log('✅ Obra creada: Edificio Central Plaza');
    }

    // Obra 2: Torre Empresarial Norte
    const countObra2 = await this.obraRepository.count({
      where: { nombre: 'Torre Empresarial Norte' },
    });

    if (!countObra2) {
      await this.obraRepository.save(
        this.obraRepository.create({
          nombre: 'Torre Empresarial Norte',
          direccion: 'Av. El Poblado #43-50, Medellín',
          admin_id: adminObra2?.id || adminGeneral?.id,
        }),
      );
      console.log('✅ Obra creada: Torre Empresarial Norte');
    }

    // Obra 3: Conjunto Residencial Alameda
    const countObra3 = await this.obraRepository.count({
      where: { nombre: 'Conjunto Residencial Alameda' },
    });

    if (!countObra3) {
      await this.obraRepository.save(
        this.obraRepository.create({
          nombre: 'Conjunto Residencial Alameda',
          direccion: 'Calle 170 #54-32, Bogotá D.C.',
          admin_id: adminGeneral?.id,
        }),
      );
      console.log('✅ Obra creada: Conjunto Residencial Alameda');
    }

    // Obra 4: Centro Comercial Portal del Sur
    const countObra4 = await this.obraRepository.count({
      where: { nombre: 'Centro Comercial Portal del Sur' },
    });

    if (!countObra4) {
      await this.obraRepository.save(
        this.obraRepository.create({
          nombre: 'Centro Comercial Portal del Sur',
          direccion: 'Autopista Sur Km 5, Bogotá D.C.',
          admin_id: adminObra1?.id || adminGeneral?.id,
        }),
      );
      console.log('✅ Obra creada: Centro Comercial Portal del Sur');
    }

    console.log('✅ Seeders de obras ejecutados correctamente');
  }
}
