import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBitacoraDto } from './dto/create-bitacora.dto';
import { UpdateBitacoraDto } from './dto/update-bitacora.dto';
import { BitacoraEntity } from './infrastructure/persistence/relational/entities/bitacora.entity';

@Injectable()
export class BitacorasService {
  constructor(
    @InjectRepository(BitacoraEntity)
    private readonly bitacoraRepository: Repository<BitacoraEntity>,
  ) {}

  async create(
    obraId: string,
    usuarioId: number,
    createBitacoraDto: CreateBitacoraDto,
  ): Promise<BitacoraEntity> {
    const bitacora = this.bitacoraRepository.create({
      ...createBitacoraDto,
      obra_id: obraId,
      usuario_id: usuarioId,
    });
    return this.bitacoraRepository.save(bitacora);
  }

  async findAllByObra(obraId: string): Promise<BitacoraEntity[]> {
    return this.bitacoraRepository.find({
      where: { obra_id: obraId },
      order: { fecha: 'DESC', created_at: 'DESC' },
      relations: ['usuario'],
    });
  }

  async findOneByIdInObra(id: string, obraId: string): Promise<BitacoraEntity> {
    const bitacora = await this.bitacoraRepository.findOne({
      where: { id, obra_id: obraId },
      relations: ['usuario'],
    });

    if (!bitacora) {
      throw new NotFoundException('Bitácora not found in this obra');
    }

    return bitacora;
  }

  async updateInObra(
    id: string,
    obraId: string,
    usuarioId: number,
    updateBitacoraDto: UpdateBitacoraDto,
  ): Promise<BitacoraEntity> {
    const bitacora = await this.findOneByIdInObra(id, obraId);

    // Only the author can update their own bitacora
    if (bitacora.usuario_id !== usuarioId) {
      throw new UnauthorizedException('You can only update your own bitácoras');
    }

    Object.assign(bitacora, updateBitacoraDto);
    return this.bitacoraRepository.save(bitacora);
  }

  async deleteInObra(
    id: string,
    obraId: string,
    usuarioId: number,
  ): Promise<void> {
    const bitacora = await this.findOneByIdInObra(id, obraId);

    // Only the author can delete their own bitacora
    if (bitacora.usuario_id !== usuarioId) {
      throw new UnauthorizedException('You can only delete your own bitácoras');
    }

    await this.bitacoraRepository.remove(bitacora);
  }
}
