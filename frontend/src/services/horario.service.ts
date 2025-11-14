/**
 * 📅 SERVICIO DE HORARIOS DE GRUPO
 * ==================================
 * Gestiona la programación de horarios (bloques + aulas)
 */

import { api } from "@/lib/api";
import type { HorarioGrupo } from "@/types";

// Constantes para tipos de clase (frontend usa masculino, backend usa femenino)
const TIPOS_CLASE_FRONTEND = {
  TEORICO: "teorico",
  PRACTICO: "practico",
  LABORATORIO: "laboratorio",
} as const;

const TIPOS_CLASE_BACKEND = {
  TEORICA: "teorica",
  PRACTICA: "practica",
  LABORATORIO: "laboratorio",
} as const;

// Mapeo de tipos frontend a backend
const MAPEO_TIPOS: Record<string, string> = {
  [TIPOS_CLASE_FRONTEND.TEORICO]: TIPOS_CLASE_BACKEND.TEORICA,
  [TIPOS_CLASE_FRONTEND.PRACTICO]: TIPOS_CLASE_BACKEND.PRACTICA,
  [TIPOS_CLASE_FRONTEND.LABORATORIO]: TIPOS_CLASE_BACKEND.LABORATORIO,
};

/**
 * Normaliza el tipo de clase del formato frontend al formato backend
 */
const normalizarTipoClase = (tipo: string): string => {
  return MAPEO_TIPOS[tipo] || tipo;
};

/**
 * Transforma los datos del frontend al formato esperado por el backend
 */
const transformarDatosParaBackend = (data: CreateHorarioData) => {
  const { tipo, ...rest } = data;
  return {
    ...rest,
    // El backend ahora acepta bloque_id directamente
    tipo: normalizarTipoClase(tipo),
  };
};

export interface CreateHorarioData {
  grupo_id: string;
  bloque_id: string;
  aula_id: string;
  tipo: string; // "teorico", "practico", "laboratorio"
}

export const getHorarios = async (): Promise<HorarioGrupo[]> => {
  return api.get<HorarioGrupo[]>("/horarios-grupo?all=true");
};

export const getHorarioById = async (id: string): Promise<HorarioGrupo> => {
  return api.get<HorarioGrupo>(`/horarios-grupo/${id}`);
};

export const getHorariosByGrupo = async (
  grupo_id: string
): Promise<HorarioGrupo[]> => {
  return api.get<HorarioGrupo[]>(`/horarios-grupo/grupo/${grupo_id}`);
};

export const getHorariosByAula = async (
  aula_id: string
): Promise<HorarioGrupo[]> => {
  return api.get<HorarioGrupo[]>(`/horarios-grupo/aula/${aula_id}`);
};

export const createHorario = async (
  horario: CreateHorarioData
): Promise<HorarioGrupo> => {
  const payload = transformarDatosParaBackend(horario);
  return api.post<HorarioGrupo>("/horarios-grupo", payload);
};

export const updateHorario = async (
  id: string,
  horario: Partial<CreateHorarioData>
): Promise<HorarioGrupo> => {
  // Transformar solo los campos que existen
  const payload: any = {};
  
  if (horario.grupo_id) payload.grupo_id = horario.grupo_id;
  if (horario.aula_id) payload.aula_id = horario.aula_id;
  if (horario.bloque_id) payload.bloque_id = horario.bloque_id; // El backend ahora acepta bloque_id directamente
  if (horario.tipo) payload.tipo = normalizarTipoClase(horario.tipo);
  
  return api.put<HorarioGrupo>(`/horarios-grupo/${id}`, payload);
};

export const deleteHorario = async (id: string): Promise<void> => {
  await api.delete(`/horarios-grupo/${id}`);
};

/**
 * Verifica conflictos de horario
 */
