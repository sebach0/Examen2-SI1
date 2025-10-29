import { api } from "@/lib/api";

// Interfaces
export interface UsuarioFilters {
  page?: number;
  perPage?: number;
  search?: string;
  estado?: "activo" | "suspendido" | "";
  rol_id?: string;
  sort?: string;
  direction?: "asc" | "desc";
}

export interface CreateUsuarioData {
  username: string;
  email: string;
  password: string;
  estado?: "activo" | "suspendido";
  roles?: string[];
}

export interface UpdateUsuarioData {
  username: string;
  email: string;
  password?: string;
  estado: "activo" | "suspendido";
  roles?: string[];
}

export interface UsuarioEstadisticas {
  total_usuarios: number;
  por_estado: Array<{
    estado: string;
    cantidad: number;
  }>;
  por_rol: Array<{
    rol: string;
    cantidad: number;
  }>;
  recientes: Array<{
    id: string;
    username: string;
    email: string;
    creado_en: string;
  }>;
}

/**
 * Obtener lista de usuarios con filtros y paginación
 */
export const getUsuarios = async (filters: UsuarioFilters = {}) => {
  const params = new URLSearchParams();

  if (filters.page) params.append("page", filters.page.toString());
  if (filters.perPage) params.append("perPage", filters.perPage.toString());
  if (filters.search) params.append("search", filters.search);
  if (filters.estado) params.append("estado", filters.estado);
  if (filters.rol_id) params.append("rol_id", filters.rol_id);
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.direction) params.append("direction", filters.direction);

  const queryString = params.toString();
  const url = queryString ? `/usuarios?${queryString}` : "/usuarios";

  return api.get<any>(url);
};

/**
 * Obtener todos los usuarios sin paginación
 */
export const getAllUsuarios = async () => {
  return api.get<any>("/usuarios?all=true");
};

/**
 * Obtener usuario por ID
 */
export const getUsuarioById = async (id: string) => {
  return api.get<any>(`/usuarios/${id}`);
};

/**
 * Crear nuevo usuario
 */
export const createUsuario = async (data: CreateUsuarioData) => {
  return api.post<any>("/usuarios", data);
};

/**
 * Actualizar usuario
 */
export const updateUsuario = async (id: string, data: UpdateUsuarioData) => {
  return api.put<any>(`/usuarios/${id}`, data);
};

/**
 * Eliminar usuario
 */
export const deleteUsuario = async (id: string) => {
  return api.delete<any>(`/usuarios/${id}`);
};

/**
 * Obtener estadísticas de usuarios
 */
export const getEstadisticas = async (): Promise<UsuarioEstadisticas> => {
  return api.get<UsuarioEstadisticas>("/usuarios/estadisticas");
};

/**
 * Cambiar estado de un usuario
 */
export const cambiarEstado = async (
  id: string,
  estado: "activo" | "suspendido"
) => {
  return api.post<any>(`/usuarios/${id}/cambiar-estado`, { estado });
};
