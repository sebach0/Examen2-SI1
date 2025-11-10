"use client";

/**
 * ✏️ FORMULARIO CARGA DOCENTE
 * ===========================
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getCargaById,
  createCarga,
  updateCarga,
  type CreateCargaData,
} from "@/services/carga.service";
import { getDocentes } from "@/services/docente.service";
import { getGrupos } from "@/services/grupo.service";
import type { Docente, Grupo } from "@/types";

export default function CargaFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditing = id && id !== "nuevo";

  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);

  const [formData, setFormData] = useState<CreateCargaData>({
    docente_id: "",
    grupo_id: "",
    horas_asignadas: 4,
  });

  useEffect(() => {
    loadDependencias();
    if (isEditing) loadCarga();
  }, [id]);

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

  const loadCarga = async () => {
    try {
      const carga = await getCargaById(id);
      setFormData({
        docente_id: carga.docente_id,
        grupo_id: carga.grupo_id,
        horas_asignadas: carga.horas_asignadas,
      });
    } catch (error) {
      alert("Error al cargar carga");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateCarga(id, formData);
        alert("Carga actualizada");
      } else {
        await createCarga(formData);
        alert("Carga creada");
      }
      router.push("/horarios/cargas");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar");
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-100">
              {isEditing ? "✏️ Editar" : "➕ Nueva"} Asignación
            </h1>
            <p className="text-slate-400 mt-1">Asignar docente a un grupo</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4"
          >
            {/* Docente */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👨‍🏫 Docente *
              </label>
              <select
                value={formData.docente_id}
                onChange={(e) =>
                  setFormData({ ...formData, docente_id: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un docente</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre} - {d.usuario?.email || ""}
                  </option>
                ))}
              </select>
            </div>

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

            {/* Horas */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ⏱️ Horas Asignadas *
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.horas_asignadas}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    horas_asignadas: parseInt(e.target.value),
                  })
                }
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Total de horas semanales para esta materia
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.push("/horarios/cargas")}
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
