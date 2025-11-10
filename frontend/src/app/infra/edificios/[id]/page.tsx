"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getEdificioById,
  createEdificio,
  updateEdificio,
} from "@/services/edificio.service";

export default function EdificioFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEditing = params.id && params.id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [nombre, setNombre] = useState("");

  useEffect(() => {
    if (isEditing) {
      loadEdificio();
    }
  }, []);

  const loadEdificio = async () => {
    try {
      const edificio = await getEdificioById(params.id as string);
      setNombre(edificio.nombre);
    } catch (error) {
      alert("Error al cargar edificio");
      router.push("/infra/edificios");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        await updateEdificio(params.id as string, { nombre });
        alert("Edificio actualizado");
      } else {
        await createEdificio({ nombre });
        alert("Edificio creado");
      }
      router.push("/infra/edificios");
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
              {isEditing ? "✏️ Editar Edificio" : "➕ Nuevo Edificio"}
            </h1>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Nombre del Edificio *
              </label>
              <input
                type="text"
                required
                placeholder="ej: Edificio Central"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-lg font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
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
