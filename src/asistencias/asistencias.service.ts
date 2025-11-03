import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAsistenciaDto } from './dto/create-asistencia.dto';
import { UpdateAsistenciaDto } from './dto/update-asistencia.dto';
import { AsistenciaEntity } from './infrastructure/persistence/relational/entities/asistencia.entity';

@Injectable()
export class AsistenciasService {
  constructor(
    @InjectRepository(AsistenciaEntity)
    private readonly asistenciaRepository: Repository<AsistenciaEntity>,
  ) {}

  async create(
    obraId: string,
    usuarioId: number,
    createAsistenciaDto: CreateAsistenciaDto,
  ): Promise<AsistenciaEntity> {
    // Check for duplicate attendance record
    const existing = await this.asistenciaRepository.findOne({
      where: {
        obra_id: obraId,
        usuario_id: usuarioId,
        fecha: createAsistenciaDto.fecha || new Date(),
      },
    });

    if (existing) {
      throw new ConflictException(
        'Attendance record already exists for this user on this date',
      );
    }

    const asistencia = this.asistenciaRepository.create({
      ...createAsistenciaDto,
      obra_id: obraId,
      usuario_id: usuarioId,
    });
    return this.asistenciaRepository.save(asistencia);
  }

  async findAllByObra(obraId: string): Promise<AsistenciaEntity[]> {
    return this.asistenciaRepository.find({
      where: { obra_id: obraId },
      order: { fecha: 'DESC', created_at: 'DESC' },
      relations: ['usuario'],
    });
  }

  async findOneByIdInObra(
    id: string,
    obraId: string,
  ): Promise<AsistenciaEntity> {
    const asistencia = await this.asistenciaRepository.findOne({
      where: { id, obra_id: obraId },
      relations: ['usuario'],
    });

    if (!asistencia) {
      throw new NotFoundException('Attendance record not found in this obra');
    }

    return asistencia;
  }

  async updateInObra(
    id: string,
    obraId: string,
    updateAsistenciaDto: UpdateAsistenciaDto,
  ): Promise<AsistenciaEntity> {
    const asistencia = await this.findOneByIdInObra(id, obraId);
    Object.assign(asistencia, updateAsistenciaDto);
    return this.asistenciaRepository.save(asistencia);
  }

  async deleteInObra(id: string, obraId: string): Promise<void> {
    const asistencia = await this.findOneByIdInObra(id, obraId);
    await this.asistenciaRepository.remove(asistencia);
  }
}
