"use client";

/**
 * 📅 FORMULARIO DE GESTIÓN
 * =========================
 * Crear o editar periodo académico
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getGestionById,
  createGestion,
  updateGestion,
} from "@/services/gestion.service";
import type { Gestion } from "@/types";

export default function GestionFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id && params.id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    anio: new Date().getFullYear(),
    periodo: "",
    fecha_inicio: "",
    fecha_fin: "",
    codigo: "",
  });

  useEffect(() => {
    if (isEditing) {
      loadGestion();
    }
  }, []);

  const loadGestion = async () => {
    try {
      const gestion = await getGestionById(params.id as string);
      setFormData({
        anio: gestion.anio,
        periodo: gestion.periodo,
        fecha_inicio: gestion.fecha_inicio,
        fecha_fin: gestion.fecha_fin,
        codigo: gestion.codigo,
      });
    } catch (error) {
      alert("Error al cargar gestión");
      router.push("/academico/gestiones");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateGestion(params.id as string, formData);
        alert("Gestión actualizada");
      } else {
        await createGestion(formData as Omit<Gestion, "id">);
        alert("Gestión creada");
      }
      router.push("/academico/gestiones");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <button
              onClick={() => router.back()}
              className="text-blue-400 hover:text-blue-300 mb-4"
            >
              ← Volver
            </button>
            <h1 className="text-3xl font-bold text-slate-100">
              {isEditing ? "✏️ Editar Gestión" : "➕ Nueva Gestión"}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Año *
                </label>
                <input
                  type="number"
                  required
                  value={formData.anio}
                  onChange={(e) =>
                    setFormData({ ...formData, anio: parseInt(e.target.value) })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Periodo *
                </label>
                <select
                  required
                  value={formData.periodo}
                  onChange={(e) =>
                    setFormData({ ...formData, periodo: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" className="bg-slate-800">
                    Seleccionar...
                  </option>
                  <option value="Primer Semestre" className="bg-slate-800">
                    Primer Semestre
                  </option>
                  <option value="Segundo Semestre" className="bg-slate-800">
                    Segundo Semestre
                  </option>
                  <option value="Anual" className="bg-slate-800">
                    Anual
                  </option>
                  <option value="Verano" className="bg-slate-800">
                    Verano
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Código *
              </label>
              <input
                type="text"
                required
                placeholder="ej: 2025-1"
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({ ...formData, codigo: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Fecha Inicio *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Fecha Fin *
                </label>
                <input
                  type="date"
                  required
                  value={formData.fecha_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_fin: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-lg transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
