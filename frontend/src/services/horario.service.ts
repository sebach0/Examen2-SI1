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
  return api.post<HorarioGrupo>("/horarios-grupo", horario);
};

export const updateHorario = async (
  id: string,
  horario: Partial<CreateHorarioData>
): Promise<HorarioGrupo> => {
  return api.put<HorarioGrupo>(`/horarios-grupo/${id}`, horario);
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
  return api.post<{
    tiene_conflicto: boolean;
    conflictos: Array<{
      tipo: string;
      mensaje: string;
      horario?: HorarioGrupo;
    }>;
  }>("/horarios-grupo/verificar-conflictos", data);
};
