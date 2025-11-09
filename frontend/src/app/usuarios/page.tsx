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
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";

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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
        ✓ Activo
      </span>
    ) : (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
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
            <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Gestión de Usuarios
            </h1>
            <p className="text-slate-400 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/usuarios/nuevo")}
            className="bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-glow"
          >
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </button>
        </div>

        {/* Filtros */}
        <div className="glass rounded-lg p-4 mb-6 border border-slate-700">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por username o email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 placeholder-slate-400 transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all shadow-glow"
              >
                Buscar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={estadoSeleccionado}
                onChange={(e) => setEstadoSeleccionado(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 transition-all"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="suspendido">Suspendidos</option>
              </select>
              <select
                value={rolSeleccionado}
                onChange={(e) => setRolSeleccionado(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 transition-all"
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
        <div className="glass rounded-lg overflow-hidden border border-slate-700">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-400">Cargando usuarios...</p>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No se encontraron usuarios
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-r from-blue-500 to-violet-500 flex items-center justify-center text-white font-semibold shadow-glow">
                          {usuario.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-100">
                            {usuario.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      📧 {usuario.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <div className="flex flex-wrap gap-1">
                        {usuario.roles && usuario.roles.length > 0 ? (
                          usuario.roles.map((rol) => (
                            <span
                              key={rol.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            >
                              🎭 {rol.nombre}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic">
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
                          className="text-blue-400 hover:text-blue-300 p-1 transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleCambiarEstado(
                              usuario.id,
                              usuario.username,
                              usuario.estado
                            )
                          }
                          className={`p-1 transition-colors ${
                            usuario.estado === "activo"
                              ? "text-orange-400 hover:text-orange-300"
                              : "text-green-400 hover:text-green-300"
                          }`}
                          title={
                            usuario.estado === "activo"
                              ? "Suspender"
                              : "Activar"
                          }
                        >
                          {usuario.estado === "activo" ? (
                            <Ban className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(usuario.id, usuario.username)
                          }
                          className="text-red-400 hover:text-red-300 p-1 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
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
