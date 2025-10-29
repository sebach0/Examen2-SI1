/**
 * 🔐 SERVICIO DE PERMISOS
 * ========================
 * Maneja todas las peticiones relacionadas con permisos del sistema
 */

import { api } from "@/lib/api";
import type { Permiso, PaginatedResponse } from "@/types";

export interface PermisoFilters {
  search?: string;
  modulo?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  per_page?: number;
  page?: number;
  all?: string;
}

export interface CreatePermisoData {
  codigo: string;
  descripcion: string;
}

export interface UpdatePermisoData {
  codigo: string;
  descripcion: string;
}

/**
 * Obtener lista de permisos con filtros
 */
export async function getPermisos(
  filters: PermisoFilters = {}
): Promise<PaginatedResponse<Permiso> | Permiso[]> {
  const params = new URLSearchParams();

  if (filters.search) params.append("search", filters.search);
  if (filters.modulo) params.append("modulo", filters.modulo);
  if (filters.sort_by) params.append("sort_by", filters.sort_by);
  if (filters.sort_order) params.append("sort_order", filters.sort_order);
  if (filters.per_page) params.append("per_page", filters.per_page.toString());
  if (filters.page) params.append("page", filters.page.toString());
  if (filters.all) params.append("all", filters.all);

  const queryString = params.toString();
  const url = `/permisos${queryString ? `?${queryString}` : ""}`;

  return api.get<PaginatedResponse<Permiso> | Permiso[]>(url);
}

/**
 * Obtener todos los permisos (para selects/checkboxes)
 */
export async function getAllPermisos(): Promise<Permiso[]> {
  return api.get<Permiso[]>("/permisos?all=true");
}

/**
 * Obtener permisos agrupados por módulo
 */
export async function getPermisosGrouped(): Promise<Record<string, Permiso[]>> {
  return api.get<Record<string, Permiso[]>>("/permisos/grouped");
}

/**
 * Obtener un permiso específico por ID
 */
export async function getPermisoById(id: string): Promise<Permiso> {
  return api.get<Permiso>(`/permisos/${id}`);
}

/**
 * Crear un nuevo permiso
 */
export async function createPermiso(data: CreatePermisoData): Promise<Permiso> {
  return api.post<Permiso>("/permisos", data);
}

/**
 * Actualizar un permiso existente
 */
export async function updatePermiso(
  id: string,
  data: UpdatePermisoData
): Promise<Permiso> {
  return api.put<Permiso>(`/permisos/${id}`, data);
}

/**
 * Eliminar un permiso
 */
export async function deletePermiso(id: string): Promise<void> {
  return api.delete(`/permisos/${id}`);
}

/**
 * Helper: Extraer módulo del código de permiso
 */
export function getModuloFromCodigo(codigo: string): string {
  const parts = codigo.split(".");
  return parts[0] || "otros";
}

/**
 * Helper: Formatear código de permiso para display
 */
export function formatPermisoCodigo(codigo: string): string {
  return codigo
    .split(".")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" › ");
}
