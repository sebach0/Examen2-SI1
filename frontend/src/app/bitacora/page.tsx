"use client";

/**
 * 📋 PÁGINA DE BITÁCORA
 * ======================
 * Muestra el registro de actividades del sistema con filtros y paginación
 */

import React, { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getBitacora,
  getBitacoraEstadisticas,
  ACCIONES_BITACORA,
  getAccionLabel,
  getAccionColor,
} from "@/services/bitacora.service";
import type { Bitacora, BitacoraEstadisticas, BitacoraFiltros } from "@/types";

export default function BitacoraPage() {
  const [registros, setRegistros] = useState<Bitacora[]>([]);
  const [estadisticas, setEstadisticas] = useState<BitacoraEstadisticas | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filtrosActuales, setFiltrosActuales] = useState<BitacoraFiltros>({});

  // Cargar estadísticas al montar
  useEffect(() => {
    loadEstadisticas();
  }, []);

  // Cargar registros inicial
  useEffect(() => {
    loadRegistros({});
  }, []);

  const loadEstadisticas = async () => {
    try {
      const data = await getBitacoraEstadisticas(30);
      setEstadisticas(data);
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const loadRegistros = async (filtros: BitacoraFiltros) => {
    setLoading(true);
    try {
      const response = await getBitacora({
        ...filtros,
        page: currentPage,
        per_page: 15,
      });

      setRegistros(response.data);
      setCurrentPage(response.current_page);
      setTotalPages(response.last_page);
      setTotal(response.total);
    } catch (error) {
      console.error("Error al cargar bitácora:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const filtros: BitacoraFiltros = {
      accion: (formData.get("accion") as string) || undefined,
      desde: (formData.get("desde") as string) || undefined,
      hasta: (formData.get("hasta") as string) || undefined,
    };
    setFiltrosActuales(filtros);
    setCurrentPage(1);
    loadRegistros(filtros);
  };

  const handleClearFilters = () => {
    // Reset form
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) form.reset();

    setFiltrosActuales({});
    setCurrentPage(1);
    loadRegistros({});
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadRegistros({ ...filtrosActuales, page });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            📋 Bitácora del Sistema
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Registro completo de actividades y eventos del sistema
          </p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">
                Total Eventos
              </div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {estadisticas.total_eventos.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">
                Logins Exitosos
              </div>
              <div className="mt-2 text-3xl font-bold text-green-600">
                {estadisticas.logins_exitosos.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">
                Logins Fallidos
              </div>
              <div className="mt-2 text-3xl font-bold text-red-600">
                {estadisticas.logins_fallidos.toLocaleString()}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-sm font-medium text-gray-600">
                Usuarios Activos
              </div>
              <div className="mt-2 text-3xl font-bold text-blue-600">
                {estadisticas.usuarios_activos.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            🔍 Filtros
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Acción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Acción
                </label>
                <select
                  name="accion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las acciones</option>
                  {ACCIONES_BITACORA.map((accion) => (
                    <option key={accion.value} value={accion.value}>
                      {accion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  name="desde"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  name="hasta"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones */}
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tabla de registros */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registros de Actividad
            </h2>
            <p className="text-sm text-gray-600">
              Total: {total.toLocaleString()} registros
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando registros...</p>
            </div>
          ) : registros.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron registros
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {registros.map((registro) => (
                      <React.Fragment key={registro.id}>
                        <tr className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(registro.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {registro.usuario ? (
                              <div>
                                <div className="font-medium text-gray-900">
                                  {registro.usuario.username}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {registro.usuario.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">Sistema</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccionColor(
                                registro.accion
                              )}`}
                            >
                              {getAccionLabel(registro.accion)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {registro.descripcion || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registro.ip || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${
                                registro.metodo_http === "GET"
                                  ? "text-blue-600"
                                  : registro.metodo_http === "POST"
                                  ? "text-green-600"
                                  : registro.metodo_http === "PUT"
                                  ? "text-yellow-600"
                                  : registro.metodo_http === "DELETE"
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {registro.metodo_http || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${
                                registro.codigo_http &&
                                registro.codigo_http >= 200 &&
                                registro.codigo_http < 300
                                  ? "text-green-600"
                                  : registro.codigo_http &&
                                    registro.codigo_http >= 400
                                  ? "text-red-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {registro.codigo_http || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {(registro.datos_request ||
                              registro.datos_response) && (
                              <button
                                onClick={() => toggleExpandRow(registro.id)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                {expandedRow === registro.id ? "▼" : "▶"}
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Fila expandida con JSON */}
                        {expandedRow === registro.id && (
                          <tr>
                            <td colSpan={8} className="px-6 py-4 bg-gray-50">
                              <div className="space-y-4">
                                {/* Ruta */}
                                {registro.ruta && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      Ruta:
                                    </h4>
                                    <code className="block bg-white p-2 rounded border text-sm">
                                      {registro.ruta}
                                    </code>
                                  </div>
                                )}

                                {/* User Agent */}
                                {registro.user_agent && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      User Agent:
                                    </h4>
                                    <code className="block bg-white p-2 rounded border text-sm">
                                      {registro.user_agent}
                                    </code>
                                  </div>
                                )}

                                {/* Request Data */}
                                {registro.datos_request && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      Datos de Request:
                                    </h4>
                                    <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
                                      {JSON.stringify(
                                        registro.datos_request,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                )}

                                {/* Response Data */}
                                {registro.datos_response && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      Datos de Response:
                                    </h4>
                                    <pre className="bg-white p-3 rounded border text-xs overflow-x-auto">
                                      {JSON.stringify(
                                        registro.datos_response,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>

                    {/* Páginas numeradas */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((page) => {
                        // Mostrar primera, última, actual y 2 páginas alrededor
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        // Agregar "..." si hay salto
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <React.Fragment key={`page-fragment-${page}`}>
                            {showEllipsis && (
                              <span
                                key={`ellipsis-${page}`}
                                className="px-4 py-2"
                              >
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 border rounded-md text-sm font-medium ${
                                currentPage === page
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      })}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
