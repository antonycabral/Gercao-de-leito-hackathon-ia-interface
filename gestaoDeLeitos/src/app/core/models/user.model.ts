/**
 * User Role Types baseado nos requisitos do sistema
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MEDICO = 'MEDICO',
  ENFERMAGEM = 'ENFERMAGEM',
  TRIAGEM = 'TRIAGEM',
  LIMPEZA = 'LIMPEZA',
  ACOMPANHANTE = 'ACOMPANHANTE'
}

/**
 * Interface do usuário autenticado
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  documento: string; // CPF ou CRM
  unidade?: string; // Hospital/Unidade onde trabalha
  setor?: string; // Setor específico (ex: Cardiologia, UTI)
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

/**
 * Interface para autenticação
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Interface para resposta de autenticação
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Interface para payload do token JWT
 */
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
}
