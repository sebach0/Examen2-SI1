"use client";

/**
 * 🎭 PÁGINA DE ROLES
 * ==================
 * Lista todos los roles del sistema con sus permisos asignados
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getRoles, deleteRol } from "@/services/rol.service";
import type { Rol } from "@/types";

export default function RolesPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadRoles();
  }, [currentPage, searchTerm]);

  const loadRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoles({
        search: searchTerm || undefined,
        page: currentPage,
        per_page: 10,
      });

      if (Array.isArray(response)) {
        setRoles(response);
      } else {
        setRoles(response.data);
        setCurrentPage(response.current_page);
        setTotalPages(response.last_page);
        setTotal(response.total);
      }
    } catch (error) {
      console.error("Error al cargar roles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRoles();
  };

  const handleDelete = async (rol: Rol) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar el rol "${rol.nombre}"?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await deleteRol(rol.id);
      alert(`Rol "${rol.nombre}" eliminado exitosamente`);
      loadRoles();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Error al eliminar el rol";
      alert(message);
    }
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🎭 Roles</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gestiona los roles y sus permisos del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/roles/nuevo")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Nuevo Rol
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
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

        {/* Lista de Roles */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Roles
            </h2>
            <p className="text-sm text-gray-600">
              Total: {total.toLocaleString()} roles
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Cargando roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No se encontraron roles
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {roles.map((rol) => (
                <div
                  key={rol.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {rol.nombre}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                          {rol.permisos?.length || 0} permisos
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{rol.descripcion}</p>

                      {/* Permisos asignados */}
                      {rol.permisos && rol.permisos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rol.permisos.slice(0, 5).map((permiso) => (
                            <span
                              key={permiso.id}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              title={permiso.descripcion}
                            >
                              {permiso.codigo}
                            </span>
                          ))}
                          {rol.permisos.length > 5 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded">
                              +{rol.permisos.length - 5} más
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => router.push(`/roles/${rol.id}`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(rol)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
        </div>
      </div>
    </ProtectedLayout>
  );
}
