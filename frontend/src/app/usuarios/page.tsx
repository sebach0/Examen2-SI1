"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getUsuarios,
  deleteUsuario,
  cambiarEstado,
  type UsuarioFilters,
} from "@/services/usuario.service";
import { getRoles } from "@/services/rol.service";
import type { Usuario, Rol, PaginatedResponse } from "@/types";

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Filtros
  const [search, setSearch] = useState("");
  const [estadoSeleccionado, setEstadoSeleccionado] = useState("");
  const [rolSeleccionado, setRolSeleccionado] = useState("");

  useEffect(() => {
    loadRoles();
  }, []);

  useEffect(() => {
    loadUsuarios();
  }, [pagination.current_page, estadoSeleccionado, rolSeleccionado]);

  const loadRoles = async () => {
    try {
      const response: any = await getRoles({ per_page: 100 });
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    }
  };

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const filters: UsuarioFilters = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search,
        estado: estadoSeleccionado as any,
        rol_id: rolSeleccionado,
      };

      const response = (await getUsuarios(
        filters
      )) as PaginatedResponse<Usuario>;
      setUsuarios(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert("Error al cargar la lista de usuarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    loadUsuarios();
  };

  const handleCambiarEstado = async (
    id: string,
    username: string,
    estadoActual: string
  ) => {
    const nuevoEstado = estadoActual === "activo" ? "suspendido" : "activo";
    const accion = nuevoEstado === "activo" ? "activar" : "suspender";

    if (!confirm(`¿Estás seguro de ${accion} al usuario "${username}"?`))
      return;

    try {
      await cambiarEstado(id, nuevoEstado);
      alert(
        `Usuario ${
          nuevoEstado === "activo" ? "activado" : "suspendido"
        } exitosamente`
      );
      loadUsuarios();
    } catch (error: any) {
      const message = error.message || `Error al ${accion} el usuario`;
      alert(message);
    }
  };

  const handleDelete = async (id: string, username: string) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar al usuario "${username}"?\n\nEsta acción no se puede deshacer.`
      )
    )
      return;

    try {
      await deleteUsuario(id);
      alert("Usuario eliminado exitosamente");
      loadUsuarios();
    } catch (error: any) {
      const message = error.message || "Error al eliminar usuario";
      alert(message);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page });
  };

  const getEstadoBadge = (estado: string) => {
    return estado === "activo" ? (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ✕ Suspendido
      </span>
    );
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              👥 Gestión de Usuarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/usuarios/nuevo")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span>➕</span>
            Nuevo Usuario
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="🔍 Buscar por username o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Buscar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="activo">✓ Activos</option>
                <option value="suspendido">✕ Suspendidos</option>
              </select>
              <select
                value={rolSeleccionado}
                onChange={(e) => setRolSeleccionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron usuarios
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                          {usuario.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {usuario.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      📧 {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {usuario.roles && usuario.roles.length > 0 ? (
                          usuario.roles.map((rol) => (
                            <span
                              key={rol.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              🎭 {rol.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 italic">
                            Sin roles
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(usuario.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => router.push(`/usuarios/${usuario.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleCambiarEstado(
                              usuario.id,
                              usuario.username,
                              usuario.estado
                            )
                          }
                          className={
                            usuario.estado === "activo"
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }
                          title={
                            usuario.estado === "activo"
                              ? "Suspender"
                              : "Activar"
                          }
                        >
                          {usuario.estado === "activo" ? "🚫" : "✅"}
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(usuario.id, usuario.username)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {!loading && usuarios.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Mostrando{" "}
                <span className="font-medium">
                  {(pagination.current_page - 1) * pagination.per_page + 1}
                </span>{" "}
                a{" "}
                <span className="font-medium">
                  {Math.min(
                    pagination.current_page * pagination.per_page,
                    pagination.total
                  )}
                </span>{" "}
                de <span className="font-medium">{pagination.total}</span>{" "}
                resultados
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  ← Anterior
                </button>
                <span className="px-3 py-1 border border-gray-300 rounded-md bg-white">
                  Página {pagination.current_page} de {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
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
