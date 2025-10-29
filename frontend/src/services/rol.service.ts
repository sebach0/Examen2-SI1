/**
 * 🎭 SERVICIO DE ROLES
 * ====================
 * Maneja todas las peticiones relacionadas con roles del sistema
 */

import { api } from "@/lib/api";
import type { Rol, Permiso, PaginatedResponse } from "@/types";

export interface RolFilters {
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
  all?: string;
}

export interface CreateRolData {
  nombre: string;
  descripcion?: string;
  permisos?: string[]; // Array de IDs de permisos
}

export interface UpdateRolData {
  nombre: string;
  descripcion?: string;
  permisos?: string[];
}

/**
 * Obtener lista de roles con filtros
 */
export async function getRoles(
  filters: RolFilters = {}
): Promise<PaginatedResponse<Rol> | Rol[]> {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_order) params.append("sort_order", filters.sort_order);
  if (filters.per_page) params.append("per_page", filters.per_page.toString());
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.all) params.append("all", filters.all);

  const queryString = params.toString();
  const url = `/roles${queryString ? `?${queryString}` : ""}`;

  return api.get<PaginatedResponse<Rol> | Rol[]>(url);
}

/**
 * Obtener todos los roles (para selects)
 */
export async function getAllRoles(): Promise<Rol[]> {
  return api.get<Rol[]>("/roles?all=true");
}

/**
 * Obtener un rol específico por ID
 */
export async function getRolById(id: string): Promise<Rol> {
  return api.get<Rol>(`/roles/${id}`);
}

/**
 * Crear un nuevo rol
 */
export async function createRol(data: CreateRolData): Promise<Rol> {
  return api.post<Rol>("/roles", data);
}

/**
 * Actualizar un rol existente
 */
export async function updateRol(id: string, data: UpdateRolData): Promise<Rol> {
  return api.put<Rol>(`/roles/${id}`, data);
}

/**
 * Eliminar un rol
 */
export async function deleteRol(id: string): Promise<void> {
  return api.delete(`/roles/${id}`);
}

/**
 * Asignar permisos a un rol
 */
export async function assignPermisosToRol(
  id: string,
  permisoIds: string[]
): Promise<Rol> {
  return api.post<Rol>(`/roles/${id}/permisos`, {
    permisos: permisoIds,
  });
}
