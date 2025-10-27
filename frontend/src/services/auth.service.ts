/**
 * 📝 SERVICIO DE AUTENTICACIÓN
 * =============================
 * Maneja login, logout, registro y gestión de sesiones
 */

import { api } from "@/lib/api";
import type { Usuario, AuthSession } from "@/types";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Login normal (docentes, coordinadores)
 */
export async function login(
  credentials: LoginCredentials
): Promise<AuthSession> {
  return api.post<AuthSession>("/auth/login", credentials);
}

/**
 * Login para superadmin
 */
export async function adminLogin(
  credentials: LoginCredentials
): Promise<AuthSession> {
  return api.post<AuthSession>("/auth/admin-login", credentials);
}

/**
 * Registro de nuevo usuario (solo admin puede hacer esto)
 */
export async function register(data: RegisterData): Promise<Usuario> {
  return api.post<Usuario>("/auth/register", data);
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

/**
 * Obtener usuario actual autenticado
 */
export async function getCurrentUser(): Promise<Usuario> {
  return api.get<Usuario>("/auth/me");
}

/**
 * Refrescar token de sesión
 */
export async function refreshToken(): Promise<AuthSession> {
  return api.post<AuthSession>("/auth/refresh");
}

/**
 * Cambiar contraseña
 */
export async function changePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<void> {
  await api.post("/auth/change-password", data);
}

/**
 * Solicitar recuperación de contraseña
 */
export async function forgotPassword(email: string): Promise<void> {
  await api.post("/auth/forgot-password", { email });
}

/**
 * Resetear contraseña con token
 */
export async function resetPassword(data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await api.post("/auth/reset-password", data);
}
