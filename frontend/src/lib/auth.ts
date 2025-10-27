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
 * Verifica si el usuario tiene un rol específico
 */
export function hasRole(user: Usuario, roleName: string): boolean {
  return user.roles?.some((rol) => rol.nombre === roleName) ?? false;
}

/**
 * Verifica si el usuario tiene un permiso específico
 * @param codigo Formato: "modulo.recurso.accion" ej: "academico.materias.crear"
 */
export function hasPermission(user: Usuario, codigo: string): boolean {
  if (!user.roles) return false;

  return user.roles.some((rol) =>
    rol.permisos?.some((permiso) => permiso.codigo === codigo)
  );
}

/**
 * Verifica si el usuario es superadmin
 */
export function isSuperAdmin(user: Usuario): boolean {
  return hasRole(user, "superadmin") || hasRole(user, "admin");
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
