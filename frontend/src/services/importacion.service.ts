/**
 * 📥 SERVICIO DE IMPORTACIÓN
 * ===========================
 * Gestiona la importación masiva de datos desde archivos Excel/CSV
 */

import { api } from "@/lib/api";

export interface ImportResult {
  job_id: string;
  importados: number;
  fallidos: number;
  errores: Array<{
    fila: number | string;
    error: string;
    datos?: any;
  }>;
  estado: string;
}

export interface ImportJob {
  id: string;
  tipo: string;
  estado: string;
  total: number;
  procesados: number;
  errores: number;
  porcentaje: number;
  detalle_error: any;
  creado_en: string;
}

/**
 * Importar usuarios desde archivo Excel/CSV
 */
export const importarUsuarios = async (
  archivo: File
): Promise<ImportResult> => {
  const formData = new FormData();
  formData.append("archivo", archivo);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const response = await fetch(`${apiUrl}/importacion/usuarios`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { 
        message: `Error ${response.status}: ${response.statusText}` 
      };
    }
    
    // Crear un error con la estructura esperada por el frontend
    const error = new Error(errorData.message || "Error al importar usuarios");
    (error as any).response = {
      data: errorData,
      status: response.status,
      statusText: response.statusText
    };
    throw error;
  }

  const data = await response.json();
  return data.data;
};

/**
 * Obtener historial de importaciones
 */
export const getHistorialImportaciones = async (params?: {
  tipo?: string;
  estado?: string;
  page?: number;
  perPage?: number;
}) => {
  const queryParams = new URLSearchParams();
  if (params?.tipo) queryParams.append("tipo", params.tipo);
  if (params?.estado) queryParams.append("estado", params.estado);
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.perPage) queryParams.append("perPage", params.perPage.toString());

  const url = `/importacion/historial${
    queryParams.toString() ? `?${queryParams.toString()}` : ""
  }`;
  return api.get(url);
};

/**
 * Obtener detalle de una importación
 */
export const getImportacionById = async (id: string): Promise<ImportJob> => {
  const response = await api.get<{ data: ImportJob }>(`/importacion/${id}`);
  return response.data.data;
};
