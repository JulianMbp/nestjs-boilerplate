import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePresupuestoDto {
  @ApiProperty({ description: 'Budget item name' })
  @IsString()
  @IsNotEmpty()
  partida: string;

  @ApiPropertyOptional({ description: 'Unit of measurement' })
  @IsOptional()
  @IsString()
  unidad?: string;

  @ApiProperty({ description: 'Quantity', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  cantidad: number;

  @ApiProperty({ description: 'Unit price', minimum: 0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  valor_unitario: number;

  @ApiPropertyOptional({
    description: 'Executed value',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseFloat(value) : 0))
  valor_ejecutado?: number;
}
