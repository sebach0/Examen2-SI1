"use client";

/**
 * 📅 REPORTES DE HORARIOS - SEMANAL Y DIARIO
 * ===========================================
 * Vista de calendario semanal y diario de horarios
 */

import { useState, useEffect } from "react";
import type React from "react";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getReporteSemanal,
  getReporteDiario,
  type ReporteSemanal,
  type ReporteDiario,
  type HorarioReporte,
} from "@/services/horario.service";
import { getAllGrupos } from "@/services/grupo.service";
import { getAllAulas } from "@/services/aula.service";
import { getAllDocentes } from "@/services/docente.service";
import type { Grupo, Aula, Docente } from "@/types";

type VistaTipo = "semanal" | "diario";

export default function ReportesHorariosPage() {
  const [vista, setVista] = useState<VistaTipo>("semanal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Datos de reportes
  const [reporteSemanal, setReporteSemanal] = useState<ReporteSemanal | null>(
    null
  );
  const [reporteDiario, setReporteDiario] = useState<ReporteDiario | null>(
    null
  );

  // Filtros
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroAula, setFiltroAula] = useState("");
  const [filtroDocente, setFiltroDocente] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  // Opciones para filtros
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);

  useEffect(() => {
    loadOpciones();
  }, []);

  useEffect(() => {
    loadReporte();
  }, [vista, fecha, filtroGrupo, filtroAula, filtroDocente, filtroTipo]);

  const loadOpciones = async () => {
    try {
      const [gruposData, aulasData, docentesData] = await Promise.all([
        getAllGrupos(),
        getAllAulas(),
        getAllDocentes(),
      ]);
      // Asegurar que siempre sean arrays
      setGrupos(Array.isArray(gruposData) ? gruposData : []);
      setAulas(Array.isArray(aulasData) ? aulasData : []);
      setDocentes(Array.isArray(docentesData) ? docentesData : []);
    } catch (err) {
      console.error("Error al cargar opciones:", err);
      // Asegurar que siempre sean arrays para evitar errores
      setGrupos([]);
      setAulas([]);
      setDocentes([]);
    }
  };

  const loadReporte = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: any = {
        fecha,
      };

      if (filtroGrupo) filters.grupo_id = filtroGrupo;
      if (filtroAula) filters.aula_id = filtroAula;
      if (filtroDocente) filters.docente_id = filtroDocente;
      if (filtroTipo) filters.tipo = filtroTipo;

      if (vista === "semanal") {
        const data = await getReporteSemanal(filters);
        setReporteSemanal(data);
      } else {
        const data = await getReporteDiario(filters);
        setReporteDiario(data);
      }
    } catch (err: any) {
      console.error("Error al cargar reporte:", err);
      setError(err.message || "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  };

  const cambiarSemana = (direccion: "anterior" | "siguiente") => {
    const fechaActual = new Date(fecha);
    const dias = direccion === "siguiente" ? 7 : -7;
    fechaActual.setDate(fechaActual.getDate() + dias);
    setFecha(fechaActual.toISOString().split("T")[0]);
  };

  const cambiarDia = (direccion: "anterior" | "siguiente") => {
    const fechaActual = new Date(fecha);
    const dias = direccion === "siguiente" ? 1 : -1;
    fechaActual.setDate(fechaActual.getDate() + dias);
    setFecha(fechaActual.toISOString().split("T")[0]);
  };

  const getTipoBadge = (tipo: string) => {
    const tipos: Record<string, { bg: string; text: string; icon: string }> = {
      teorica: { bg: "bg-blue-500/20", text: "text-blue-300", icon: "📚" },
      teorico: { bg: "bg-blue-500/20", text: "text-blue-300", icon: "📚" },
      practica: { bg: "bg-green-500/20", text: "text-green-300", icon: "⚙️" },
      practico: { bg: "bg-green-500/20", text: "text-green-300", icon: "⚙️" },
      laboratorio: {
        bg: "bg-purple-500/20",
        text: "text-purple-300",
        icon: "🔬",
      },
    };
    const t = tipos[tipo.toLowerCase()] || tipos.teorica;
    return (
      <span
        className={`${t.bg} ${t.text} px-2 py-1 rounded text-xs font-medium`}
      >
        {t.icon} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  const formatearHora = (hora: string) => {
    if (!hora) return "N/A";
    try {
      const [h, m] = hora.split(":");
      return `${h}:${m}`;
    } catch {
      return hora;
    }
  };

  return (
    <ProtectedLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              📅 Reportes de Horarios
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Vista semanal y diaria de horarios programados
            </p>
          </div>
        </div>

        {/* Selector de vista */}
        <div className="glass rounded-lg p-4 border border-slate-700">
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setVista("semanal")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                vista === "semanal"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              📆 Semanal
            </button>
            <button
              onClick={() => setVista("diario")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                vista === "diario"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              📅 Diario
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="glass rounded-lg p-3 sm:p-4 border border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Grupo
              </label>
              <select
                value={filtroGrupo}
                onChange={(e) => setFiltroGrupo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.codigo} - {g.materia?.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Aula
              </label>
              <select
                value={filtroAula}
                onChange={(e) => setFiltroAula(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {aulas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.codigo}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Docente
              </label>
              <select
                value={filtroDocente}
                onChange={(e) => setFiltroDocente(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tipo
              </label>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="teorica">Teórica</option>
                <option value="practica">Práctica</option>
                <option value="laboratorio">Laboratorio</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-slate-400 mt-4">Cargando reporte...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        ) : vista === "semanal" ? (
          <VistaSemanal
            reporte={reporteSemanal}
            fecha={fecha}
            cambiarSemana={cambiarSemana}
            getTipoBadge={getTipoBadge}
            formatearHora={formatearHora}
          />
        ) : (
          <VistaDiaria
            reporte={reporteDiario}
            fecha={fecha}
            cambiarDia={cambiarDia}
            getTipoBadge={getTipoBadge}
            formatearHora={formatearHora}
          />
        )}
      </div>
    </ProtectedLayout>
  );
}

// Componente Vista Semanal
function VistaSemanal({
  reporte,
  fecha,
  cambiarSemana,
  getTipoBadge,
  formatearHora,
}: {
  reporte: ReporteSemanal | null;
  fecha: string;
  cambiarSemana: (dir: "anterior" | "siguiente") => void;
  getTipoBadge: (tipo: string) => React.ReactElement;
  formatearHora: (hora: string) => string;
}) {
  if (!reporte) {
    return (
      <div className="text-center py-12 text-slate-400">
        No hay datos disponibles
      </div>
    );
  }

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const fechaInicio = new Date(reporte.semana.inicio);
  const fechaFin = new Date(reporte.semana.fin);

  return (
    <div className="space-y-4">
      {/* Navegación de semana */}
      <div className="glass rounded-lg p-3 sm:p-4 border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          onClick={() => cambiarSemana("anterior")}
          className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition text-sm sm:text-base"
        >
          ← Semana Anterior
        </button>
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">
            Semana del{" "}
            {fechaInicio.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}{" "}
            al{" "}
            {fechaFin.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
            })}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Total: {reporte.total} horarios
          </p>
        </div>
        <button
          onClick={() => cambiarSemana("siguiente")}
          className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition text-sm sm:text-base"
        >
          Semana Siguiente →
        </button>
      </div>

      {/* Calendario semanal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        {dias.map((diaNombre, index) => {
          const diaNum = index + 1;
          const horariosDia = reporte.horarios_por_dia[diaNum] || [];

          return (
            <div
              key={diaNum}
              className="glass rounded-lg border border-slate-700 overflow-hidden"
            >
              <div className="bg-slate-700/50 p-3 border-b border-slate-600">
                <h3 className="font-bold text-slate-100 text-center">
                  {diaNombre}
                </h3>
                <p className="text-xs text-slate-400 text-center mt-1">
                  {horariosDia.length} horarios
                </p>
              </div>
              <div className="p-3 space-y-2 max-h-[600px] overflow-y-auto">
                {horariosDia.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Sin horarios
                  </p>
                ) : (
                  horariosDia.map((horario) => (
                    <HorarioCard
                      key={horario.id}
                      horario={horario}
                      getTipoBadge={getTipoBadge}
                      formatearHora={formatearHora}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente Vista Diaria
function VistaDiaria({
  reporte,
  fecha,
  cambiarDia,
  getTipoBadge,
  formatearHora,
}: {
  reporte: ReporteDiario | null;
  fecha: string;
  cambiarDia: (dir: "anterior" | "siguiente") => void;
  getTipoBadge: (tipo: string) => React.ReactElement;
  formatearHora: (hora: string) => string;
}) {
  if (!reporte) {
    return (
      <div className="text-center py-12 text-slate-400">
        No hay datos disponibles
      </div>
    );
  }

  const fechaObj = new Date(reporte.fecha);

  return (
    <div className="space-y-4">
      {/* Navegación de día */}
      <div className="glass rounded-lg p-3 sm:p-4 border border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <button
          onClick={() => cambiarDia("anterior")}
          className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition text-sm sm:text-base"
        >
          ← Día Anterior
        </button>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-100">
            {reporte.dia_nombre},{" "}
            {fechaObj.toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </h2>
          <p className="text-sm text-slate-400">
            Total: {reporte.total} horarios
          </p>
        </div>
        <button
          onClick={() => cambiarDia("siguiente")}
          className="w-full sm:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition text-sm sm:text-base"
        >
          Día Siguiente →
        </button>
      </div>

      {/* Lista de horarios del día */}
      <div className="glass rounded-lg border border-slate-700 overflow-hidden">
        {reporte.horarios.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No hay horarios programados para este día
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {reporte.horarios.map((horario) => (
              <div
                key={horario.id}
                className="p-4 hover:bg-slate-700/30 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-blue-400">
                        {formatearHora(horario.bloque.hora_inicio)} -{" "}
                        {formatearHora(horario.bloque.hora_fin)}
                      </span>
                      {getTipoBadge(horario.tipo)}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-100 mb-1">
                      {horario.grupo.materia.nombre}
                    </h3>
                    <p className="text-sm text-slate-300 mb-2">
                      Grupo:{" "}
                      <span className="font-mono">{horario.grupo.codigo}</span>{" "}
                      | Aula:{" "}
                      <span className="font-mono text-green-400">
                        {horario.aula.codigo}
                      </span>{" "}
                      ({horario.aula.edificio})
                    </p>
                    {(() => {
                      const docentes = Array.isArray(horario.docentes)
                        ? horario.docentes.filter(
                            (d) =>
                              d &&
                              typeof d === "object" &&
                              typeof d.nombre === "string"
                          )
                        : [];
                      return docentes.length > 0 ? (
                        <p className="text-sm text-slate-400">
                          Docente(s):{" "}
                          {docentes.map((d) => d.nombre || "N/A").join(", ")}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Tarjeta de Horario
function HorarioCard({
  horario,
  getTipoBadge,
  formatearHora,
}: {
  horario: HorarioReporte;
  getTipoBadge: (tipo: string) => React.ReactElement;
  formatearHora: (hora: string) => string;
}) {
  // Asegurar que docentes siempre sea un array y validar estructura
  const docentes = Array.isArray(horario.docentes)
    ? horario.docentes.filter(
        (d) => d && typeof d === "object" && typeof d.nombre === "string"
      )
    : [];

  return (
    <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600 hover:border-slate-500 transition">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-blue-400">
          {formatearHora(horario.bloque.hora_inicio)} -{" "}
          {formatearHora(horario.bloque.hora_fin)}
        </span>
        {getTipoBadge(horario.tipo)}
      </div>
      <h4 className="font-semibold text-slate-100 text-sm mb-1">
        {horario.grupo?.materia?.nombre || "N/A"}
      </h4>
      <p className="text-xs text-slate-300 mb-1">
        <span className="font-mono">{horario.grupo?.codigo || "N/A"}</span>
      </p>
      <p className="text-xs text-green-400 mb-1">
        🏫 {horario.aula?.codigo || "N/A"} ({horario.aula?.edificio || "N/A"})
      </p>
      {docentes.length > 0 && docentes[0]?.nombre && (
        <p className="text-xs text-slate-400">
          👨‍🏫 {docentes[0].nombre}
          {docentes.length > 1 && ` +${docentes.length - 1}`}
        </p>
      )}
    </div>
  );
}
