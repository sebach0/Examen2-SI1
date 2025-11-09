"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getAulas,
  deleteAula,
  getEdificios,
  getTipos,
  type AulaFilters,
  type TipoAula,
} from "@/services/aula.service";
import type { Aula, Edificio, PaginatedResponse } from "@/types";

export default function AulasPage() {
  const router = useRouter();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [tipos, setTipos] = useState<TipoAula[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Filtros
  const [search, setSearch] = useState("");
  const [edificioId, setEdificioId] = useState("");
  const [tipo, setTipo] = useState("");

  useEffect(() => {
    loadEdificios();
    loadTipos();
  }, []);

  useEffect(() => {
    loadAulas();
  }, [pagination.current_page, edificioId, tipo]);

  const loadEdificios = async () => {
    try {
      const data = await getEdificios();
      setEdificios(data);
    } catch (error) {
      console.error("Error al cargar edificios:", error);
    }
  };

  const loadTipos = async () => {
    try {
      const data = await getTipos();
      setTipos(data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  const loadAulas = async () => {
    try {
      setLoading(true);
      const filters: AulaFilters = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search,
        edificio_id: edificioId || undefined,
        tipo: tipo || undefined,
      };

      const response = (await getAulas(filters)) as PaginatedResponse<Aula>;
      setAulas(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error al cargar aulas:", error);
      alert("Error al cargar la lista de aulas");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    loadAulas();
  };

  const handleDelete = async (id: string, codigo: string, edificio: string) => {
    if (
      !confirm(`¿Estás seguro de eliminar el aula "${codigo}" del ${edificio}?`)
    )
      return;

    try {
      await deleteAula(id);
      alert("Aula eliminada exitosamente");
      loadAulas();
    } catch (error: any) {
      const message = error.message || "Error al eliminar aula";
      alert(message);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page });
  };

  const getTipoBadgeColor = (tipo: string) => {
    const colors: Record<string, string> = {
      aula: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      laboratorio:
        "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      auditorio: "bg-green-500/20 text-green-400 border border-green-500/30",
      "sala de cómputo":
        "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      otro: "bg-slate-500/20 text-slate-400 border border-slate-500/30",
    };
    return (
      colors[tipo] ||
      "bg-slate-500/20 text-slate-400 border border-slate-500/30"
    );
  };

  const getTipoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      aula: "🏫",
      laboratorio: "🔬",
      auditorio: "🎭",
      "sala de cómputo": "💻",
      otro: "📍",
    };
    return icons[tipo] || "📍";
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              🏢 Gestión de Aulas
            </h1>
            <p className="text-slate-400 mt-1">
              Administra los salones, laboratorios y espacios físicos
            </p>
          </div>
          <button
            onClick={() => router.push("/infra/aulas/nuevo")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-glow"
          >
            <span>➕</span>
            Nueva Aula
          </button>
        </div>

        {/* Filtros */}
        <div className="glass border-slate-700 rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="🔍 Buscar por código o nombre de aula..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100 placeholder-slate-400"
              />
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors shadow-glow"
              >
                Buscar
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={edificioId}
                onChange={(e) => setEdificioId(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
              >
                <option value="">Todos los edificios</option>
                {edificios.map((edificio) => (
                  <option key={edificio.id} value={edificio.id}>
                    {edificio.nombre}
                  </option>
                ))}
              </select>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
              >
                <option value="">Todos los tipos</option>
                {tipos.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Tabla */}
        <div className="glass border-slate-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-400">Cargando aulas...</p>
            </div>
          ) : aulas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">No se encontraron aulas</p>
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
                    Edificio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Tipo
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
                {aulas.map((aula) => (
                  <tr
                    key={aula.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-mono font-bold text-blue-400">
                        {aula.codigo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-100 font-medium">
                      {aula.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                      🏢 {aula.edificio?.nombre || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoBadgeColor(
                          aula.tipo
                        )}`}
                      >
                        {getTipoIcon(aula.tipo)} {aula.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        👥 {aula.capacidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/infra/aulas/${aula.id}`)}
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            aula.id,
                            aula.codigo,
                            aula.edificio?.nombre || ""
                          )
                        }
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
          {!loading && aulas.length > 0 && (
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
