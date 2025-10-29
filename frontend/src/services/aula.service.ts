import { api } from "@/lib/api";

// Interfaces
export interface AulaFilters {
  page?: number;
  perPage?: number;
  search?: string;
  edificio_id?: string;
  tipo?: string;
  capacidad_min?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface CreateAulaData {
  edificio_id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
}

export interface UpdateAulaData {
  edificio_id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  capacidad: number;
}

export interface AulaEstadisticas {
  total_aulas: number;
  por_tipo: Array<{
    tipo: string;
    cantidad: number;
  }>;
  por_edificio: Array<{
    edificio: string;
    cantidad: number;
  }>;
  capacidad_total: number;
  capacidad_promedio: number;
  con_horarios: number;
  sin_horarios: number;
}

export interface TipoAula {
  value: string;
  label: string;
}

/**
 * Obtener lista de aulas con filtros y paginación
 */
export const getAulas = async (filters: AulaFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.perPage) params.append("perPage", filters.perPage.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.edificio_id) params.append("edificio_id", filters.edificio_id);
  if (filters.tipo) params.append("tipo", filters.tipo);
  if (filters.capacidad_min)
    params.append("capacidad_min", filters.capacidad_min.toString());
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.direction) params.append("direction", filters.direction);

  const queryString = params.toString();
  const url = queryString ? `/aulas?${queryString}` : "/aulas";

  return api.get(url);
};

/**
 * Obtener todas las aulas sin paginación
 */
export const getAllAulas = async () => {
  return api.get("/aulas?all=true");
};

/**
 * Obtener aula por ID
 */
export const getAulaById = async (id: string) => {
  return api.get(`/aulas/${id}`);
};

/**
 * Crear nueva aula
 */
export const createAula = async (data: CreateAulaData) => {
  return api.post("/aulas", data);
};

/**
 * Actualizar aula
 */
export const updateAula = async (id: string, data: UpdateAulaData) => {
  return api.put(`/aulas/${id}`, data);
};

/**
 * Eliminar aula
 */
export const deleteAula = async (id: string) => {
  return api.delete(`/aulas/${id}`);
};

/**
 * Obtener estadísticas de aulas
 */
export const getEstadisticas = async (): Promise<AulaEstadisticas> => {
  return api.get("/aulas/estadisticas");
};

/**
 * Obtener lista de edificios
 */
export const getEdificios = async () => {
  return api.get("/aulas/edificios");
};

/**
 * Obtener tipos de aula disponibles
 */
export const getTipos = async (): Promise<TipoAula[]> => {
  return api.get("/aulas/tipos");
};
