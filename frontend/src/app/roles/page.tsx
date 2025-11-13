"use client";

/**
 * 🎭 PÁGINA DE ROLES
 * ==================
 * Lista todos los roles del sistema con sus permisos asignados
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { Icon } from "@/components/shared/Icon";
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
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Icon name="settings" className="text-blue-400" size={32} />
              Roles
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Gestiona los roles y sus permisos del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/roles/nuevo")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-glow"
          >
            + Nuevo Rol
          </button>
        </div>

        {/* Búsqueda */}
        <div className="glass border-slate-700 rounded-lg p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-100 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-glow"
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
                className="bg-slate-700 text-slate-300 px-6 py-2 rounded-md hover:bg-slate-600 transition-colors"
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        {/* Lista de Roles */}
        <div className="glass border-slate-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-slate-100">
              Lista de Roles
            </h2>
            <p className="text-sm text-slate-400">
              Total: {total.toLocaleString()} roles
            </p>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-slate-400">Cargando roles...</p>
            </div>
          ) : roles.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              No se encontraron roles
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {roles.map((rol) => (
                <div
                  key={rol.id}
                  className="p-6 hover:bg-slate-700/30 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-100">
                          {rol.nombre}
                        </h3>
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-medium rounded-full">
                          {rol.permisos?.length || 0} permisos
                        </span>
                      </div>
                      <p className="text-slate-300 mb-3">{rol.descripcion}</p>

                      {/* Permisos asignados */}
                      {rol.permisos && rol.permisos.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {rol.permisos.slice(0, 5).map((permiso) => (
                            <span
                              key={permiso.id}
                              className="px-2 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs rounded"
                              title={permiso.descripcion}
                            >
                              {permiso.codigo}
                            </span>
                          ))}
                          {rol.permisos.length > 5 && (
                            <span className="px-2 py-1 bg-slate-500/20 text-slate-400 border border-slate-500/30 text-xs rounded">
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
                        <Icon name="edit" size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(rol)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                      >
                        <Icon name="delete" size={16} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-700 flex items-center justify-between">
              <div className="text-sm text-slate-300">
                Página{" "}
                <span className="font-medium text-blue-400">{currentPage}</span>{" "}
                de{" "}
                <span className="font-medium text-blue-400">{totalPages}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-600 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-600 rounded-md text-sm font-medium text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
