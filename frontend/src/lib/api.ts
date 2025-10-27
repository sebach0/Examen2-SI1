/**
 * 📝 CLIENTE API
 * ==============
 * Cliente HTTP para comunicarse con el backend Laravel
 * Maneja tokens, cookies httpOnly, errores y refreshing
 */

import { env } from "./env";
import type { ApiError, ApiResponse } from "@/types";

const API_URL = env.NEXT_PUBLIC_API_URL;

/**
 * Configuración por defecto para fetch
 */
const defaultOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  credentials: "include", // Importante para cookies httpOnly
};

/**
 * Cliente API genérico
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  /**
   * Request genérico con manejo de errores
   */
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Obtener token del localStorage
    const token =
      typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
      });

      // Si no es exitoso, lanzar error
      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: "Error desconocido",
          status: response.status,
        }));

        throw {
          ...error,
          status: response.status,
        };
      }

      // Retornar JSON directamente (sin wrapper ApiResponse)
      const data = await response.json();
      return data;
    } catch (error) {
      // Re-lanzar errores de API
      if ((error as ApiError).status) {
        throw error;
      }

      // Error de red u otro
      throw {
        message: "Error de conexión con el servidor",
        status: 0,
      } as ApiError;
    }
  }
}

// Exportar instancia única
export const api = new ApiClient();
