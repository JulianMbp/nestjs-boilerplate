import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class GenerarBitacoraAiDto {
  @ApiPropertyOptional({
    description:
      'Fecha de la bitácora (formato ISO). Si no se proporciona, se usa la fecha actual',
  })
  @IsOptional()
  @IsString()
  fecha?: string;

  @ApiPropertyOptional({ description: 'Condiciones climáticas' })
  @IsOptional()
  @IsString()
  clima?: string;

  @ApiProperty({
    description: 'Lista de actividades realizadas',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  actividades: string[];

  @ApiPropertyOptional({
    description: 'Incidencias o riesgos detectados',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  incidencias?: string[];

  @ApiProperty({
    description: 'Porcentaje de avance general (0-100)',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  avanceGeneral: number;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
