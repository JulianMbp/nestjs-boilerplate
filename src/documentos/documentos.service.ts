import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { DocumentoEntity } from './infrastructure/persistence/relational/entities/documento.entity';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(DocumentoEntity)
    private readonly documentoRepository: Repository<DocumentoEntity>,
  ) {}

  private async getNextVersion(
    obraId: string,
    nombre: string,
  ): Promise<string> {
    const latestDoc = await this.documentoRepository.findOne({
      where: { obra_id: obraId, nombre },
      order: { version: 'DESC' },
    });

    if (!latestDoc) {
      return '1.0';
    }

    const currentVersion = parseFloat(latestDoc.version);
    const nextVersion = (currentVersion + 0.1).toFixed(1);
    return nextVersion;
  }

  async create(
    obraId: string,
    usuarioId: string,
    createDocumentoDto: CreateDocumentoDto,
  ): Promise<DocumentoEntity> {
    // Auto-increment version based on nombre
    const version =
      createDocumentoDto.version ||
      (await this.getNextVersion(obraId, createDocumentoDto.nombre));

    const documento = this.documentoRepository.create({
      ...createDocumentoDto,
      obra_id: obraId,
      usuario_id: usuarioId,
      version,
    });
    return this.documentoRepository.save(documento);
  }

  async findAllByObra(obraId: string): Promise<DocumentoEntity[]> {
    return this.documentoRepository.find({
      where: { obra_id: obraId },
      order: { created_at: 'DESC' },
      relations: ['usuario'],
    });
  }

  async findOneByIdInObra(
    id: string,
    obraId: string,
  ): Promise<DocumentoEntity> {
    const documento = await this.documentoRepository.findOne({
      where: { id, obra_id: obraId },
      relations: ['usuario'],
    });

    if (!documento) {
      throw new NotFoundException('Document not found in this obra');
    }

    return documento;
  }

  async updateInObra(
    id: string,
    obraId: string,
    updateDocumentoDto: UpdateDocumentoDto,
  ): Promise<DocumentoEntity> {
    const documento = await this.findOneByIdInObra(id, obraId);

    // If nombre is being updated, calculate new version
    if (
      updateDocumentoDto.nombre &&
      updateDocumentoDto.nombre !== documento.nombre
    ) {
      const newVersion = await this.getNextVersion(
        obraId,
        updateDocumentoDto.nombre,
      );
      Object.assign(documento, { ...updateDocumentoDto, version: newVersion });
    } else {
      Object.assign(documento, updateDocumentoDto);
    }

    return this.documentoRepository.save(documento);
  }

  async deleteInObra(id: string, obraId: string): Promise<void> {
    const documento = await this.findOneByIdInObra(id, obraId);
    await this.documentoRepository.remove(documento);
  }
}
