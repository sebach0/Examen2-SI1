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
      1: "bg-blue-100 text-blue-800",
      2: "bg-green-100 text-green-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-purple-100 text-purple-800",
      5: "bg-pink-100 text-pink-800",
      6: "bg-orange-100 text-orange-800",
      7: "bg-red-100 text-red-800",
    };
    return colors[dia] || "bg-gray-100 text-gray-800";
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
    // Si ya viene en formato HH:MM, retornarlo directamente
    if (hora.includes(":")) {
      return hora.substring(0, 5); // Tomar solo HH:MM
    }
    return hora;
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              ⏰ Gestión de Bloques Horarios
            </h1>
            <p className="text-gray-600 mt-1">
              Administra los períodos de tiempo para las clases
            </p>
          </div>
          <button
            onClick={() => router.push("/horarios/bloques/nuevo")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <span>➕</span>
            Nuevo Bloque
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="🔍 Buscar por hora..."
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
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <select
                value={diaSeleccionado}
                onChange={(e) => setDiaSeleccionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando bloques...</p>
            </div>
          ) : bloques.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No se encontraron bloques horarios
              </p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Día
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Inicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hora Fin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bloques.map((bloque) => (
                  <tr key={bloque.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDiaColor(
                          bloque.dia_semana
                        )}`}
                      >
                        📅 {getNombreDia(bloque.dia_semana)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      🕐 {formatearHora(bloque.hora_inicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      🕐 {formatearHora(bloque.hora_fin)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        ⏱️{" "}
                        {(() => {
                          const inicio = new Date(
                            `2000-01-01T${bloque.hora_inicio}`
                          );
                          const fin = new Date(`2000-01-01T${bloque.hora_fin}`);
                          const diffMs = fin.getTime() - inicio.getTime();
                          const minutos = Math.floor(diffMs / 60000);
                          return `${minutos} min`;
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() =>
                          router.push(`/horarios/bloques/${bloque.id}`)
                        }
                        className="text-blue-600 hover:text-blue-900 mr-3"
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
                        className="text-red-600 hover:text-red-900"
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
