/**
 * 📅 SERVICIO DE HORARIOS DE GRUPO
 * ==================================
 * Gestiona la programación de horarios (bloques + aulas)
 */

import { api } from "@/lib/api";
import type { HorarioGrupo } from "@/types";

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
  // Convertir campos al formato que espera el backend
  const payload = {
    grupo_id: horario.grupo_id,
    bloque_horario_id: horario.bloque_id,
    aula_id: horario.aula_id,
    tipo: horario.tipo,
  };
  return api.post<HorarioGrupo>("/horarios-grupo", payload);
};

export const updateHorario = async (
  id: string,
  horario: Partial<CreateHorarioData>
): Promise<HorarioGrupo> => {
  // Convertir campos al formato que espera el backend
  const payload: any = {
    ...horario,
  };
  if (horario.bloque_id) {
    payload.bloque_horario_id = horario.bloque_id;
    delete payload.bloque_id;
  }
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
  tiene_conflicto: boolean;
  conflictos: Array<{
    tipo: string;
    mensaje: string;
    horario?: HorarioGrupo;
  }>;
}> => {
  // Convertir bloque_id a bloque_horario_id para el backend
  const payload = {
    grupo_id: data.grupo_id,
    bloque_horario_id: data.bloque_id,
    aula_id: data.aula_id,
  };
  
  return api.post<{
    tiene_conflicto: boolean;
    conflictos: Array<{
      tipo: string;
      mensaje: string;
      horario?: HorarioGrupo;
    }>;
  }>("/horarios-grupo/verificar-conflictos", payload);
};
