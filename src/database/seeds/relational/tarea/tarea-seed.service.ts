import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { TareaEntity } from '../../../../tareas/infrastructure/persistence/relational/entities/tarea.entity';
import { TareaEstado } from '../../../../tareas/tarea-estado.enum';
import { TareaPrioridad } from '../../../../tareas/tarea-prioridad.enum';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class TareaSeedService {
  constructor(
    @InjectRepository(TareaEntity)
    private tareaRepository: Repository<TareaEntity>,
    @InjectRepository(ObraEntity)
    private obraRepository: Repository<ObraEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    console.log('🔄 Ejecutando seeders de tareas...');

    // Obtener obras
    const obras = await this.obraRepository.find();
    if (obras.length === 0) {
      console.log('⚠️  No hay obras disponibles. Por favor ejecuta primero el seeder de obras.');
      return;
    }

    // Obtener usuarios
    const usuarios = await this.userRepository.find({
      take: 5,
    });

    if (usuarios.length === 0) {
      console.log('⚠️  No hay usuarios disponibles. Por favor ejecuta primero el seeder de usuarios.');
      return;
    }

    // Crear tareas de ejemplo para cada obra
    for (const obra of obras) {
      const tareasCount = await this.tareaRepository.count({
        where: { obra_id: obra.id },
      });

      if (tareasCount > 0) {
        console.log(`⚠️  La obra "${obra.nombre}" ya tiene tareas. Omitiendo...`);
        continue;
      }

      // Obtener usuarios asignados a esta obra
      const obraUsuarios = usuarios.slice(0, Math.min(3, usuarios.length));
      const creador = obraUsuarios[0];
      const asignado1 = obraUsuarios[0] || usuarios[0];
      const asignado2 = obraUsuarios[1] || usuarios[0];
      const asignado3 = obraUsuarios[2] || usuarios[0];

      const tareas = [
        {
          obra_id: obra.id,
          usuario_id: creador.id,
          asignado_a_id: asignado1.id,
          titulo: 'Revisión de planos arquitectónicos',
          descripcion: 'Revisar y aprobar los planos arquitectónicos de la estructura principal',
          estado: TareaEstado.EN_PROGRESO,
          prioridad: TareaPrioridad.ALTA,
          avance_porcentaje: 45,
          fecha_inicio: new Date('2025-11-01'),
          fecha_limite: new Date('2025-11-15'),
        },
        {
          obra_id: obra.id,
          usuario_id: creador.id,
          asignado_a_id: asignado2.id,
          titulo: 'Preparación del terreno',
          descripcion: 'Nivelación y preparación del terreno para la construcción',
          estado: TareaEstado.PENDIENTE,
          prioridad: TareaPrioridad.ALTA,
          avance_porcentaje: 0,
          fecha_inicio: new Date('2025-11-05'),
          fecha_limite: new Date('2025-11-20'),
        },
        {
          obra_id: obra.id,
          usuario_id: creador.id,
          asignado_a_id: asignado3.id,
          titulo: 'Compra de materiales de construcción',
          descripcion: 'Gestionar la compra de cemento, varillas y otros materiales necesarios',
          estado: TareaEstado.PENDIENTE,
          prioridad: TareaPrioridad.MEDIA,
          avance_porcentaje: 0,
          fecha_limite: new Date('2025-11-25'),
        },
        {
          obra_id: obra.id,
          usuario_id: creador.id,
          asignado_a_id: asignado1.id,
          titulo: 'Instalación de servicios básicos',
          descripcion: 'Coordinación con empresas de servicios públicos para instalación de agua, luz y gas',
          estado: TareaEstado.PENDIENTE,
          prioridad: TareaPrioridad.MEDIA,
          avance_porcentaje: 0,
          fecha_limite: new Date('2025-12-01'),
        },
        {
          obra_id: obra.id,
          usuario_id: creador.id,
          asignado_a_id: asignado2.id,
          titulo: 'Supervisión de cimentación',
          descripcion: 'Supervisar el proceso de cimentación y asegurar que cumpla con los estándares',
          estado: TareaEstado.COMPLETADA,
          prioridad: TareaPrioridad.URGENTE,
          avance_porcentaje: 100,
          fecha_inicio: new Date('2025-10-15'),
          fecha_fin: new Date('2025-10-30'),
          fecha_limite: new Date('2025-10-30'),
        },
      ];

      await this.tareaRepository.save(
        tareas.map((tarea) => this.tareaRepository.create(tarea)),
      );

      console.log(`✅ ${tareas.length} tareas creadas para la obra "${obra.nombre}"`);
    }

    console.log('✅ Seeders de tareas ejecutados correctamente');
  }
}

