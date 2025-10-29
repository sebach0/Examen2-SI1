import { api } from "@/lib/api";
import { Materia, Carrera, PaginatedResponse } from "@/types";

export interface MateriaFilters {
  search?: string;
  carrera_id?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  perPage?: number;
}

export interface CreateMateriaData {
  carrera_id: string;
  codigo: string;
  nombre: string;
  horas_semanales: number;
  creditos: number;
  requisito_ids?: string[];
}

export interface UpdateMateriaData {
  carrera_id: string;
  codigo: string;
  nombre: string;
  horas_semanales: number;
  creditos: number;
  requisito_ids?: string[];
}

export interface MateriaEstadisticas {
  total_materias: number;
  por_carrera: Array<{
    carrera: string;
    total: number;
  }>;
  con_requisitos: number;
  sin_requisitos: number;
  promedio_creditos: number;
  promedio_horas: number;
}

/**
 * Obtiene la lista de materias con filtros y paginación
 */
export const getMaterias = async (
  filters?: MateriaFilters
): Promise<PaginatedResponse<Materia>> => {
  const params = new URLSearchParams();

  if (filters?.search) params.append("search", filters.search);
  if (filters?.carrera_id) params.append("carrera_id", filters.carrera_id);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.perPage) params.append("perPage", filters.perPage.toString());

  const queryString = params.toString();
  const url = `/materias${queryString ? `?${queryString}` : ""}`;

  return api.get<PaginatedResponse<Materia>>(url);
};

/**
 * Obtiene todas las materias sin paginación
 */
export const getAllMaterias = async (): Promise<Materia[]> => {
  return api.get<Materia[]>("/materias?all=true");
};

/**
 * Obtiene una materia por su ID
 */
export const getMateriaById = async (id: string): Promise<Materia> => {
  return api.get<Materia>(`/materias/${id}`);
};

/**
 * Crea una nueva materia
 */
export const createMateria = async (
  data: CreateMateriaData
): Promise<Materia> => {
  return api.post<Materia>("/materias", data);
};

/**
 * Actualiza una materia existente
 */
export const updateMateria = async (
  id: string,
  data: UpdateMateriaData
): Promise<Materia> => {
  return api.put<Materia>(`/materias/${id}`, data);
};

/**
 * Elimina una materia
 */
export const deleteMateria = async (id: string): Promise<void> => {
  await api.delete(`/materias/${id}`);
};

/**
 * Obtiene estadísticas de materias
 */
export const getEstadisticas = async (): Promise<MateriaEstadisticas> => {
  return api.get<MateriaEstadisticas>("/materias/estadisticas");
};

/**
 * Obtiene todas las carreras para selects
 */
export const getCarreras = async (): Promise<Carrera[]> => {
  return api.get<Carrera[]>("/materias/carreras");
};
