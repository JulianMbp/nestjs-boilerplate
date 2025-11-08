import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { TareaEstado } from '../tarea-estado.enum';
import { TareaPrioridad } from '../tarea-prioridad.enum';

export class CreateTareaDto {
  @ApiProperty({ description: 'Task title' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ description: 'Task description' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TareaEstado,
    default: TareaEstado.PENDIENTE,
  })
  @IsOptional()
  @IsEnum(TareaEstado)
  estado?: TareaEstado;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: TareaPrioridad,
    default: TareaPrioridad.MEDIA,
  })
  @IsOptional()
  @IsEnum(TareaPrioridad)
  prioridad?: TareaPrioridad;

  @ApiPropertyOptional({
    description: 'ID of user assigned to this task',
    type: Number,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  asignado_a_id?: number;

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Progress percentage must be at least 0' })
  @Max(100, { message: 'Progress percentage cannot exceed 100' })
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  avance_porcentaje?: number;

  @ApiPropertyOptional({ description: 'Due date for the task' })
  @IsOptional()
  @IsDateString()
  fecha_limite?: Date;

  @ApiPropertyOptional({ description: 'Start date for the task' })
  @IsOptional()
  @IsDateString()
  fecha_inicio?: Date;

  @ApiPropertyOptional({ description: 'End date for the task' })
  @IsOptional()
  @IsDateString()
  fecha_fin?: Date;
}
