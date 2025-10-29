"use client";

/**
 * 🔐 PÁGINA DE PERMISOS
 * ======================
 * Lista todos los permisos del sistema
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getPermisos, deletePermiso } from "@/services/permiso.service";
import type { Permiso } from "@/types";

export default function PermisosPage() {
  const router = useRouter();
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadPermisos();
  }, [currentPage, searchTerm]);

  const loadPermisos = async () => {
    setLoading(true);
    try {
      const response = await getPermisos({
        search: searchTerm || undefined,
        page: currentPage,
        per_page: 15,
      });

      if (Array.isArray(response)) {
        setPermisos(response);
      } else {
        setPermisos(response.data);
        setCurrentPage(response.current_page);
        setTotalPages(response.last_page);
        setTotal(response.total);
      }
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPermisos();
  };

  const handleDelete = async (permiso: Permiso) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el permiso "${permiso.codigo}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deletePermiso(permiso.id);
      alert(`Permiso "${permiso.codigo}" eliminado exitosamente`);
      loadPermisos();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar el permiso";
      alert(message);
    }
  };

  const getModuloColor = (codigo: string) => {
    const modulo = codigo.split(".")[0];
    const colors: Record<string, string> = {
      academico: "bg-blue-100 text-blue-800",
      asistencia: "bg-green-100 text-green-800",
      infraestructura: "bg-purple-100 text-purple-800",
      horarios: "bg-yellow-100 text-yellow-800",
      auth: "bg-red-100 text-red-800",
      sistema: "bg-gray-100 text-gray-800",
    };
    return colors[modulo] || "bg-gray-100 text-gray-800";
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🔐 Permisos</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona los permisos del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/permisos/nuevo")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nuevo Permiso
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setCurrentPage(1);
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        {/* Tabla de Permisos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Permisos
            </h2>
            <p className="text-sm text-gray-600">
              Total: {total.toLocaleString()} permisos
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando permisos...</p>
            </div>
          ) : permisos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron permisos
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descripción
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roles
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {permisos.map((permiso) => (
                      <tr key={permiso.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs font-mono font-medium rounded ${getModuloColor(
                              permiso.codigo
                            )}`}
                          >
                            {permiso.codigo}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {permiso.descripcion}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {permiso.roles && permiso.roles.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {permiso.roles.slice(0, 3).map((rol) => (
                                <span
                                  key={rol.id}
                                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                >
                                  {rol.nombre}
                                </span>
                              ))}
                              {permiso.roles.length > 3 && (
                                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                                  +{permiso.roles.length - 3}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">
                              Sin asignar
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              router.push(`/permisos/${permiso.id}`)
                            }
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            ✏️ Editar
                          </button>
                          <button
                            onClick={() => handleDelete(permiso)}
                            className="text-red-600 hover:text-red-900"
                          >
                            🗑️ Eliminar
                          </button>
                        </td>
                      </tr>
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
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
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