export const verificarConflictos = async (
  data: CreateHorarioData
): Promise<{
  tiene_conflictos: boolean;
  conflictos: Array<{
    tipo: string;
    mensaje: string;
    horario?: HorarioGrupo;
  }>;
}> => {
  // Solo necesitamos los campos requeridos para verificar conflictos
  const { bloque_id, grupo_id, aula_id } = data;
  const payload = {
    grupo_id,
    bloque_id, // El backend ahora acepta bloque_id directamente
    aula_id,
  };
  
  return api.post<{
    tiene_conflictos: boolean;
    conflictos: Array<{
      tipo: string;
      mensaje: string;
      horario?: HorarioGrupo;
    }>;
  }>("/horarios-grupo/verificar-conflictos", payload);
};

/**
 * Exporta horarios a Excel
 */
export const exportarHorarios = async (
  filters?: {
    grupo_id?: string;
    aula_id?: string;
    tipo?: string;
  },
  formato: "excel" = "excel"
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append("formato", formato);
  if (filters?.grupo_id) params.append("grupo_id", filters.grupo_id);
  if (filters?.aula_id) params.append("aula_id", filters.aula_id);
  if (filters?.tipo) params.append("tipo", filters.tipo);

  const queryString = params.toString();
  const url = `/horarios-grupo/exportar?${queryString}`;

  return api.downloadFile(url);
};

/**
 * Interfaces para reportes
 */
export interface HorarioReporte {
  id: string;
  grupo: {
    id: string;
    codigo: string;
    materia: {
      id: string;
      nombre: string;
    };
  };
  bloque: {
    id: string;
    dia_semana: number;
    dia_nombre: string;
    hora_inicio: string;
    hora_fin: string;
  };
  aula: {
    id: string;
    codigo: string;
    edificio: string;
  };
  tipo: string;
  docentes: Array<{
    id: string;
    nombre: string;
  }> | null | undefined;
}

export interface ReporteSemanal {
  semana: {
    inicio: string;
    fin: string;
    fecha_referencia: string;
  };
  horarios: HorarioReporte[];
  horarios_por_dia: Record<number, HorarioReporte[]>;
  total: number;
}

export interface ReporteDiario {
  fecha: string;
  dia_semana: number;
  dia_nombre: string;
  horarios: HorarioReporte[];
  total: number;
}

/**
 * Obtiene reporte semanal de horarios
 */
export const getReporteSemanal = async (
  filters?: {
    fecha?: string;
    grupo_id?: string;
    aula_id?: string;
    docente_id?: string;
    tipo?: string;
  }
): Promise<ReporteSemanal> => {
  const params = new URLSearchParams();
  if (filters?.fecha) params.append("fecha", filters.fecha);
  if (filters?.grupo_id) params.append("grupo_id", filters.grupo_id);
  if (filters?.aula_id) params.append("aula_id", filters.aula_id);
  if (filters?.docente_id) params.append("docente_id", filters.docente_id);
  if (filters?.tipo) params.append("tipo", filters.tipo);

  const queryString = params.toString();
  const url = `/horarios-grupo/reportes/semanal${queryString ? `?${queryString}` : ""}`;

  return api.get<ReporteSemanal>(url);
};

/**
 * Obtiene reporte diario de horarios
 */
export const getReporteDiario = async (
  filters?: {
    fecha?: string;
    grupo_id?: string;
    aula_id?: string;
    docente_id?: string;
    tipo?: string;
  }
): Promise<ReporteDiario> => {
  const params = new URLSearchParams();
  if (filters?.fecha) params.append("fecha", filters.fecha);
  if (filters?.grupo_id) params.append("grupo_id", filters.grupo_id);
  if (filters?.aula_id) params.append("aula_id", filters.aula_id);
  if (filters?.docente_id) params.append("docente_id", filters.docente_id);
  if (filters?.tipo) params.append("tipo", filters.tipo);

  const queryString = params.toString();
  const url = `/horarios-grupo/reportes/diario${queryString ? `?${queryString}` : ""}`;

  return api.get<ReporteDiario>(url);
};
