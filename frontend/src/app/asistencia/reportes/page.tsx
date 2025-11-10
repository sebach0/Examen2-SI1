"use client";

/**
 * 📊 REPORTES DE ASISTENCIA
 * ==========================
 * Dashboard con estadísticas y exportación
 */

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getAsistencias,
  getEstadisticasDocente,
  getEstadisticasGrupo,
  exportarReporte,
  type AsistenciaFiltros,
  type AsistenciaEstadisticas,
} from "@/services/asistencia.service";
import { getDocentes } from "@/services/docente.service";
import { getGrupos } from "@/services/grupo.service";
import type { Asistencia, Docente, Grupo } from "@/types";

export default function ReportesPage() {
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [estadisticas, setEstadisticas] =
    useState<AsistenciaEstadisticas | null>(null);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState<AsistenciaFiltros>({
    fecha_inicio: "",
    fecha_fin: "",
    docente_id: "",
    grupo_id: "",
    estado: "",
  });

  useEffect(() => {
    loadDependencias();
  }, []);

  const loadDependencias = async () => {
    try {
      const [docentesData, gruposData] = await Promise.all([
        getDocentes(),
        getGrupos(),
      ]);
      setDocentes(docentesData.data);
      setGrupos(gruposData.data);
    } catch (error) {
      alert("Error al cargar datos");
    }
  };

  const handleBuscar = async () => {
    setLoading(true);
    try {
      const data = await getAsistencias(filtros);
      setAsistencias(data);

      // Cargar estadísticas si hay docente o grupo seleccionado
      if (filtros.docente_id) {
        const stats = await getEstadisticasDocente(
          filtros.docente_id,
          filtros.fecha_inicio || "",
          filtros.fecha_fin || ""
        );
        setEstadisticas(stats);
      } else if (filtros.grupo_id) {
        const stats = await getEstadisticasGrupo(
          filtros.grupo_id,
          filtros.fecha_inicio || "",
          filtros.fecha_fin || ""
        );
        setEstadisticas(stats);
      }
    } catch (error) {
      alert("Error al cargar reporte");
    } finally {
      setLoading(false);
    }
  };

  const handleExportar = async () => {
    try {
      const blob = await exportarReporte(filtros);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-asistencia-${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert("✅ Reporte exportado");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al exportar");
    }
  };

  const getEstadoBadge = (estado: string) => {
    const estados = {
      presente: { bg: "bg-green-500/20", text: "text-green-300", icon: "✅" },
      ausente: { bg: "bg-red-500/20", text: "text-red-300", icon: "❌" },
      tarde: { bg: "bg-yellow-500/20", text: "text-yellow-300", icon: "⏰" },
      justificado: { bg: "bg-blue-500/20", text: "text-blue-300", icon: "📝" },
    };
    const e = estados[estado as keyof typeof estados] || estados.ausente;
    return (
      <span
        className={`${e.bg} ${e.text} px-2 py-1 rounded text-xs font-medium`}
      >
        {e.icon} {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </span>
    );
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            📊 Reportes de Asistencia
          </h1>
          <p className="text-slate-400 mt-1">
            Estadísticas y exportación de datos
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-200">🔍 Filtros</h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Fecha Inicio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📅 Fecha Inicio
              </label>
              <input
                type="date"
                value={filtros.fecha_inicio || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_inicio: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📅 Fecha Fin
              </label>
              <input
                type="date"
                value={filtros.fecha_fin || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_fin: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Docente */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👨‍🏫 Docente
              </label>
              <select
                value={filtros.docente_id || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, docente_id: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los docentes</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👥 Grupo
              </label>
              <select
                value={filtros.grupo_id || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, grupo_id: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los grupos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.codigo} - {g.materia?.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ✔️ Estado
              </label>
              <select
                value={filtros.estado || ""}
                onChange={(e) =>
                  setFiltros({ ...filtros, estado: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="presente">✅ Presente</option>
                <option value="ausente">❌ Ausente</option>
                <option value="tarde">⏰ Tardanza</option>
                <option value="justificado">📝 Justificado</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBuscar}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 text-white rounded-lg font-medium"
            >
              {loading ? "Cargando..." : "🔍 Buscar"}
            </button>
            <button
              onClick={handleExportar}
              disabled={asistencias.length === 0}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 text-white rounded-lg font-medium"
            >
              📥 Exportar Excel
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="text-slate-400 text-sm">Total Clases</div>
              <div className="text-3xl font-bold text-slate-200 mt-1">
                {estadisticas.total_clases}
              </div>
            </div>
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4">
              <div className="text-green-400 text-sm">Presentes</div>
              <div className="text-3xl font-bold text-green-300 mt-1">
                {estadisticas.presentes}
              </div>
              <div className="text-green-500/70 text-xs mt-1">
                {estadisticas.porcentaje_asistencia?.toFixed(1)}%
              </div>
            </div>
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
              <div className="text-red-400 text-sm">Ausentes</div>
              <div className="text-3xl font-bold text-red-300 mt-1">
                {estadisticas.ausentes}
              </div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-lg p-4">
              <div className="text-yellow-400 text-sm">Tardanzas</div>
              <div className="text-3xl font-bold text-yellow-300 mt-1">
                {estadisticas.tardes}
              </div>
            </div>
          </div>
        )}

        {/* Tabla de Resultados */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {asistencias.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No hay registros. Usa los filtros para buscar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Docente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Grupo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Bloque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Modo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-600">
                  {asistencias.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {new Date(a.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {a.docente?.nombre || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-blue-400">
                        {a.grupo?.codigo || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {a.bloque?.hora_inicio || "N/A"}
                      </td>
                      <td className="px-6 py-4">{getEstadoBadge(a.estado)}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {a.modo === "QR" ? "📱 QR" : "📝 Manual"}
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
