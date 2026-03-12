/**
 * User Role Types baseado nos requisitos do sistema
 * Compatível com o backend User.entity.ts
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MEDICO = 'MEDICO',
  ENFERMEIRO = 'ENFERMEIRO',
  ENFERMAGEM = 'ENFERMAGEM',
  TRIAGEM = 'TRIAGEM',
  LIMPEZA = 'LIMPEZA',
  ACOMPANHANTE = 'ACOMPANHANTE'
}

/**
 * Interface do usuário autenticado
 * Compatível com o backend User.entity.ts
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  specialization?: string; // Para médicos
  registrationNumber?: string; // CRM, COREN, etc
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface para autenticação
 */
export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Interface para resposta de autenticação do backend
 * Compatível com AuthResponseDto do backend
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Interface para payload do token JWT
 */
export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
export interface TokenPayload {
  sub: string; // User ID
  email: string;
  role: UserRole;
  iat: number; // Issued at
  exp: number; // Expiration
}
