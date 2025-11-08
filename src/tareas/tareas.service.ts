import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { TareaEntity } from './infrastructure/persistence/relational/entities/tarea.entity';
import { TareaEstado } from './tarea-estado.enum';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(TareaEntity)
    private readonly tareaRepository: Repository<TareaEntity>,
  ) {}

  async create(
    obraId: string,
    usuarioId: number,
    createTareaDto: CreateTareaDto,
  ): Promise<TareaEntity> {
    // Ensure asignado_a_id is always set (use usuarioId if not provided)
    const asignadoAId = createTareaDto.asignado_a_id ?? usuarioId;

    const tareaData: Partial<TareaEntity> = {
      titulo: createTareaDto.titulo,
      descripcion: createTareaDto.descripcion,
      estado: createTareaDto.estado || TareaEstado.PENDIENTE,
      avance_porcentaje: createTareaDto.avance_porcentaje,
      fecha_limite: createTareaDto.fecha_limite,
      fecha_inicio: createTareaDto.fecha_inicio,
      fecha_fin: createTareaDto.fecha_fin,
      obra_id: obraId,
      usuario_id: usuarioId,
      asignado_a_id: asignadoAId,
    };

    // Only set prioridad if provided (entity has default)
    if (createTareaDto.prioridad) {
      tareaData.prioridad = createTareaDto.prioridad;
    }

    const tarea = this.tareaRepository.create(tareaData);
    return this.tareaRepository.save(tarea);
  }

  async findAllByObra(obraId: string): Promise<TareaEntity[]> {
    return this.tareaRepository.find({
      where: { obra_id: obraId },
      order: { created_at: 'DESC' },
      relations: ['usuario', 'asignadoA'],
    });
  }

  async findOneByIdInObra(id: string, obraId: string): Promise<TareaEntity> {
    const tarea = await this.tareaRepository.findOne({
      where: { id, obra_id: obraId },
      relations: ['usuario', 'asignadoA'],
    });

    if (!tarea) {
      throw new NotFoundException('Task not found in this obra');
    }

    return tarea;
  }

  async updateInObra(
    id: string,
    obraId: string,
    updateTareaDto: UpdateTareaDto,
  ): Promise<TareaEntity> {
    const tarea = await this.findOneByIdInObra(id, obraId);
    
    // If asignado_a_id is being updated, ensure it's not null
    if (updateTareaDto.asignado_a_id !== undefined) {
      tarea.asignado_a_id = updateTareaDto.asignado_a_id;
    }
    
    // Update other fields
    if (updateTareaDto.titulo !== undefined) {
      tarea.titulo = updateTareaDto.titulo;
    }
    if (updateTareaDto.descripcion !== undefined) {
      tarea.descripcion = updateTareaDto.descripcion;
    }
    if (updateTareaDto.estado !== undefined) {
      tarea.estado = updateTareaDto.estado;
    }
    if (updateTareaDto.prioridad !== undefined) {
      tarea.prioridad = updateTareaDto.prioridad;
    }
    if (updateTareaDto.avance_porcentaje !== undefined) {
      tarea.avance_porcentaje = updateTareaDto.avance_porcentaje;
    }
    if (updateTareaDto.fecha_limite !== undefined) {
      tarea.fecha_limite = updateTareaDto.fecha_limite;
    }
    if (updateTareaDto.fecha_inicio !== undefined) {
      tarea.fecha_inicio = updateTareaDto.fecha_inicio;
    }
    if (updateTareaDto.fecha_fin !== undefined) {
      tarea.fecha_fin = updateTareaDto.fecha_fin;
    }

    return this.tareaRepository.save(tarea);
  }

  async deleteInObra(id: string, obraId: string): Promise<void> {
    const tarea = await this.findOneByIdInObra(id, obraId);
    await this.tareaRepository.remove(tarea);
  }
}
