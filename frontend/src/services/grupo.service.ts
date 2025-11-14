import { api } from "@/lib/api";
import { Grupo, Gestion, PaginatedResponse } from "@/types";

export interface GrupoFilters {
  search?: string;
  gestion_id?: string;
  materia_id?: string;
  carrera_id?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface CreateGrupoData {
  materia_id: string;
  gestion_id: string;
  codigo: string;
  capacidad: number;
}

export interface UpdateGrupoData {
  materia_id: string;
  gestion_id: string;
  codigo: string;
  capacidad: number;
}

export interface GrupoEstadisticas {
  total_grupos: number;
  por_gestion: Array<{
    gestion: string;
    total: number;
  }>;
  capacidad_promedio: number;
  capacidad_total: number;
  con_docentes: number;
  sin_docentes: number;
}

/**
 * Obtiene la lista de grupos con filtros y paginación
 */
export const getGrupos = async (
  filters?: GrupoFilters
): Promise<PaginatedResponse<Grupo>> => {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.gestion_id) params.append("gestion_id", filters.gestion_id);
  if (filters?.materia_id) params.append("materia_id", filters.materia_id);
  if (filters?.carrera_id) params.append("carrera_id", filters.carrera_id);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.perPage) params.append("perPage", filters.perPage.toString());

  const queryString = params.toString();
  const url = `/grupos${queryString ? `?${queryString}` : ""}`;

  return api.get<PaginatedResponse<Grupo>>(url);
};

/**
 * Obtiene todos los grupos sin paginación
 */
export const getAllGrupos = async (): Promise<Grupo[]> => {
  return api.get<Grupo[]>("/grupos?all=true");
};

/**
 * Obtiene un grupo por su ID
 */
export const getGrupoById = async (id: string): Promise<Grupo> => {
  return api.get<Grupo>(`/grupos/${id}`);
};

/**
 * Crea un nuevo grupo
 */
export const createGrupo = async (data: CreateGrupoData): Promise<Grupo> => {
  return api.post<Grupo>("/grupos", data);
};

/**
 * Actualiza un grupo existente
 */
export const updateGrupo = async (
  id: string,
  data: UpdateGrupoData
): Promise<Grupo> => {
  return api.put<Grupo>(`/grupos/${id}`, data);
};

/**
 * Elimina un grupo
 */
export const deleteGrupo = async (id: string): Promise<void> => {
  await api.delete(`/grupos/${id}`);
};

/**
 * Obtiene estadísticas de grupos
 */
export const getEstadisticas = async (): Promise<GrupoEstadisticas> => {
  return api.get<GrupoEstadisticas>("/grupos/estadisticas");
};

/**
 * Obtiene todas las gestiones para selects
 */
export const getGestiones = async (): Promise<Gestion[]> => {
  return api.get<Gestion[]>("/grupos/gestiones");
};

/**
 * Exporta grupos a Excel
 */
export const exportarGrupos = async (
  filters?: GrupoFilters,
  formato: "excel" = "excel"
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append("formato", formato);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.gestion_id) params.append("gestion_id", filters.gestion_id);
  if (filters?.materia_id) params.append("materia_id", filters.materia_id);
  if (filters?.carrera_id) params.append("carrera_id", filters.carrera_id);

  const queryString = params.toString();
  const url = `/grupos/exportar?${queryString}`;

  return api.downloadFile(url);
};