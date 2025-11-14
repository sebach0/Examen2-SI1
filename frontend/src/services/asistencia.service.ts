/**
 * ✅ SERVICIO DE ASISTENCIA
 * ==========================
 * Gestiona registro de asistencia de docentes
 */

import { api } from "@/lib/api";
import type { Asistencia, QrSesion } from "@/types";

export interface MarcarAsistenciaData {
  docente_id: string;
  grupo_id: string;
  fecha: string;
  bloque_id: string;
  estado: "presente" | "ausente" | "tarde" | "justificado";
  modo: "QR" | "manual";
  observacion?: string;
}

export interface AsistenciaFiltros {
  docente_id?: string;
  grupo_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
}

export interface AsistenciaEstadisticas {
  total_clases: number;
  presentes: number;
  ausentes: number;
  tardes: number;
  justificados: number;
  porcentaje_asistencia: number;
}

// ==================
// ASISTENCIA
// ==================

export const getAsistencias = async (
  filtros?: AsistenciaFiltros
): Promise<Asistencia[]> => {
  const params = new URLSearchParams();
  params.append("all", "true"); // Siempre obtener todos los registros para reportes
  if (filtros?.docente_id) params.append("docente_id", filtros.docente_id);
  if (filtros?.grupo_id) params.append("grupo_id", filtros.grupo_id);
  if (filtros?.fecha_inicio)
    params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros?.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);
  if (filtros?.estado) params.append("estado", filtros.estado);

  const queryString = params.toString();
  const url = `/asistencias?${queryString}`;

  return api.get<Asistencia[]>(url);
};

export const getAsistenciaById = async (id: string): Promise<Asistencia> => {
  return api.get<Asistencia>(`/asistencias/${id}`);
};

export const marcarAsistencia = async (
  data: MarcarAsistenciaData
): Promise<Asistencia> => {
  return api.post<Asistencia>("/asistencias", data);
};

export const marcarAsistenciaPorQR = async (
  token: string,
  docente_id?: string
): Promise<Asistencia> => {
  const payload: { token: string; docente_id?: string } = { token };
  if (docente_id) {
    payload.docente_id = docente_id;
  }
  return api.post<Asistencia>("/asistencias/qr", payload);
};

export const updateAsistencia = async (
  id: string,
  data: Partial<MarcarAsistenciaData>
): Promise<Asistencia> => {
  return api.put<Asistencia>(`/asistencias/${id}`, data);
};

export const deleteAsistencia = async (id: string): Promise<void> => {
  await api.delete(`/asistencias/${id}`);
};

// ==================
// QR SESIONES
// ==================

export interface GenerarQRResponse {
  message: string;
  data: QrSesion;
  token: string;
  url_qr: string;
  qr_data: string;
}

export const generarQR = async (data: {
  grupo_id: string;
  fecha: string;
  bloque_id: string;
  duracion_minutos?: number;
}): Promise<GenerarQRResponse> => {
  return api.post<GenerarQRResponse>("/qr-sesiones/generar", data);
};

export const verificarQR = async (
  token: string
): Promise<{
  valido: boolean;
  sesion?: QrSesion;
  data?: QrSesion;
  mensaje?: string;
  message?: string;
}> => {
  return api.get<{
    valido: boolean;
    sesion?: QrSesion;
    data?: QrSesion;
    mensaje?: string;
    message?: string;
  }>(`/qr-sesiones/verificar/${token}`);
};

export const desactivarQR = async (id: string): Promise<void> => {
  await api.post(`/qr-sesiones/${id}/desactivar`, {});
};

// ==================
// ESTADÍSTICAS Y REPORTES
// ==================

export const getEstadisticasDocente = async (
  docente_id: string,
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<AsistenciaEstadisticas> => {
  const params = new URLSearchParams();
  if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
  if (fecha_fin) params.append("fecha_fin", fecha_fin);

  const queryString = params.toString();
  const url = `/asistencias/estadisticas/docente/${docente_id}${
    queryString ? `?${queryString}` : ""
  }`;

  return api.get<AsistenciaEstadisticas>(url);
};

export const getEstadisticasGrupo = async (
  grupo_id: string,
  fecha_inicio?: string,
  fecha_fin?: string
): Promise<AsistenciaEstadisticas> => {
  const params = new URLSearchParams();
  if (fecha_inicio) params.append("fecha_inicio", fecha_inicio);
  if (fecha_fin) params.append("fecha_fin", fecha_fin);

  const queryString = params.toString();
  const url = `/asistencias/estadisticas/grupo/${grupo_id}${
    queryString ? `?${queryString}` : ""
  }`;

  return api.get<AsistenciaEstadisticas>(url);
};

export const exportarReporte = async (
  filtros: AsistenciaFiltros,
  formato: "excel" | "pdf" = "excel"
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append("formato", formato);
  if (filtros.docente_id) params.append("docente_id", filtros.docente_id);
  if (filtros.grupo_id) params.append("grupo_id", filtros.grupo_id);
  if (filtros.fecha_inicio) params.append("fecha_inicio", filtros.fecha_inicio);
  if (filtros.fecha_fin) params.append("fecha_fin", filtros.fecha_fin);
  if (filtros.estado) params.append("estado", filtros.estado);

  const queryString = params.toString();
  const url = `/asistencias/exportar?${queryString}`;

  return api.downloadFile(url);
};
