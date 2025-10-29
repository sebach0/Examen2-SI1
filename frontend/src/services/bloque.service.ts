import { api } from "@/lib/api";

// Interfaces
export interface BloqueFilters {
  page?: number;
  perPage?: number;
  search?: string;
  dia_semana?: number;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface CreateBloqueData {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface UpdateBloqueData {
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface BloqueEstadisticas {
  total_bloques: number;
  por_dia: Array<{
    dia: string;
    cantidad: number;
  }>;
  con_horarios: number;
  sin_horarios: number;
  duracion_promedio: number;
}

export interface DiaSemana {
  value: number;
  label: string;
}

/**
 * Obtener lista de bloques horarios con filtros y paginación
 */
export const getBloques = async (filters: BloqueFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.perPage) params.append("perPage", filters.perPage.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.dia_semana)
    params.append("dia_semana", filters.dia_semana.toString());
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.direction) params.append("direction", filters.direction);

  const queryString = params.toString();
  const url = queryString ? `/bloques?${queryString}` : "/bloques";

  return api.get<any>(url);
};

/**
 * Obtener todos los bloques horarios sin paginación
 */
export const getAllBloques = async () => {
  return api.get<any>("/bloques?all=true");
};

/**
 * Obtener bloque horario por ID
 */
export const getBloqueById = async (id: string) => {
  return api.get<any>(`/bloques/${id}`);
};

/**
 * Crear nuevo bloque horario
 */
export const createBloque = async (data: CreateBloqueData) => {
  return api.post<any>("/bloques", data);
};

/**
 * Actualizar bloque horario
 */
export const updateBloque = async (id: string, data: UpdateBloqueData) => {
  return api.put<any>(`/bloques/${id}`, data);
};

/**
 * Eliminar bloque horario
 */
export const deleteBloque = async (id: string) => {
  return api.delete<any>(`/bloques/${id}`);
};

/**
 * Obtener estadísticas de bloques horarios
 */
export const getEstadisticas = async (): Promise<BloqueEstadisticas> => {
  return api.get<BloqueEstadisticas>("/bloques/estadisticas");
};

/**
 * Obtener días de la semana
 */
export const getDias = async (): Promise<DiaSemana[]> => {
  return api.get<DiaSemana[]>("/bloques/dias");
};
