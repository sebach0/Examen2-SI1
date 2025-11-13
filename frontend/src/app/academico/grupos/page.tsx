"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { Icon } from "@/components/shared/Icon";
import {
  getGrupos,
  deleteGrupo,
  getGestiones,
  type GrupoFilters,
} from "@/services/grupo.service";
import { getAllMaterias } from "@/services/materia.service";
import { getCarreras } from "@/services/materia.service";
import type {
  Grupo,
  Gestion,
  Materia,
  Carrera,
  PaginatedResponse,
} from "@/types";

export default function GruposPage() {
  const router = useRouter();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Filtros
  const [search, setSearch] = useState("");
  const [gestionId, setGestionId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [carreraId, setCarreraId] = useState("");

  useEffect(() => {
    loadGestiones();
    loadMaterias();
    loadCarreras();
  }, []);

  useEffect(() => {
    loadGrupos();
  }, [pagination.current_page, gestionId, materiaId, carreraId]);

  const loadGestiones = async () => {
    try {
      const data = await getGestiones();
      setGestiones(data);
    } catch (error) {
      console.error("Error al cargar gestiones:", error);
    }
  };

  const loadMaterias = async () => {
    try {
      const data = await getAllMaterias();
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    }
  };

  const loadCarreras = async () => {
    try {
      const data = await getCarreras();
      setCarreras(data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  };

  const loadGrupos = async () => {
    try {
      setLoading(true);
      const filters: GrupoFilters = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search,
        gestion_id: gestionId || undefined,
        materia_id: materiaId || undefined,
        carrera_id: carreraId || undefined,
      };

      const response = (await getGrupos(filters)) as PaginatedResponse<Grupo>;
      setGrupos(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      alert("Error al cargar la lista de grupos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    loadGrupos();
  };

  const handleDelete = async (id: string, codigo: string, materia: string) => {
    if (
      !confirm(`¿Estás seguro de eliminar el grupo "${codigo}" de ${materia}?`)
    )
      return;

    try {
      await deleteGrupo(id);
      alert("Grupo eliminado exitosamente");
      loadGrupos();
    } catch (error: any) {
      const message = error.message || "Error al eliminar grupo";
      alert(message);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page });
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              <Icon name="users" className="text-blue-400" size={32} />
              Gestión de Grupos
            </h1>
            <p className="text-slate-400 mt-1">
              Administra los grupos/paralelos de cada materia
            </p>
          </div>
          <button
            onClick={() => router.push("/academico/grupos/nuevo")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-glow"
          >
            <Icon name="add" size={20} />
            Nuevo Grupo
          </button>
        </div>

        {/* Filtros */}
        <div className="glass rounded-lg p-4 mb-6 border border-slate-700">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Buscar por código de grupo o materia..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-all shadow-glow"
              >
                Buscar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={gestionId}
                onChange={(e) => setGestionId(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
              >
                <option value="">Todas las gestiones</option>
                {gestiones.map((gestion) => (
                  <option key={gestion.id} value={gestion.id}>
                    {gestion.codigo} ({gestion.anio}-{gestion.periodo})
                  </option>
                ))}
              </select>
              <select
                value={carreraId}
                onChange={(e) => setCarreraId(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
              >
                <option value="">Todas las carreras</option>
                {carreras.map((carrera) => (
                  <option key={carrera.id} value={carrera.id}>
                    {carrera.nombre}
                  </option>
                ))}
              </select>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
              >
                <option value="">Todas las materias</option>
                {materias.map((materia) => (
                  <option key={materia.id} value={materia.id}>
                    {materia.codigo} - {materia.nombre}
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
              <p className="mt-2 text-slate-400">Cargando grupos...</p>
            </div>
          ) : grupos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No se encontraron grupos</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Materia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Carrera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Gestión
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Capacidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {grupos.map((grupo) => (
                  <tr
                    key={grupo.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-400">
                      {grupo.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                      <div>
                        <span className="font-mono text-xs text-slate-400">
                          {grupo.materia?.codigo}
                        </span>
                        <div className="font-medium">
                          {grupo.materia?.nombre}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {grupo.materia?.carrera?.nombre || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                        {grupo.gestion?.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <span className="inline-flex items-center gap-1.5">
                          <Icon name="users" size={14} />
                          {grupo.capacidad}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/academico/grupos/${grupo.id}`)
                        }
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      >
                        <Icon name="edit" size={16} />
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            grupo.id,
                            grupo.codigo,
                            grupo.materia?.nombre || ""
                          )
                        }
                        className="text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Icon name="delete" size={16} />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Paginación */}
          {!loading && grupos.length > 0 && (
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
