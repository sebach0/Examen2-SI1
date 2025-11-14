"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getDocentes,
  deleteDocente,
  exportarDocentes,
  type DocenteFilters,
} from "@/services/docente.service";
import type { Docente, PaginatedResponse } from "@/types";

export default function DocentesPage() {
  const router = useRouter();
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // Filtros
  const [search, setSearch] = useState("");
  const [estado, setEstado] = useState<"" | "activo" | "suspendido">("");

  useEffect(() => {
    loadDocentes();
  }, [pagination.current_page, estado]);

  const loadDocentes = async () => {
    try {
      setLoading(true);
      const filters: DocenteFilters = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search,
        estado: estado || undefined,
      };

      const response = (await getDocentes(
        filters
      )) as PaginatedResponse<Docente>;
      setDocentes(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error al cargar docentes:", error);
      alert("Error al cargar la lista de docentes");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    loadDocentes();
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar al docente "${nombre}"?`)) return;

    try {
      await deleteDocente(id);
      alert("Docente eliminado exitosamente");
      loadDocentes();
    } catch (error: any) {
      const message = error.message || "Error al eliminar docente";
      alert(message);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page });
  };

  const handleExportar = async (formato: "excel" | "pdf") => {
    try {
      const filters: DocenteFilters = {
        search,
        estado: estado || undefined,
      };

      const blob = await exportarDocentes(filters, formato);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `docentes-${new Date().toISOString().split("T")[0]}.${
        formato === "excel" ? "xlsx" : "pdf"
      }`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error: any) {
      console.error("Error al exportar:", error);
      let errorMessage = "Error al exportar docentes";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.status === 401) {
        errorMessage = "No autorizado. Por favor, inicia sesión nuevamente.";
      } else if (error.status === 500) {
        errorMessage = "Error del servidor. Por favor, intenta más tarde.";
      }
      alert(errorMessage);
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              👨‍🏫 Gestión de Docentes
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Administra los docentes del sistema
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleExportar("excel")}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              title="Exportar a Excel"
            >
              <span>📊</span>
              Excel
            </button>
            <button
              onClick={() => handleExportar("pdf")}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
              title="Exportar a PDF"
            >
              <span>📄</span>
              PDF
            </button>
            <button
              onClick={() => router.push("/docentes/nuevo")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-glow"
            >
              <span>➕</span>
              Nuevo Docente
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass rounded-lg p-4 mb-6 border border-slate-700">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="🔍 Buscar por nombre, CI, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 placeholder-slate-400"
            />
            <select
              value={estado}
              onChange={(e) =>
                setEstado(e.target.value as "" | "activo" | "suspendido")
              }
              className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="suspendido">Suspendido</option>
            </select>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all shadow-glow"
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div className="glass rounded-lg overflow-hidden border border-slate-700">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-400">Cargando docentes...</p>
            </div>
          ) : docentes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No se encontraron docentes
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    CI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {docentes.map((docente) => (
                  <tr
                    key={docente.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-mono">
                      {docente.ci}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-100">
                      {docente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {docente.usuario?.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {docente.usuario?.username || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full border ${
                          docente.usuario?.estado === "activo"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : "bg-red-500/20 text-red-400 border-red-500/30"
                        }`}
                      >
                        {docente.usuario?.estado || "desconocido"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {docente.usuario?.roles &&
                      docente.usuario.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {docente.usuario.roles.slice(0, 3).map((rol) => (
                            <span
                              key={rol.id}
                              className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30"
                            >
                              {rol.nombre}
                            </span>
                          ))}
                          {docente.usuario.roles.length > 3 && (
                            <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">
                              +{docente.usuario.roles.length - 3} más
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin roles</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/docentes/${docente.id}`)}
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(docente.id, docente.nombre)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {!loading && docentes.length > 0 && (
            <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-t border-slate-700">
              <div className="text-sm text-slate-300">
                Mostrando{" "}
                <span className="font-medium text-blue-400">
                  {(pagination.current_page - 1) * pagination.per_page + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium text-blue-400">
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total
                  )}
                </span>{" "}
                de{" "}
                <span className="font-medium text-blue-400">
                  {pagination.total}
                </span>{" "}
                resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 transition-all"
                >
                  ← Anterior
                </button>
                <span className="px-3 py-1 border border-slate-600 rounded-md bg-slate-800 text-slate-200">
                  Página {pagination.current_page} de {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 border border-slate-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 text-slate-300 transition-all"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
