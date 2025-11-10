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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            📋 Bitácora del Sistema
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Registro completo de actividades y eventos del sistema
          </p>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6">
              <div className="text-sm font-medium text-slate-400">
                Total Eventos
              </div>
              <div className="mt-2 text-3xl font-bold text-slate-100">
                {estadisticas.total_eventos.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6">
              <div className="text-sm font-medium text-slate-400">
                Logins Exitosos
              </div>
              <div className="mt-2 text-3xl font-bold text-green-400">
                {estadisticas.logins_exitosos.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6">
              <div className="text-sm font-medium text-slate-400">
                Logins Fallidos
              </div>
              <div className="mt-2 text-3xl font-bold text-red-400">
                {estadisticas.logins_fallidos.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6">
              <div className="text-sm font-medium text-slate-400">
                Usuarios Activos
              </div>
              <div className="mt-2 text-3xl font-bold text-blue-400">
                {estadisticas.usuarios_activos.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6">
          <h2 className="text-lg font-semibold text-slate-100 mb-4">
            🔍 Filtros
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Acción */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Acción
                </label>
                <select
                  name="accion"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-slate-800">
                    Todas las acciones
                  </option>
                  {ACCIONES_BITACORA.map((accion) => (
                    <option
                      key={accion.value}
                      value={accion.value}
                      className="bg-slate-800"
                    >
                      {accion.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha desde */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Desde
                </label>
                <input
                  type="date"
                  name="desde"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha hasta */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Hasta
                </label>
                <input
                  type="date"
                  name="hasta"
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones */}
              <div className="flex items-end space-x-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors font-medium"
                >
                  Buscar
                </button>
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 bg-slate-600 text-slate-100 px-4 py-2 rounded-md hover:bg-slate-500 transition-colors font-medium"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Tabla de registros */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-600">
            <h2 className="text-lg font-semibold text-slate-100">
              Registros de Actividad
            </h2>
            <p className="text-sm text-slate-400">
              Total: {total.toLocaleString()} registros
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-300">Cargando registros...</p>
            </div>
          ) : registros.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No se encontraron registros
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-600">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Acción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        IP
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Método
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Detalles
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-600">
                    {registros.map((registro) => (
                      <React.Fragment key={registro.id}>
                        <tr className="hover:bg-slate-700/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                            {formatDate(registro.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {registro.usuario ? (
                              <div>
                                <div className="font-medium text-slate-200">
                                  {registro.usuario.username}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {registro.usuario.email}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500">Sistema</span>
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
                          <td className="px-6 py-4 text-sm text-slate-200 max-w-xs truncate">
                            {registro.descripcion || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {registro.ip || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`font-medium ${
                                registro.metodo_http === "GET"
                                  ? "text-blue-400"
                                  : registro.metodo_http === "POST"
                                  ? "text-green-400"
                                  : registro.metodo_http === "PUT"
                                  ? "text-yellow-400"
                                  : registro.metodo_http === "DELETE"
                                  ? "text-red-400"
                                  : "text-slate-400"
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
                                  ? "text-green-400"
                                  : registro.codigo_http &&
                                    registro.codigo_http >= 400
                                  ? "text-red-400"
                                  : "text-slate-400"
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
                                className="text-blue-400 hover:text-blue-300 font-medium"
                              >
                                {expandedRow === registro.id ? "▼" : "▶"}
                              </button>
                            )}
                          </td>
                        </tr>

                        {/* Fila expandida con JSON */}
                        {expandedRow === registro.id && (
                          <tr>
                            <td
                              colSpan={8}
                              className="px-6 py-4 bg-slate-900/50"
                            >
                              <div className="space-y-4">
                                {/* Ruta */}
                                {registro.ruta && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                      Ruta:
                                    </h4>
                                    <code className="block bg-slate-800 p-2 rounded border border-slate-600 text-sm text-slate-200">
                                      {registro.ruta}
                                    </code>
                                  </div>
                                )}

                                {/* User Agent */}
                                {registro.user_agent && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                      User Agent:
                                    </h4>
                                    <code className="block bg-slate-800 p-2 rounded border border-slate-600 text-sm text-slate-200">
                                      {registro.user_agent}
                                    </code>
                                  </div>
                                )}

                                {/* Request Data */}
                                {registro.datos_request && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                      Datos de Request:
                                    </h4>
                                    <pre className="bg-slate-800 p-3 rounded border border-slate-600 text-xs overflow-x-auto text-slate-200">
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
                                    <h4 className="text-sm font-semibold text-slate-300 mb-1">
                                      Datos de Response:
                                    </h4>
                                    <pre className="bg-slate-800 p-3 rounded border border-slate-600 text-xs overflow-x-auto text-slate-200">
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
                <div className="px-6 py-4 border-t border-slate-600 flex items-center justify-between">
                  <div className="text-sm text-slate-400">
                    Página {currentPage} de {totalPages}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                                className="px-4 py-2 text-slate-400"
                              >
                                ...
                              </span>
                            )}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600"
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
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-sm font-medium text-slate-200 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
