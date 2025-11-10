/**
 * 🏢 SERVICIO DE EDIFICIOS
 * =========================
 * Gestiona edificios de la infraestructura
 */

import { api } from "@/lib/api";
import type { Edificio } from "@/types";

export const getEdificios = async (): Promise<Edificio[]> => {
  return api.get<Edificio[]>("/edificios?all=true");
};

export const getEdificioById = async (id: string): Promise<Edificio> => {
  return api.get<Edificio>(`/edificios/${id}`);
};

export const createEdificio = async (
  edificio: Omit<Edificio, "id" | "aulas">
): Promise<Edificio> => {
  return api.post<Edificio>("/edificios", edificio);
};

export const updateEdificio = async (
  id: string,
  edificio: Partial<Omit<Edificio, "id" | "aulas">>
): Promise<Edificio> => {
  return api.put<Edificio>(`/edificios/${id}`, edificio);
};

export const deleteEdificio = async (id: string): Promise<void> => {
  await api.delete(`/edificios/${id}`);
};
