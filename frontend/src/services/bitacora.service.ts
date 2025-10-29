/**
 * 📋 SERVICIO DE BITÁCORA
 * ========================
 * Maneja todas las peticiones relacionadas con la bitácora del sistema
 */

import { api } from "@/lib/api";
import type {
  Bitacora,
  BitacoraEstadisticas,
  BitacoraFiltros,
  PaginatedResponse,
} from "@/types";

/**
 * Obtener registros de bitácora con filtros y paginación
 */
export async function getBitacora(
  filtros: BitacoraFiltros = {}
): Promise<PaginatedResponse<Bitacora>> {
  const params = new URLSearchParams();

  if (filtros.usuario_id) params.append("usuario_id", filtros.usuario_id);
  if (filtros.accion) params.append("accion", filtros.accion);
  if (filtros.desde) params.append("desde", filtros.desde);
  if (filtros.hasta) params.append("hasta", filtros.hasta);
  if (filtros.per_page) params.append("per_page", filtros.per_page.toString());
  if (filtros.page) params.append("page", filtros.page.toString());

  const queryString = params.toString();
  const url = `/bitacora${queryString ? `?${queryString}` : ""}`;

  return api.get<PaginatedResponse<Bitacora>>(url);
}

/**
 * Obtener estadísticas de la bitácora
 */
export async function getBitacoraEstadisticas(
  dias: number = 30
): Promise<BitacoraEstadisticas> {
  return api.get<BitacoraEstadisticas>(`/bitacora/estadisticas?dias=${dias}`);
}

/**
 * Obtener actividad de un usuario específico
 */
export async function getActividadUsuario(
  usuarioId: string
): Promise<Bitacora[]> {
  return api.get<Bitacora[]>(`/bitacora/usuario/${usuarioId}`);
}

/**
 * Acciones disponibles para filtrado
 */
export const ACCIONES_BITACORA = [
  { value: "LOGIN", label: "Inicio de Sesión" },
  { value: "LOGOUT", label: "Cierre de Sesión" },
  { value: "LOGIN_FALLIDO", label: "Login Fallido" },
  { value: "LOGIN_ADMIN", label: "Login Administrador" },
  { value: "CREAR", label: "Crear" },
  { value: "ACTUALIZAR", label: "Actualizar" },
  { value: "ELIMINAR", label: "Eliminar" },
  { value: "CONSULTAR", label: "Consultar" },
  { value: "EXPORTAR", label: "Exportar" },
  { value: "IMPORTAR", label: "Importar" },
] as const;

/**
 * Obtener etiqueta de acción
 */
export function getAccionLabel(accion: string): string {
  const found = ACCIONES_BITACORA.find((a) => a.value === accion);
  return found?.label || accion;
}

/**
 * Obtener color para badge según el tipo de acción
 */
export function getAccionColor(accion: string): string {
  const colorMap: Record<string, string> = {
    LOGIN: "bg-green-100 text-green-800",
    LOGIN_ADMIN: "bg-purple-100 text-purple-800",
    LOGOUT: "bg-gray-100 text-gray-800",
    LOGIN_FALLIDO: "bg-red-100 text-red-800",
    CREAR: "bg-blue-100 text-blue-800",
    ACTUALIZAR: "bg-yellow-100 text-yellow-800",
    ELIMINAR: "bg-red-100 text-red-800",
    CONSULTAR: "bg-indigo-100 text-indigo-800",
    EXPORTAR: "bg-orange-100 text-orange-800",
    IMPORTAR: "bg-teal-100 text-teal-800",
  };

  return colorMap[accion] || "bg-gray-100 text-gray-800";
}
