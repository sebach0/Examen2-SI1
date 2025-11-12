"use client";

/**
 * ✏️ FORMULARIO PROGRAMACIÓN HORARIO
 * ===================================
 * Incluye detección de conflictos
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getHorarioById,
  createHorario,
  updateHorario,
  verificarConflictos,
  type CreateHorarioData,
} from "@/services/horario.service";
import { getGrupos } from "@/services/grupo.service";
import { getAulas } from "@/services/aula.service";
import { getAllBloques } from "@/services/bloque.service";
import type { Grupo, Aula, BloqueHorario } from "@/types";

export default function ProgramacionFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditing = id && id !== "nuevo";

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [conflictos, setConflictos] = useState<
    Array<{
      tipo: string;
      mensaje: string;
      horario?: any;
    }>
  >([]);

  const [formData, setFormData] = useState<CreateHorarioData>({
    grupo_id: "",
    bloque_id: "",
    aula_id: "",
    tipo: "teorica",
  });

  useEffect(() => {
    loadDependencias();
    if (isEditing) loadHorario();
  }, [id]);

  const loadDependencias = async () => {
    try {
      const [gruposData, aulasData, bloquesData] = await Promise.all([
        getGrupos(),
        getAulas(),
        getAllBloques(),
      ]);
      setGrupos(gruposData.data);
      setAulas((aulasData as any).data);
      setBloques(bloquesData);
    } catch (error) {
      alert("Error al cargar datos");
    }
  };

  const loadHorario = async () => {
    try {
      const horario = await getHorarioById(id);
      setFormData({
        grupo_id: horario.grupo_id,
        bloque_id: horario.bloque_id,
        aula_id: horario.aula_id,
        tipo: horario.tipo,
      });
    } catch (error) {
      alert("Error al cargar horario");
    }
  };

  const handleVerificarConflictos = async () => {
    if (!formData.bloque_id || !formData.aula_id) {
      alert("Seleccione bloque y aula primero");
      return;
    }

    try {
      const result = await verificarConflictos(formData);
      setConflictos(result.conflictos);

      if (result.conflictos.length === 0) {
        alert("✅ Sin conflictos detectados");
      } else {
        alert(`⚠️ ${result.conflictos.length} conflicto(s) detectado(s)`);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al verificar");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar conflictos antes de guardar
    if (conflictos.length > 0) {
      if (!confirm("Hay conflictos. ¿Desea continuar de todos modos?")) {
        return;
      }
    }

    try {
      if (isEditing) {
        await updateHorario(id, formData);
        alert("Horario actualizado");
      } else {
        await createHorario(formData);
        alert("Horario creado");
      }
      router.push("/horarios/programacion");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  const getDiaNombre = (dia: number) => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return dias[dia] || "N/A";
  };

  const formatearHora = (hora: string) => {
    if (!hora) return '';
    try {
      const date = new Date(hora);
      if (isNaN(date.getTime())) return hora;
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return hora;
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100">
              {isEditing ? "✏️ Editar" : "➕ Nuevo"} Horario
            </h1>
            <p className="text-slate-400 mt-1">
              Programar clase en bloque y aula
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Formulario Principal */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4">
              {/* Grupo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  👥 Grupo *
                </label>
                <select
                  value={formData.grupo_id}
                  onChange={(e) =>
                    setFormData({ ...formData, grupo_id: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un grupo</option>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.codigo} - {g.materia?.nombre || ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bloque Horario */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🕐 Bloque Horario *
                </label>
                <select
                  value={formData.bloque_id}
                  onChange={(e) => {
                    setFormData({ ...formData, bloque_id: e.target.value });
                    setConflictos([]); // Resetear conflictos
                  }}
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un bloque</option>
                  {bloques.map((b) => (
                    <option key={b.id} value={b.id}>
                      {getDiaNombre(b.dia_semana)} {formatearHora(b.hora_inicio)} - {formatearHora(b.hora_fin)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Aula */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🏫 Aula *
                </label>
                <select
                  value={formData.aula_id}
                  onChange={(e) => {
                    setFormData({ ...formData, aula_id: e.target.value });
                    setConflictos([]); // Resetear conflictos
                  }}
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione un aula</option>
                  {aulas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.codigo} - Capacidad: {a.capacidad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📋 Tipo de Clase *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) =>
                    setFormData({ ...formData, tipo: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="teorica">📚 Teórico</option>
                  <option value="practica">⚙️ Práctico</option>
                  <option value="laboratorio">🔬 Laboratorio</option>
                </select>
              </div>

              {/* Botón Verificar */}
              <button
                type="button"
                onClick={handleVerificarConflictos}
                disabled={!formData.bloque_id || !formData.aula_id}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 text-white rounded-lg font-medium"
              >
                🔍 Verificar Conflictos
              </button>
            </div>

            {/* Panel de Conflictos */}
            {conflictos.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <h3 className="text-red-300 font-bold mb-2 flex items-center gap-2">
                  ⚠️ Conflictos Detectados ({conflictos.length})
                </h3>
                <ul className="space-y-2">
                  {conflictos.map((c, idx) => (
                    <li
                      key={idx}
                      className="text-red-200 text-sm bg-red-900/30 p-3 rounded"
                    >
                      <div className="font-medium">{c.tipo}</div>
                      <div className="text-red-300/80">{c.mensaje}</div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/horarios/programacion")}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
              >
                {isEditing ? "💾 Actualizar" : "➕ Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
