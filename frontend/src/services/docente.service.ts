import { api } from "@/lib/api";
import { Docente, Rol, PaginatedResponse } from "@/types";

export interface DocenteFilters {
  search?: string;
  estado?: "activo" | "suspendido" | "";
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface CreateDocenteData {
  ci: string;
  nombre: string;
  telefono?: string;
  username: string;
  email: string;
  password: string;
  rol_ids?: string[];
}

export interface UpdateDocenteData {
  ci: string;
  nombre: string;
  telefono?: string;
  username: string;
  email: string;
  password?: string;
  estado?: "activo" | "suspendido";
  rol_ids?: string[];
}

export interface DocenteEstadisticas {
  total_docentes: number;
  docentes_activos: number;
  docentes_suspendidos: number;
  docentes_con_cargas: number;
  docentes_sin_cargas: number;
}

/**
 * Obtiene la lista de docentes con filtros y paginación
 */
export const getDocentes = async (
  filters?: DocenteFilters
): Promise<PaginatedResponse<Docente>> => {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.estado) params.append("estado", filters.estado);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.perPage) params.append("perPage", filters.perPage.toString());

  const queryString = params.toString();
  const url = `/docentes${queryString ? `?${queryString}` : ""}`;

  return api.get<PaginatedResponse<Docente>>(url);
};

/**
 * Obtiene todos los docentes sin paginación
 */
export const getAllDocentes = async (): Promise<Docente[]> => {
  return api.get<Docente[]>("/docentes?all=true");
};

/**
 * Obtiene un docente por su ID
 */
export const getDocenteById = async (id: string): Promise<Docente> => {
  return api.get<Docente>(`/docentes/${id}`);
};

/**
 * Crea un nuevo docente
 */
export const createDocente = async (
  data: CreateDocenteData
): Promise<Docente> => {
  return api.post<Docente>("/docentes", data);
};

/**
 * Actualiza un docente existente
 */
export const updateDocente = async (
  id: string,
  data: UpdateDocenteData
): Promise<Docente> => {
  return api.put<Docente>(`/docentes/${id}`, data);
};

/**
 * Elimina un docente
 */
export const deleteDocente = async (id: string): Promise<void> => {
  await api.delete(`/docentes/${id}`);
};

/**
 * Obtiene estadísticas de docentes
 */
export const getEstadisticas = async (): Promise<DocenteEstadisticas> => {
  return api.get<DocenteEstadisticas>("/docentes/estadisticas");
};
