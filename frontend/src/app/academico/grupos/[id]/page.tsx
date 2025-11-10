"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getGrupoById,
  createGrupo,
  updateGrupo,
  getGestiones,
} from "@/services/grupo.service";
import { getAllMaterias, getCarreras } from "@/services/materia.service";
import type { Grupo, Gestion, Materia, Carrera } from "@/types";

export default function GrupoFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== "nuevo";
  const grupoId = isEdit ? (params.id as string) : null;

  const [loading, setLoading] = useState(false);
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [carreras, setCarreras] = useState<Carrera[]>([]);

  // Campos del formulario
  const [materiaId, setMateriaId] = useState("");
  const [gestionId, setGestionId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [capacidad, setCapacidad] = useState(30);

  // Para agrupar materias por carrera
  const [selectedCarrera, setSelectedCarrera] = useState("");

  useEffect(() => {
    loadGestiones();
    loadMaterias();
    loadCarreras();
    if (isEdit && grupoId) {
      loadGrupo(grupoId);
    }
  }, [grupoId]);

  const loadGestiones = async () => {
    try {
      const data = await getGestiones();
      setGestiones(data);
    } catch (error) {
      console.error("Error al cargar gestiones:", error);
    }
  };

  const loadMaterias = async () => {
    try {
      const data = await getAllMaterias();
      setMaterias(data);
    } catch (error) {
      console.error("Error al cargar materias:", error);
    }
  };

  const loadCarreras = async () => {
    try {
      const data = await getCarreras();
      setCarreras(data);
    } catch (error) {
      console.error("Error al cargar carreras:", error);
    }
  };

  const loadGrupo = async (id: string) => {
    try {
      setLoading(true);
      const grupo = await getGrupoById(id);
      setMateriaId(grupo.materia_id);
      setGestionId(grupo.gestion_id);
      setCodigo(grupo.codigo);
      setCapacidad(grupo.capacidad);

      // Establecer la carrera seleccionada basada en la materia
      const materia = materias.find((m) => m.id === grupo.materia_id);
      if (materia?.carrera_id) {
        setSelectedCarrera(materia.carrera_id);
      }
    } catch (error) {
      console.error("Error al cargar grupo:", error);
      alert("Error al cargar el grupo");
      router.push("/academico/grupos");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!materiaId) {
      alert("Debes seleccionar una materia");
      return;
    }

    if (!gestionId) {
      alert("Debes seleccionar una gestión");
      return;
    }

    if (!codigo.trim()) {
      alert("El código del grupo es obligatorio");
      return;
    }

    if (capacidad < 1 || capacidad > 200) {
      alert("La capacidad debe estar entre 1 y 200");
      return;
    }

    try {
      setLoading(true);
      const grupoData = {
        materia_id: materiaId,
        gestion_id: gestionId,
        codigo: codigo.trim().toUpperCase(),
        capacidad,
      };

      if (isEdit && grupoId) {
        await updateGrupo(grupoId, grupoData);
        alert("Grupo actualizado exitosamente");
      } else {
        await createGrupo(grupoData);
        alert("Grupo creado exitosamente");
      }

      router.push("/academico/grupos");
    } catch (error: any) {
      const message = error.message || "Error al guardar el grupo";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar materias por carrera seleccionada
  const materiasFiltradas = selectedCarrera
    ? materias.filter((m) => m.carrera_id === selectedCarrera)
    : materias;

  // Agrupar materias por carrera para el select
  const materiasAgrupadas = carreras.map((carrera) => ({
    carrera,
    materias: materias.filter((m) => m.carrera_id === carrera.id),
  }));

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/academico/grupos")}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2 transition-colors"
          >
            ← Volver a grupos
          </button>
          <h1 className="text-3xl font-bold text-slate-100">
            {isEdit ? "✏️ Editar Grupo" : "➕ Nuevo Grupo"}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEdit
              ? "Modifica la información del grupo"
              : "Crea un nuevo grupo para una materia"}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Filtro por Carrera */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🎓 Filtrar por Carrera (opcional)
              </label>
              <select
                value={selectedCarrera}
                onChange={(e) => {
                  setSelectedCarrera(e.target.value);
                  setMateriaId(""); // Resetear materia al cambiar carrera
                }}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="" className="bg-slate-800">
                  Todas las carreras
                </option>
                {carreras.map((carrera) => (
                  <option
                    key={carrera.id}
                    value={carrera.id}
                    className="bg-slate-800"
                  >
                    {carrera.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Materia */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📚 Materia <span className="text-red-400">*</span>
              </label>
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="" className="bg-slate-800">
                  Seleccione una materia
                </option>
                {materiasAgrupadas.map(({ carrera, materias }) =>
                  materias.length > 0 ? (
                    <optgroup
                      key={carrera.id}
                      label={carrera.nombre}
                      className="bg-slate-800"
                    >
                      {materias.map((materia) => (
                        <option
                          key={materia.id}
                          value={materia.id}
                          className="bg-slate-800"
                        >
                          {materia.codigo} - {materia.nombre}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                )}
              </select>
              <p className="text-sm text-slate-400 mt-1">
                Selecciona la materia a la que pertenecerá este grupo
              </p>
            </div>

            {/* Gestión */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📅 Gestión <span className="text-red-400">*</span>
              </label>
              <select
                value={gestionId}
                onChange={(e) => setGestionId(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="" className="bg-slate-800">
                  Seleccione una gestión
                </option>
                {gestiones.map((gestion) => (
                  <option
                    key={gestion.id}
                    value={gestion.id}
                    className="bg-slate-800"
                  >
                    {gestion.codigo} ({gestion.anio}-{gestion.periodo})
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-400 mt-1">
                Período académico en el que se dictará el grupo
              </p>
            </div>

            {/* Código del Grupo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🔤 Código del Grupo <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={10}
                required
                placeholder="Ej: A, B, LAB-1, etc."
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono transition-all placeholder:text-slate-500"
              />
              <p className="text-sm text-slate-400 mt-1">
                Identificador del grupo (A, B, C, LAB-1, etc.). Máximo 10
                caracteres.
              </p>
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👥 Capacidad <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(parseInt(e.target.value))}
                min={1}
                max={200}
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-sm text-slate-400 mt-1">
                Número máximo de estudiantes (1 - 200)
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading
                  ? "⏳ Guardando..."
                  : isEdit
                  ? "💾 Actualizar Grupo"
                  : "➕ Crear Grupo"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/academico/grupos")}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-lg transition-all font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 max-w-2xl">
          <h3 className="font-semibold text-blue-300 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>• El código del grupo debe ser único por materia y gestión</li>
            <li>• Los códigos comunes son: A, B, C para grupos teóricos</li>
            <li>• Para laboratorios usa: LAB-1, LAB-2, etc.</li>
            <li>• La capacidad se puede modificar posteriormente</li>
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  );
}
