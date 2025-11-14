"use client";

/**
 * 📝 DASHBOARD - PÁGINA PRINCIPAL
 * ================================
 * Vista general del sistema con métricas y accesos rápidos
 */

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getEstadisticas, type DashboardEstadisticas } from "@/services/dashboard.service";

// Importación dinámica de recharts para evitar problemas de SSR
const LineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);
const BarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const Cell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
);

export default function DashboardPage() {
  const [estadisticas, setEstadisticas] = useState<DashboardEstadisticas | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getEstadisticas();
      setEstadisticas(data);
    } catch (err: any) {
      console.error("Error al cargar estadísticas:", err);
      setError(err.message || "Error al cargar las estadísticas");
    } finally {
      setLoading(false);
    }
  };

  // Colores para gráficos
  const COLORS = {
    presente: "#10b981", // green
    ausente: "#ef4444", // red
    tarde: "#f59e0b", // yellow
    justificado: "#3b82f6", // blue
  };

  const getEstadoColor = (estado: string | null | undefined): string => {
    // Validación defensiva: asegurar que estado sea un string
    if (!estado || typeof estado !== "string") {
      return "#6b7280"; // gray por defecto
    }
    const estadoLower = estado.toLowerCase();
    if (estadoLower.includes("presente")) return COLORS.presente;
    if (estadoLower.includes("ausente")) return COLORS.ausente;
    if (estadoLower.includes("tarde") || estadoLower.includes("retraso")) return COLORS.tarde;
    if (estadoLower.includes("justificado") || estadoLower.includes("permiso")) return COLORS.justificado;
    return "#6b7280"; // gray por defecto
  };

  const getEstadoLabel = (estado: string | null | undefined): string => {
    // Validación defensiva: asegurar que estado sea un string
    if (!estado || typeof estado !== "string") {
      return "Desconocido";
    }
    const estadoLower = estado.toLowerCase();
    if (estadoLower === "presente") return "Presente";
    if (estadoLower === "ausente") return "Ausente";
    if (estadoLower === "tarde" || estadoLower === "retraso") return "Tarde";
    if (estadoLower === "justificado" || estadoLower === "permiso") return "Justificado";
    return estado;
  };

  const getTrend = (cambio: number): "up" | "down" | "neutral" => {
    if (cambio > 0) return "up";
    if (cambio < 0) return "down";
    return "neutral";
  };

  const formatChange = (cambio: number): string => {
    if (cambio === 0) return "0%";
    const sign = cambio > 0 ? "+" : "";
    return `${sign}${cambio.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-400 mt-4">Cargando estadísticas...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={loadEstadisticas}
              className="mt-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Reintentar
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (!estadisticas) {
    return null;
  }

  // Validaciones defensivas para asegurar que los datos siempre sean arrays
  const { resumen, graficos, actividad_reciente, totales } = estadisticas;
  
  // Asegurar que los arrays siempre existan
  const asistenciasPorDia = Array.isArray(graficos?.asistencias_por_dia) 
    ? graficos.asistencias_por_dia 
    : [];
  const asistenciasPorEstado = Array.isArray(graficos?.asistencias_por_estado) 
    ? graficos.asistencias_por_estado 
    : [];
  const topDocentes = Array.isArray(graficos?.top_docentes) 
    ? graficos.top_docentes 
    : [];
  const actividadReciente = Array.isArray(actividad_reciente) 
    ? actividad_reciente 
    : [];

  return (
    <ProtectedLayout>
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">📊 Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">
              Resumen de la actividad del sistema
              {totales?.gestion_activa && (
                <span className="ml-2 text-blue-400">• Gestión: {totales.gestion_activa}</span>
              )}
            </p>
          </div>
          <button
            onClick={loadEstadisticas}
            className="w-full sm:w-auto px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition text-sm sm:text-base"
            title="Actualizar estadísticas"
          >
            🔄 Actualizar
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Asistencias Hoy"
            value={(resumen?.asistencias_hoy ?? 0).toString()}
            change={formatChange(resumen?.cambio_asistencias ?? 0)}
            trend={getTrend(resumen?.cambio_asistencias ?? 0)}
            icon="✅"
            color="blue"
          />
          <StatCard
            title="Grupos Activos"
            value={(resumen?.grupos_activos ?? 0).toString()}
            change={`Total: ${totales?.grupos ?? 0}`}
            trend="neutral"
            icon="👥"
            color="green"
          />
          <StatCard
            title="Docentes Activos"
            value={(resumen?.docentes_activos ?? 0).toString()}
            change={`Total: ${resumen?.total_docentes ?? 0}`}
            trend="neutral"
            icon="👨‍🏫"
            color="purple"
          />
          <StatCard
            title="Ausencias Hoy"
            value={(resumen?.ausencias_hoy ?? 0).toString()}
            change={formatChange(resumen?.cambio_ausencias ?? 0)}
            trend={getTrend(-(resumen?.cambio_ausencias ?? 0))}
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Gráfico de líneas: Asistencias por día */}
          <div className="glass rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-3 sm:mb-4">
              📈 Asistencias por Día (Últimos 7 días)
            </h2>
            {asistenciasPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={asistenciasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="fecha_formateada"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                  />
                  <Legend wrapperStyle={{ color: "#9ca3af" }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Asistencias"
                    dot={{ fill: "#3b82f6", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                No hay datos disponibles
              </div>
            )}
          </div>

          {/* Gráfico de barras: Asistencias por estado */}
          <div className="glass rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-3 sm:mb-4">
              📊 Asistencias por Estado (Últimos 7 días)
            </h2>
            {asistenciasPorEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={asistenciasPorEstado}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="estado"
                    stroke="#9ca3af"
                    style={{ fontSize: "12px" }}
                    tickFormatter={(value) => {
                      // Asegurar que value sea un string antes de pasarlo a getEstadoLabel
                      return getEstadoLabel(typeof value === 'string' ? value : String(value || ''));
                    }}
                  />
                  <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #475569",
                      borderRadius: "8px",
                      color: "#e2e8f0",
                    }}
                    labelFormatter={(value) => {
                      // Recharts puede pasar el valor directamente o como parte de un objeto
                      const estadoValue = typeof value === 'string' ? value : (value?.estado || value);
                      return getEstadoLabel(estadoValue);
                    }}
                  />
                  <Bar
                    dataKey="total"
                    name="Cantidad"
                    fill="#3b82f6"
                    radius={[8, 8, 0, 0]}
                  >
                    {asistenciasPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getEstadoColor(entry?.estado)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-slate-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        </div>

        {/* Top Docentes y Actividad Reciente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Top Docentes */}
          <div className="glass rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-3 sm:mb-4">
              🏆 Top 5 Docentes (Último mes)
            </h2>
            {topDocentes.length > 0 ? (
              <div className="space-y-3">
                {topDocentes.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <span className="text-slate-200">{item?.docente || 'N/A'}</span>
                    </div>
                    <span className="text-slate-400 font-semibold">{item?.total || 0} asistencias</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-400">
                No hay datos disponibles
              </div>
            )}
          </div>

          {/* Actividad Reciente */}
          <div className="glass rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-3 sm:mb-4">
              📋 Actividad Reciente
            </h2>
            {actividadReciente.length > 0 ? (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {actividadReciente.map((actividad, index) => (
                  <ActivityItem
                    key={actividad?.id || `act-${index}`}
                    icon="✅"
                    title={`Asistencia: ${getEstadoLabel(actividad?.estado)}`}
                    description={`${actividad?.docente || 'N/A'} - ${actividad?.materia || 'N/A'} (${actividad?.grupo || 'N/A'})`}
                    time={actividad?.tiempo_relativo || actividad?.fecha_formateada || 'N/A'}
                  />
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px] text-slate-400">
                No hay actividad reciente
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-lg p-3 sm:p-4 md:p-6 border border-slate-700">
          <h2 className="text-lg sm:text-xl font-semibold text-slate-100 mb-3 sm:mb-4">
            ⚡ Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <QuickAction
              title="Marcar Asistencia"
              description="Registra tu asistencia con QR"
              icon="✅"
              href="/asistencia/marcar"
              color="blue"
            />
            <QuickAction
              title="Ver Horarios"
              description="Consulta tu horario semanal"
              icon="📅"
              href="/horarios/programacion"
              color="green"
            />
            <QuickAction
              title="Reportes"
              description="Genera reportes de asistencia"
              icon="📊"
              href="/asistencia/reportes"
              color="purple"
            />
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

// Componentes auxiliares
function StatCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    red: "bg-red-500/20 text-red-400",
  }[color];

  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-slate-400",
  }[trend];

  return (
    <div className="glass rounded-lg p-6 border border-slate-700 hover:border-slate-600 transition">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <span className={`text-sm font-medium ${trendColors}`}>{change}</span>
      </div>
      <h3 className="text-slate-400 text-sm mt-4">{title}</h3>
      <p className="text-3xl font-bold text-slate-100 mt-1">{value}</p>
    </div>
  );
}

function QuickAction({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
}) {
  const colorClasses = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    purple: "bg-purple-500 hover:bg-purple-600",
  }[color];

  return (
    <a
      href={href}
      className={`block p-4 rounded-lg ${colorClasses} text-white transition hover:shadow-lg`}
    >
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm opacity-90 mt-1">{description}</p>
    </a>
  );
}

function ActivityItem({
  icon,
  title,
  description,
  time,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex items-start space-x-4 p-3 hover:bg-slate-700/30 rounded-lg transition">
      <div className="shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-sm text-slate-400">{description}</p>
      </div>
      <div className="shrink-0">
        <span className="text-xs text-slate-500">{time}</span>
      </div>
    </div>
  );
}
