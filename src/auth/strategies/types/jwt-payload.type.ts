import { Session } from '../../../session/domain/session';
import { User } from '../../../users/domain/user';

export type JwtPayloadType = Pick<User, 'id' | 'role'> & {
  email: string;
  sessionId: Session['id'];
  obraId?: string; // ID de la obra activa del usuario
  iat: number;
  exp: number;
};
