import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ChatObraDto {
  @ApiProperty({
    description: 'Pregunta o mensaje sobre la obra',
    example: '¿Cuántos materiales tiene esta obra?',
  })
  @IsString()
  @IsNotEmpty()
  mensaje: string;
}
