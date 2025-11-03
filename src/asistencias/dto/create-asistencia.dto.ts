import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { AsistenciaEstado } from '../asistencia-estado.enum';

export class CreateAsistenciaDto {
  @ApiPropertyOptional({ description: 'Date of attendance' })
  @IsOptional()
  @IsDateString()
  @Transform(({ value }) => value || new Date().toISOString().split('T')[0])
  fecha?: Date;

  @ApiProperty({
    description: 'Attendance status',
    enum: AsistenciaEstado,
  })
  @IsEnum(AsistenciaEstado)
  @IsNotEmpty()
  estado: AsistenciaEstado;

  @ApiPropertyOptional({ description: 'Additional observations or notes' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
