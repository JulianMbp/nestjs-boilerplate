import { Session } from '../../../session/domain/session';
import { User } from '../../../users/domain/user';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  sessionId: Session['id'];
  iat: number;
  exp: number;
  user_uuid?: string; // Supabase UUID (required for multi-tenant RLS)
  obra_id?: string; // ID de la obra activa en el contexto del usuario
  email?: string; // Email del usuario para referencia
};
