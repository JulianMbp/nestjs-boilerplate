import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BitacoraEntity } from '../../../../bitacoras/infrastructure/persistence/relational/entities/bitacora.entity';
import { MaterialEntity } from '../../../../materiales/infrastructure/persistence/relational/entities/material.entity';
import { ObraEntity } from '../../../../obras/infrastructure/persistence/relational/entities/obra.entity';
import { UserEntity } from '../../../../users/infrastructure/persistence/relational/entities/user.entity';

@Injectable()
export class IngenieriaDemoDataSeedService {
  constructor(
    @InjectRepository(MaterialEntity)
    private materialRepository: Repository<MaterialEntity>,
    @InjectRepository(BitacoraEntity)
    private bitacoraRepository: Repository<BitacoraEntity>,
    @InjectRepository(ObraEntity)
    private obraRepository: Repository<ObraEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async run() {
    console.log('🔄 Ejecutando seeders de datos de demostración...');

    const obras = await this.obraRepository.find();

    if (obras.length === 0) {
      console.warn('⚠️  No hay obras en la base de datos');
      return;
    }

    let materialesCreados = 0;

    // Datos para cada obra
    for (const obra of obras) {
      // Materiales de ejemplo por obra
      const materiales = this.getMaterialesPorObra(obra.nombre);

      for (const materialData of materiales) {
        const existe = await this.materialRepository.findOne({
          where: {
            obra_id: obra.id,
            nombre: materialData.nombre,
          },
        });

        if (!existe) {
          await this.materialRepository.save(
            this.materialRepository.create({
              obra_id: obra.id,
              nombre: materialData.nombre,
              categoria: materialData.categoria,
              cantidad: materialData.cantidad,
              unidad: materialData.unidad,
              proveedor: materialData.proveedor,
            }),
          );
          materialesCreados++;
        }
      }
    }

    console.log(
      `✅ Seeders de datos demo: ${materialesCreados} materiales creados`,
    );
    console.log(
      '⚠️  Nota: Seeders de bitácoras requieren migración de UsuarioEntity → UserEntity',
    );
  }

  private getMaterialesPorObra(obraNombre: string) {
    const materialesBase = [
      {
        nombre: 'Cemento Gris x 50kg',
        categoria: 'Cementos',
        cantidad: 500,
        unidad: 'bulto',
        proveedor: 'Cementos Argos',
      },
      {
        nombre: 'Varilla 3/8"',
        categoria: 'Acero',
        cantidad: 200,
        unidad: 'varilla',
        proveedor: 'Acerías Paz del Río',
      },
      {
        nombre: 'Arena Lavada',
        categoria: 'Agregados',
        cantidad: 50,
        unidad: 'm3',
        proveedor: 'Materiales El Constructor',
      },
      {
        nombre: 'Grava',
        categoria: 'Agregados',
        cantidad: 40,
        unidad: 'm3',
        proveedor: 'Materiales El Constructor',
      },
      {
        nombre: 'Ladrillo Tolete',
        categoria: 'Mampostería',
        cantidad: 10000,
        unidad: 'unidad',
        proveedor: 'Ladrillera Santafé',
      },
    ];

    // Materiales específicos según el tipo de obra
    if (obraNombre.includes('Edificio') || obraNombre.includes('Torre')) {
      materialesBase.push(
        {
          nombre: 'Placa Superboard 8mm',
          categoria: 'Acabados',
          cantidad: 150,
          unidad: 'placa',
          proveedor: 'Eternit Colombia',
        },
        {
          nombre: 'Ventana Aluminio 1x1.5m',
          categoria: 'Carpintería Metálica',
          cantidad: 80,
          unidad: 'unidad',
          proveedor: 'Aluminios del Caribe',
        },
      );
    }

    if (obraNombre.includes('Residencial') || obraNombre.includes('Conjunto')) {
      materialesBase.push(
        {
          nombre: 'Piso Porcelanato 60x60',
          categoria: 'Pisos',
          cantidad: 800,
          unidad: 'm2',
          proveedor: 'Corona',
        },
        {
          nombre: 'Puerta Tambor 0.80x2.05m',
          categoria: 'Carpintería',
          cantidad: 45,
          unidad: 'unidad',
          proveedor: 'Puertas y Ventanas Ltda',
        },
      );
    }

    if (obraNombre.includes('Comercial') || obraNombre.includes('Centro')) {
      materialesBase.push(
        {
          nombre: 'Vidrio Templado 10mm',
          categoria: 'Vidrios',
          cantidad: 120,
          unidad: 'm2',
          proveedor: 'Vidrios y Espejos S.A.',
        },
        {
          nombre: 'Baldosa Antideslizante',
          categoria: 'Pisos',
          cantidad: 600,
          unidad: 'm2',
          proveedor: 'Corona',
        },
      );
    }

    return materialesBase;
  }
}
