/**
 * 📝 HELPERS DE AUTENTICACIÓN
 * ============================
 * Utilidades para manejar sesiones, tokens y permisos
 */

import type { Usuario } from "@/types";
import { getCurrentUser } from "@/services/auth.service";

/**
 * Verifica si hay un token de autenticación
 * Client-side only
 */
export function hasAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("auth_token");
}

/**
 * Obtiene el token de autenticación
 * Client-side only
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Obtiene el usuario autenticado desde localStorage
 * Client-side only
 */
export function getStoredUser(): Usuario | null {
  if (typeof window === "undefined") return null;

  const userJson = localStorage.getItem("auth_user");
  if (!userJson) return null;

  try {
    return JSON.parse(userJson) as Usuario;
  } catch {
    return null;
  }
}

/**
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(user: Usuario | null, roleName: string): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((rol) => 
    rol.nombre?.toLowerCase() === roleName.toLowerCase()
  );
}

/**
 * Verifica si el usuario tiene un permiso específico
 * @param codigo Formato: "modulo.recurso.accion" ej: "academico.materias.crear"
 */
export function hasPermission(user: Usuario | null, codigo: string): boolean {
  if (!user || !user.roles) return false;
  
  // Superadmin tiene todos los permisos
  if (isSuperAdmin(user)) return true;

  return user.roles.some((rol) =>
    rol.permisos?.some((permiso) => permiso.codigo === codigo)
  );
}

/**
 * Verifica si el usuario es superadmin
 */
export function isSuperAdmin(user: Usuario | null): boolean {
  if (!user || !user.roles) return false;
  return user.roles.some((rol) => 
    rol.nombre?.toLowerCase() === "superadmin" || 
    rol.nombre?.toLowerCase() === "admin"
  );
}

/**
 * Verifica si el usuario puede acceder a un módulo
 * @param modulo Nombre del módulo: "academico", "infra", "horarios", etc
 */
export function canAccessModule(user: Usuario, modulo: string): boolean {
  if (isSuperAdmin(user)) return true;

  const modulePermissions = [
    `${modulo}.ver`,
    `${modulo}.listar`,
    `${modulo}.crear`,
    `${modulo}.editar`,
    `${modulo}.eliminar`,
  ];

  return modulePermissions.some((perm) => hasPermission(user, perm));
}
