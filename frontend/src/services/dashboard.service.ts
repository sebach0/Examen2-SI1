/**
 * 📊 SERVICIO DE DASHBOARD
 * =========================
 * Gestiona las estadísticas del dashboard
 */

import { api } from "@/lib/api";

export interface DashboardEstadisticas {
  resumen: {
    asistencias_hoy: number;
    cambio_asistencias: number;
    grupos_activos: number;
    total_docentes: number;
    docentes_activos: number;
    ausencias_hoy: number;
    cambio_ausencias: number;
  };
  graficos: {
    asistencias_por_estado: Array<{
      estado: string;
      total: number;
    }>;
    asistencias_por_dia: Array<{
      fecha: string;
      fecha_formateada: string;
      total: number;
    }>;
    top_docentes: Array<{
      docente: string;
      total: number;
    }>;
  };
  actividad_reciente: Array<{
    id: string;
    fecha: string;
    fecha_formateada: string;
    docente: string;
    grupo: string;
    materia: string;
    estado: string;
    created_at: string;
    tiempo_relativo: string;
  }>;
  totales: {
    grupos: number;
    materias: number;
    horarios: number;
    gestion_activa: string | null;
  };
}

/**
 * Obtiene las estadísticas del dashboard
 */
export const getEstadisticas = async (): Promise<DashboardEstadisticas> => {
  return api.get<DashboardEstadisticas>("/dashboard/estadisticas");
};

