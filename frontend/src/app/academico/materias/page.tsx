"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getMaterias,
  deleteMateria,
  getCarreras,
  type MateriaFilters,
} from "@/services/materia.service";
import type { Materia, Carrera, PaginatedResponse } from "@/types";

export default function MateriasPage() {
  const router = useRouter();
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
  const [carreraId, setCarreraId] = useState("");

  useEffect(() => {
    loadCarreras();
    loadMaterias();
  }, [pagination.current_page, carreraId]);

  const loadCarreras = async () => {
    try {
      const data = await getCarreras();
      setCarreras(data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  };

  const loadMaterias = async () => {
    try {
      setLoading(true);
      const filters: MateriaFilters = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search,
        carrera_id: carreraId || undefined,
      };

      const response = (await getMaterias(
        filters
      )) as PaginatedResponse<Materia>;
      setMaterias(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error al cargar materias:", error);
      alert("Error al cargar la lista de materias");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    loadMaterias();
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la materia "${nombre}"?`)) return;

    try {
      await deleteMateria(id);
      alert("Materia eliminada exitosamente");
      loadMaterias();
    } catch (error: any) {
      const message = error.message || "Error al eliminar materia";
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
              📚 Gestión de Materias
            </h1>
            <p className="text-slate-400 mt-1">
              Administra las materias y sus pre-requisitos
            </p>
          </div>
          <button
            onClick={() => router.push("/academico/materias/nuevo")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-glow"
          >
            <span>➕</span>
            Nueva Materia
          </button>
        </div>

        {/* Filtros */}
        <div className="glass rounded-lg p-4 mb-6 border border-slate-700">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="🔍 Buscar por código o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 placeholder-slate-400"
            />
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
              <p className="mt-2 text-slate-400">Cargando materias...</p>
            </div>
          ) : materias.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No se encontraron materias
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Carrera
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Créditos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Horas/Sem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Pre-requisitos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {materias.map((materia) => (
                  <tr
                    key={materia.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-blue-400">
                      {materia.codigo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100">
                      {materia.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {materia.carrera?.nombre || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        {materia.creditos}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      {materia.horas_semanales}h
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {materia.requisitos && materia.requisitos.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {materia.requisitos.slice(0, 2).map((req) => (
                            <span
                              key={req.id}
                              className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded font-mono border border-purple-500/30"
                            >
                              {req.codigo}
                            </span>
                          ))}
                          {materia.requisitos.length > 2 && (
                            <span className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded border border-slate-600">
                              +{materia.requisitos.length - 2} más
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">Sin requisitos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/academico/materias/${materia.id}`)
                        }
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() => handleDelete(materia.id, materia.nombre)}
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
          {!loading && materias.length > 0 && (
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
