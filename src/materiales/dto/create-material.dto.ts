import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { MaterialEstado } from '../material-estado.enum';

export class CreateMaterialDto {
  @ApiPropertyOptional()
  @IsString()
  nombre: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  cantidad?: number;

  @ApiPropertyOptional({
    description: 'Cantidad disponible actualmente',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  cantidad_disponible?: number;

  @ApiPropertyOptional({
    description: 'Cantidad total requerida',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  cantidad_requerida?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  unidad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  proveedor?: string;

  @ApiPropertyOptional({
    description: 'Estado del material',
    enum: MaterialEstado,
    default: MaterialEstado.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(MaterialEstado)
  estado?: MaterialEstado;
}
