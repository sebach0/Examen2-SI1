"use client";

/**
 * 👨‍🏫 CARGAS DOCENTES
 * ====================
 * Asignación de docentes a grupos
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getCargas, deleteCarga } from "@/services/carga.service";
import { getDocentes } from "@/services/docente.service";
import { getGrupos } from "@/services/grupo.service";
import type { CargaDocente, Docente, Grupo } from "@/types";

export default function CargasPage() {
  const router = useRouter();
  const [cargas, setCargas] = useState<CargaDocente[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroDocente, setFiltroDocente] = useState("");
  const [filtroGrupo, setFiltroGrupo] = useState("");

  useEffect(() => {
    loadCargas();
  }, []);

  const loadCargas = async () => {
    try {
      const data = await getCargas();
      setCargas(data);
    } catch (error) {
      alert("Error al cargar cargas");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta asignación?")) return;
    try {
      await deleteCarga(id);
      alert("Carga eliminada");
      loadCargas();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  const filtradas = cargas.filter((c) => {
    const matchDocente = filtroDocente
      ? c.docente?.nombre.toLowerCase().includes(filtroDocente.toLowerCase())
      : true;
    const matchGrupo = filtroGrupo
      ? c.grupo?.codigo.toLowerCase().includes(filtroGrupo.toLowerCase()) ||
        c.grupo?.materia?.nombre
          .toLowerCase()
          .includes(filtroGrupo.toLowerCase())
      : true;
    return matchDocente && matchGrupo;
  });

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              👨‍🏫 Cargas Docentes
            </h1>
            <p className="text-slate-400 mt-1">
              Asignación de docentes a grupos
            </p>
          </div>
          <button
            onClick={() => router.push("/horarios/cargas/nuevo")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            ➕ Nueva Asignación
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 Filtrar por docente..."
              value={filtroDocente}
              onChange={(e) => setFiltroDocente(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
            />
            <input
              type="text"
              placeholder="🔍 Filtrar por grupo o materia..."
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-300">Cargando...</p>
            </div>
          ) : filtradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No hay asignaciones
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Docente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Grupo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Horas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-600">
                  {filtradas.map((carga) => (
                    <tr
                      key={carga.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {carga.docente?.nombre || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-blue-400">
                        {carga.grupo?.codigo || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {carga.grupo?.materia?.nombre || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {carga.horas_asignadas}h
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/horarios/cargas/${carga.id}`)
                          }
                          className="text-blue-400 hover:text-blue-300"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(carga.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
