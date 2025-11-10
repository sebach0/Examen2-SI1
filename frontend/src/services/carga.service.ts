/**
 * 👨‍🏫 SERVICIO DE CARGAS DOCENTES
 * ==================================
 * Gestiona asignación de docentes a grupos
 */

import { api } from "@/lib/api";
import type { CargaDocente } from "@/types";

export interface CreateCargaData {
  docente_id: string;
  grupo_id: string;
  horas_asignadas: number;
}

export const getCargas = async (): Promise<CargaDocente[]> => {
  return api.get<CargaDocente[]>("/cargas-docentes?all=true");
};

export const getCargaById = async (id: string): Promise<CargaDocente> => {
  return api.get<CargaDocente>(`/cargas-docentes/${id}`);
};

export const getCargasByDocente = async (
  docente_id: string
): Promise<CargaDocente[]> => {
  return api.get<CargaDocente[]>(`/cargas-docentes/docente/${docente_id}`);
};

export const getCargasByGrupo = async (
  grupo_id: string
): Promise<CargaDocente[]> => {
  return api.get<CargaDocente[]>(`/cargas-docentes/grupo/${grupo_id}`);
};

export const createCarga = async (
  carga: CreateCargaData
): Promise<CargaDocente> => {
  return api.post<CargaDocente>("/cargas-docentes", carga);
};

export const updateCarga = async (
  id: string,
  carga: Partial<CreateCargaData>
): Promise<CargaDocente> => {
  return api.put<CargaDocente>(`/cargas-docentes/${id}`, carga);
};

export const deleteCarga = async (id: string): Promise<void> => {
  await api.delete(`/cargas-docentes/${id}`);
};
