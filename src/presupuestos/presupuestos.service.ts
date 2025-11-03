import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { PresupuestoEntity } from './infrastructure/persistence/relational/entities/presupuesto.entity';

export interface PresupuestoWithTotal extends PresupuestoEntity {
  valor_total: number;
}

@Injectable()
export class PresupuestosService {
  constructor(
    @InjectRepository(PresupuestoEntity)
    private readonly presupuestoRepository: Repository<PresupuestoEntity>,
  ) {}

  private calculateTotal(presupuesto: PresupuestoEntity): PresupuestoWithTotal {
    const valor_total =
      parseFloat(presupuesto.cantidad.toString()) *
      parseFloat(presupuesto.valor_unitario.toString());
    return { ...presupuesto, valor_total } as PresupuestoWithTotal;
  }

  async create(
    obraId: string,
    createPresupuestoDto: CreatePresupuestoDto,
  ): Promise<PresupuestoWithTotal> {
    const presupuesto = this.presupuestoRepository.create({
      ...createPresupuestoDto,
      obra_id: obraId,
    });
    const saved = await this.presupuestoRepository.save(presupuesto);
    return this.calculateTotal(saved);
  }

  async findAllByObra(obraId: string): Promise<PresupuestoWithTotal[]> {
    const presupuestos = await this.presupuestoRepository.find({
      where: { obra_id: obraId },
      order: { created_at: 'DESC' },
    });
    return presupuestos.map((p) => this.calculateTotal(p));
  }

  async findOneByIdInObra(
    id: string,
    obraId: string,
  ): Promise<PresupuestoWithTotal> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Budget item not found in this obra');
    }

    return this.calculateTotal(presupuesto);
  }

  async updateInObra(
    id: string,
    obraId: string,
    updatePresupuestoDto: UpdatePresupuestoDto,
  ): Promise<PresupuestoWithTotal> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Budget item not found in this obra');
    }

    Object.assign(presupuesto, updatePresupuestoDto);
    const saved = await this.presupuestoRepository.save(presupuesto);
    return this.calculateTotal(saved);
  }

  async deleteInObra(id: string, obraId: string): Promise<void> {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id, obra_id: obraId },
    });

    if (!presupuesto) {
      throw new NotFoundException('Budget item not found in this obra');
    }

    await this.presupuestoRepository.remove(presupuesto);
  }
}
