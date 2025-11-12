"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getBloques,
  deleteBloque,
  getDias,
  type BloqueFilters,
  type DiaSemana,
} from "@/services/bloque.service";
import type { BloqueHorario, PaginatedResponse } from "@/types";

export default function BloquesPage() {
  const router = useRouter();
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Filtros
  const [search, setSearch] = useState("");
  const [diaSeleccionado, setDiaSeleccionado] = useState("");

  useEffect(() => {
    loadDias();
  }, []);

  useEffect(() => {
    loadBloques();
  }, [pagination.current_page, diaSeleccionado]);

  const loadDias = async () => {
    try {
      const data = await getDias();
      setDias(data);
    } catch (error) {
      console.error("Error al cargar días:", error);
    }
  };

  const loadBloques = async () => {
    try {
      setLoading(true);
      const filters: BloqueFilters = {
        page: pagination.current_page,
        perPage: pagination.per_page,
        search,
        dia_semana: diaSeleccionado ? parseInt(diaSeleccionado) : undefined,
      };

      const response = (await getBloques(
        filters
      )) as PaginatedResponse<BloqueHorario>;
      setBloques(response.data);
      setPagination({
        current_page: response.current_page,
        last_page: response.last_page,
        per_page: response.per_page,
        total: response.total,
      });
    } catch (error) {
      console.error("Error al cargar bloques:", error);
      alert("Error al cargar la lista de bloques horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, current_page: 1 });
    loadBloques();
  };

  const handleDelete = async (id: string, descripcion: string) => {
    if (
      !confirm(`¿Estás seguro de eliminar el bloque horario "${descripcion}"?`)
    )
      return;

    try {
      await deleteBloque(id);
      alert("Bloque horario eliminado exitosamente");
      loadBloques();
    } catch (error: any) {
      const message = error.message || "Error al eliminar bloque horario";
      alert(message);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, current_page: page });
  };

  const getDiaColor = (dia: number) => {
    const colors: Record<number, string> = {
      1: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
      2: "bg-green-500/20 text-green-400 border border-green-500/30",
      3: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
      4: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
      5: "bg-pink-500/20 text-pink-400 border border-pink-500/30",
      6: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
      7: "bg-red-500/20 text-red-400 border border-red-500/30",
    };
    return (
      colors[dia] || "bg-slate-500/20 text-slate-400 border border-slate-500/30"
    );
  };

  const getNombreDia = (dia: number) => {
    const nombres: Record<number, string> = {
      1: "Lunes",
      2: "Martes",
      3: "Miércoles",
      4: "Jueves",
      5: "Viernes",
      6: "Sábado",
      7: "Domingo",
    };
    return nombres[dia] || "Desconocido";
  };

  const formatearHora = (hora: string) => {
    if (!hora) return '';
    
    try {
      // Crear objeto Date desde el string ISO
      const date = new Date(hora);
      
      // Verificar que es una fecha válida
      if (isNaN(date.getTime())) {
        // Si no es fecha válida, intentar extraer HH:MM si existe
        if (hora.includes(':')) {
          return hora.substring(0, 5);
        }
        return hora;
      }
      
      // Extraer horas y minutos en hora local
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
      
    } catch (error) {
      console.error('Error formateando hora:', error, hora);
      return hora;
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              ⏰ Gestión de Bloques Horarios
            </h1>
            <p className="text-slate-400 mt-1">
              Administra los períodos de tiempo para las clases
            </p>
          </div>
          <button
            onClick={() => router.push("/horarios/bloques/nuevo")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-glow"
          >
            <span>➕</span>
            Nuevo Bloque
          </button>
        </div>

        {/* Filtros */}
        <div className="glass border-slate-700 rounded-lg p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="🔍 Buscar por hora..."
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
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <select
                value={diaSeleccionado}
                onChange={(e) => setDiaSeleccionado(e.target.value)}
                className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-100"
              >
                <option value="">Todos los días</option>
                {dias.map((dia) => (
                  <option key={dia.value} value={dia.value}>
                    {dia.label}
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
              <p className="mt-2 text-slate-400">Cargando bloques...</p>
            </div>
          ) : bloques.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 text-lg">
                No se encontraron bloques horarios
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-800/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Día
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Hora Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Hora Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {bloques.map((bloque) => (
                  <tr
                    key={bloque.id}
                    className="hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDiaColor(
                          bloque.dia_semana
                        )}`}
                      >
                        📅 {getNombreDia(bloque.dia_semana)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                      🕐 {formatearHora(bloque.hora_inicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">
                      🕐 {formatearHora(bloque.hora_fin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        ⏱️{" "}
                        {(() => {
                          try {
                            const inicio = new Date(bloque.hora_inicio);
                            const fin = new Date(bloque.hora_fin);
                            const diffMs = fin.getTime() - inicio.getTime();
                            const minutos = Math.floor(diffMs / 60000);
                            const horas = Math.floor(minutos / 60);
                            const mins = minutos % 60;
                            
                            if (horas > 0) {
                              return `${horas}h ${mins}min`;
                            }
                            return `${mins} min`;
                          } catch {
                            return 'N/A';
                          }
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/horarios/bloques/${bloque.id}`)
                        }
                        className="text-blue-400 hover:text-blue-300 mr-3 transition-colors"
                      >
                        ✏️ Editar
                      </button>
                      <button
                        onClick={() =>
                          handleDelete(
                            bloque.id,
                            `${getNombreDia(bloque.dia_semana)} ${formatearHora(
                              bloque.hora_inicio
                            )}-${formatearHora(bloque.hora_fin)}`
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
          {!loading && bloques.length > 0 && (
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
