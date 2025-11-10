/**
 * 📅 SERVICIO DE GESTIONES
 * =========================
 * Gestiona periodos académicos (semestres, años)
 */

import { api } from "@/lib/api";
import type { Gestion } from "@/types";

export const getGestiones = async (): Promise<Gestion[]> => {
  return api.get<Gestion[]>("/gestiones?all=true");
};

export const getGestionById = async (id: string): Promise<Gestion> => {
  return api.get<Gestion>(`/gestiones/${id}`);
};

export const createGestion = async (
  gestion: Omit<Gestion, "id">
): Promise<Gestion> => {
  return api.post<Gestion>("/gestiones", gestion);
};

export const updateGestion = async (
  id: string,
  gestion: Partial<Omit<Gestion, "id">>
): Promise<Gestion> => {
  return api.put<Gestion>(`/gestiones/${id}`, gestion);
};

export const deleteGestion = async (id: string): Promise<void> => {
  await api.delete(`/gestiones/${id}`);
};

/**
 * Obtiene la gestión activa actual desde el backend
 */
export const getGestionActiva = async (): Promise<Gestion | null> => {
  try {
    return await api.get<Gestion>("/gestiones/activa");
  } catch {
    return null;
  }
};
