import { SetMetadata } from '@nestjs/common';

// Decorator para requerir una obra en el contexto
export const RequiereObra = () => SetMetadata('requiere_obra', true);
