"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  createMateria,
  updateMateria,
  getMateriaById,
  getCarreras,
  getAllMaterias,
  type CreateMateriaData,
  type UpdateMateriaData,
} from "@/services/materia.service";
import type { Materia, Carrera } from "@/types";

export default function MateriaFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEdit = id && id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [materiasDisponibles, setMateriasDisponibles] = useState<Materia[]>([]);

  // Formulario
  const [formData, setFormData] = useState({
    carrera_id: "",
    codigo: "",
    nombre: "",
    horas_semanales: 4,
    creditos: 4,
    requisito_ids: [] as string[],
  });

  useEffect(() => {
    loadCarreras();
    loadMateriasDisponibles();
    if (isEdit) {
      loadMateria();
    }
  }, [isEdit]);

  const loadCarreras = async () => {
    try {
      const data = await getCarreras();
      setCarreras(data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  };

  const loadMateriasDisponibles = async () => {
    try {
      const data = await getAllMaterias();
      // Filtrar la materia actual si estamos editando
      const filtered = isEdit ? data.filter((m) => m.id !== id) : data;
      setMateriasDisponibles(filtered);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    }
  };

  const loadMateria = async () => {
    try {
      setLoadingData(true);
      const materia = await getMateriaById(id);
      setFormData({
        carrera_id: materia.carrera_id,
        codigo: materia.codigo,
        nombre: materia.nombre,
        horas_semanales: materia.horas_semanales,
        creditos: materia.creditos,
        requisito_ids: materia.requisitos?.map((r) => r.id) || [],
      });
    } catch (error) {
      console.error("Error al cargar materia:", error);
      alert("Error al cargar los datos de la materia");
      router.push("/academico/materias");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (!formData.carrera_id || !formData.codigo || !formData.nombre) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.creditos < 1 || formData.creditos > 20) {
      alert("Los créditos deben estar entre 1 y 20");
      return;
    }

    if (formData.horas_semanales < 1 || formData.horas_semanales > 40) {
      alert("Las horas semanales deben estar entre 1 y 40");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        const updateData: UpdateMateriaData = {
          carrera_id: formData.carrera_id,
          codigo: formData.codigo.toUpperCase(),
          nombre: formData.nombre,
          horas_semanales: formData.horas_semanales,
          creditos: formData.creditos,
          requisito_ids: formData.requisito_ids,
        };

        await updateMateria(id, updateData);
        alert("Materia actualizada exitosamente");
      } else {
        const createData: CreateMateriaData = {
          carrera_id: formData.carrera_id,
          codigo: formData.codigo.toUpperCase(),
          nombre: formData.nombre,
          horas_semanales: formData.horas_semanales,
          creditos: formData.creditos,
          requisito_ids:
            formData.requisito_ids.length > 0
              ? formData.requisito_ids
              : undefined,
        };

        await createMateria(createData);
        alert("Materia creada exitosamente");
      }

      router.push("/academico/materias");
    } catch (error: any) {
      console.error("Error al guardar materia:", error);
      const message = error.message || "Error al guardar la materia";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRequisitoToggle = (materiaId: string) => {
    setFormData((prev) => ({
      ...prev,
      requisito_ids: prev.requisito_ids.includes(materiaId)
        ? prev.requisito_ids.filter((id) => id !== materiaId)
        : [...prev.requisito_ids, materiaId],
    }));
  };

  if (loadingData) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-slate-300">
              Cargando datos de la materia...
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  // Agrupar materias por carrera para mejor visualización
  const materiasPorCarrera = materiasDisponibles.reduce((acc, materia) => {
    const carreraId = materia.carrera_id;
    if (!acc[carreraId]) {
      acc[carreraId] = [];
    }
    acc[carreraId].push(materia);
    return acc;
  }, {} as Record<string, Materia[]>);

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/academico/materias")}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2 transition-colors"
          >
            ← Volver a Materias
          </button>
          <h1 className="text-3xl font-bold text-slate-100">
            {isEdit ? "✏️ Editar Materia" : "➕ Nueva Materia"}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEdit
              ? "Modifica los datos de la materia"
              : "Completa el formulario para crear una nueva materia"}
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Carrera */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Carrera *
              </label>
              <select
                value={formData.carrera_id}
                onChange={(e) =>
                  setFormData({ ...formData, carrera_id: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="" className="bg-slate-800">
                  Selecciona una carrera
                </option>
                {carreras.map((carrera) => (
                  <option
                    key={carrera.id}
                    value={carrera.id}
                    className="bg-slate-800"
                  >
                    {carrera.nombre} ({carrera.codigo})
                  </option>
                ))}
              </select>
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Código *
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    codigo: e.target.value.toUpperCase(),
                  })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all placeholder:text-slate-500"
                placeholder="Ej: MAT-101"
                required
                maxLength={20}
              />
            </div>

            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre de la Materia *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-500"
                placeholder="Ej: Cálculo Diferencial e Integral"
                required
                maxLength={150}
              />
            </div>

            {/* Créditos */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Créditos *
              </label>
              <input
                type="number"
                value={formData.creditos}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    creditos: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                min={1}
                max={20}
                required
              />
            </div>

            {/* Horas Semanales */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Horas Semanales *
              </label>
              <input
                type="number"
                value={formData.horas_semanales}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    horas_semanales: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                min={1}
                max={40}
                required
              />
            </div>
          </div>

          {/* Pre-requisitos */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Pre-requisitos (Materias que deben cursarse antes)
            </label>
            <div className="border border-slate-600 rounded-lg p-4 bg-slate-700/30 max-h-96 overflow-y-auto">
              {Object.keys(materiasPorCarrera).length === 0 ? (
                <p className="text-slate-400 text-sm">
                  No hay materias disponibles
                </p>
              ) : (
                Object.entries(materiasPorCarrera).map(
                  ([carreraId, materias]) => {
                    const carrera = carreras.find((c) => c.id === carreraId);
                    return (
                      <div key={carreraId} className="mb-4 last:mb-0">
                        <h4 className="font-semibold text-slate-200 mb-2 text-sm">
                          {carrera?.nombre || "Sin carrera"}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                          {materias.map((materia) => (
                            <label
                              key={materia.id}
                              className="flex items-center space-x-2 cursor-pointer hover:bg-slate-600/30 p-2 rounded transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.requisito_ids.includes(
                                  materia.id
                                )}
                                onChange={() =>
                                  handleRequisitoToggle(materia.id)
                                }
                                className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-slate-500 rounded bg-slate-600"
                              />
                              <span className="text-sm text-slate-300">
                                <span className="font-mono font-semibold text-blue-400">
                                  {materia.codigo}
                                </span>{" "}
                                - {materia.nombre}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  }
                )
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              💡 Selecciona las materias que el estudiante debe haber aprobado
              antes de cursar esta materia
            </p>
            {formData.requisito_ids.length > 0 && (
              <p className="text-sm text-blue-400 mt-2">
                ✓ {formData.requisito_ids.length} requisito(s) seleccionado(s)
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading
                ? "Guardando..."
                : isEdit
                ? "Actualizar Materia"
                : "Crear Materia"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/academico/materias")}
              className="bg-slate-600 hover:bg-slate-500 text-slate-100 px-6 py-2 rounded-lg transition-all font-medium"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
