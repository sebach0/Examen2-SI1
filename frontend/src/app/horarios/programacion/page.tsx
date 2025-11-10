"use client";

/**
 * 📅 PROGRAMACIÓN DE HORARIOS
 * ===========================
 * Vista de cuadrícula de horarios asignados
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getHorarios, deleteHorario } from "@/services/horario.service";
import { getGrupos } from "@/services/grupo.service";
import { getAulas } from "@/services/aula.service";
import type { HorarioGrupo } from "@/types";

export default function ProgramacionPage() {
  const router = useRouter();
  const [horarios, setHorarios] = useState<HorarioGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrupo, setFiltroGrupo] = useState("");
  const [filtroAula, setFiltroAula] = useState("");

  useEffect(() => {
    loadHorarios();
  }, []);

  const loadHorarios = async () => {
    try {
      const data = await getHorarios();
      setHorarios(data);
    } catch (error) {
      alert("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este horario?")) return;
    try {
      await deleteHorario(id);
      alert("Horario eliminado");
      loadHorarios();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  const filtrados = horarios.filter((h) => {
    const matchGrupo = filtroGrupo
      ? h.grupo?.codigo.toLowerCase().includes(filtroGrupo.toLowerCase()) ||
        h.grupo?.materia?.nombre
          .toLowerCase()
          .includes(filtroGrupo.toLowerCase())
      : true;
    const matchAula = filtroAula
      ? h.aula?.codigo.toLowerCase().includes(filtroAula.toLowerCase())
      : true;
    return matchGrupo && matchAula;
  });

  const getDiaNombre = (dia: number) => {
    const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return dias[dia] || "N/A";
  };

  const getTipoBadge = (tipo: string) => {
    const tipos = {
      teorico: { bg: "bg-blue-500/20", text: "text-blue-300", icon: "📚" },
      practico: { bg: "bg-green-500/20", text: "text-green-300", icon: "⚙️" },
      laboratorio: {
        bg: "bg-purple-500/20",
        text: "text-purple-300",
        icon: "🔬",
      },
    };
    const t = tipos[tipo as keyof typeof tipos] || tipos.teorico;
    return (
      <span
        className={`${t.bg} ${t.text} px-2 py-1 rounded text-xs font-medium`}
      >
        {t.icon} {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
      </span>
    );
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              📅 Programación de Horarios
            </h1>
            <p className="text-slate-400 mt-1">
              Asignación de bloques y aulas a grupos
            </p>
          </div>
          <button
            onClick={() => router.push("/horarios/programacion/nuevo")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            ➕ Nuevo Horario
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="🔍 Filtrar por grupo o materia..."
              value={filtroGrupo}
              onChange={(e) => setFiltroGrupo(e.target.value)}
              className="px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
            />
            <input
              type="text"
              placeholder="🔍 Filtrar por aula..."
              value={filtroAula}
              onChange={(e) => setFiltroAula(e.target.value)}
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
          ) : filtrados.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No hay horarios programados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Grupo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Materia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Bloque
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Aula
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-600">
                  {filtrados.map((horario) => (
                    <tr
                      key={horario.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-blue-400">
                        {horario.grupo?.codigo || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {horario.grupo?.materia?.nombre || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-200">
                        {horario.bloque?.dia_semana
                          ? `${getDiaNombre(horario.bloque.dia_semana)} ${
                              horario.bloque.hora_inicio
                            }`
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-green-400">
                        {horario.aula?.codigo || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {getTipoBadge(horario.tipo)}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/horarios/programacion/${horario.id}`)
                          }
                          className="text-blue-400 hover:text-blue-300"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(horario.id)}
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
