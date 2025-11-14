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
    tipo: "teorico",
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

  const normalizarTipoDesdeBackend = (tipo: string): string => {
    // El backend usa: teorica, practica, laboratorio
    // El frontend usa: teorico, practico, laboratorio
    const mapeo: Record<string, string> = {
      'teorica': 'teorico',
      'practica': 'practico',
      'laboratorio': 'laboratorio',
    };
    return mapeo[tipo] || tipo;
  };

  const loadHorario = async () => {
    try {
      const horario = await getHorarioById(id);
      setFormData({
        grupo_id: horario.grupo_id,
        bloque_id: horario.bloque_id,
        aula_id: horario.aula_id,
        tipo: normalizarTipoDesdeBackend(horario.tipo),
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al cargar el horario";
      alert(errorMessage);
      router.push("/horarios/programacion");
    }
  };

  const handleVerificarConflictos = async () => {
    if (!formData.grupo_id || !formData.bloque_id || !formData.aula_id) {
      alert("Seleccione grupo, bloque y aula primero");
      return;
    }

    try {
      const result = await verificarConflictos(formData);
      setConflictos(result.conflictos || []);

      if (!result.tiene_conflictos || result.conflictos.length === 0) {
        alert("✅ Sin conflictos detectados");
      } else {
        // No mostrar alert, los conflictos se muestran en el panel
        console.log(`${result.conflictos.length} conflicto(s) detectado(s)`);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al verificar conflictos";
      const errorDetails = error.response?.data?.errors 
        ? JSON.stringify(error.response.data.errors, null, 2)
        : "";
      alert(errorMessage + (errorDetails ? `\n\nDetalles:\n${errorDetails}` : ""));
      setConflictos([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar conflictos antes de guardar
    if (conflictos.length > 0) {
      if (!confirm("Hay conflictos detectados. ¿Desea continuar de todos modos?")) {
        return;
      }
    }

    try {
      if (isEditing) {
        await updateHorario(id, formData);
        alert("Horario actualizado exitosamente");
      } else {
        await createHorario(formData);
        alert("Horario creado exitosamente");
      }
      router.push("/horarios/programacion");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error al guardar el horario";
      const errorDetails = error.response?.data?.errors 
        ? JSON.stringify(error.response.data.errors, null, 2)
        : error.response?.data?.conflictos
        ? `\n\nConflictos:\n${JSON.stringify(error.response.data.conflictos, null, 2)}`
        : "";
      alert(errorMessage + (errorDetails ? `\n\nDetalles:\n${errorDetails}` : ""));
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
    // Si la hora viene en formato ISO, extraer solo la hora
    if (hora.includes('T')) {
      return hora.split('T')[1]?.split('.')[0]?.substring(0, 5) || hora;
    }
    return hora;
  };

  const formatearBloque = (bloque: BloqueHorario) => {
    const dia = getDiaNombre(bloque.dia_semana);
    const inicio = formatearHora(bloque.hora_inicio);
    const fin = formatearHora(bloque.hora_fin);
    return `${dia} ${inicio} - ${fin}`;
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
                      {formatearBloque(b)}
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
                  <option value="teorico">📚 Teórico</option>
                  <option value="practico">⚙️ Práctico</option>
                  <option value="laboratorio">🔬 Laboratorio</option>
                </select>
              </div>

              {/* Botón Verificar */}
              <button
                type="button"
                onClick={handleVerificarConflictos}
                disabled={!formData.grupo_id || !formData.bloque_id || !formData.aula_id}
                className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                🔍 Verificar Conflictos
              </button>
            </div>

            {/* Panel de Conflictos */}
            {conflictos.length > 0 && (
              <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4">
                <h3 className="text-red-300 font-bold mb-3 flex items-center gap-2">
                  ⚠️ Conflictos Detectados ({conflictos.length})
                </h3>
                <ul className="space-y-3">
                  {conflictos.map((c, idx) => (
                    <li
                      key={idx}
                      className="text-red-200 text-sm bg-red-900/30 p-3 rounded border border-red-700/50"
                    >
                      <div className="font-medium mb-1 capitalize">
                        {c.tipo === 'aula' ? '🏫 Conflicto de Aula' : '👥 Conflicto de Grupo'}
                      </div>
                      <div className="text-red-300/90 mb-2">{c.mensaje}</div>
                      {c.horario && (
                        <div className="text-red-200/70 text-xs mt-2 pt-2 border-t border-red-700/30">
                          <div>Horario existente: {c.horario.grupo?.materia?.nombre || 'N/A'}</div>
                          {c.horario.aula && (
                            <div>Aula: {c.horario.aula.codigo}</div>
                          )}
                        </div>
                      )}
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
