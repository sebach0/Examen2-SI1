"use client";

/**
 * 📝 DASHBOARD - PÁGINA PRINCIPAL
 * ================================
 * Vista general del sistema con métricas y accesos rápidos
 */

import { ProtectedLayout } from "@/components/shared/ProtectedLayout";

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">¡Bienvenido!</h1>
          <p className="text-gray-600 mt-1">
            Aquí tienes un resumen de la actividad del sistema
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Asistencias Hoy"
            value="48"
            change="+12%"
            trend="up"
            icon="✅"
            color="blue"
          />
          <StatCard
            title="Grupos Activos"
            value="23"
            change="+3"
            trend="up"
            icon="👥"
            color="green"
          />
          <StatCard
            title="Docentes"
            value="67"
            change="0"
            trend="neutral"
            icon="👨‍🏫"
            color="purple"
          />
          <StatCard
            title="Ausencias"
            value="5"
            change="-2"
            trend="down"
            icon="⚠️"
            color="red"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            <ActivityItem
              icon="✅"
              title="Asistencia registrada"
              description="Cálculo I - Grupo A - 08:00"
              time="Hace 2 horas"
            />
            <ActivityItem
              icon="👥"
              title="Nuevo grupo creado"
              description="Física II - Grupo B"
              time="Hace 5 horas"
            />
            <ActivityItem
              icon="📅"
              title="Horario actualizado"
              description="Cambio en Laboratorio de Programación"
              time="Ayer"
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
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    red: "bg-red-50 text-red-600",
  }[color];

  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-600",
  }[trend];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <span className={`text-sm font-medium ${trendColors}`}>{change}</span>
      </div>
      <h3 className="text-gray-600 text-sm mt-4">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
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
    <div className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition">
      <div className="flex-shrink-0">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs text-gray-400">{time}</span>
      </div>
    </div>
  );
}
