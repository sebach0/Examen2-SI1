"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getBloqueById,
  createBloque,
  updateBloque,
  getDias,
  type CreateBloqueData,
  type UpdateBloqueData,
  type DiaSemana,
} from "@/services/bloque.service";
import type { BloqueHorario } from "@/types";

export default function BloqueFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditing = id && id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [dias, setDias] = useState<DiaSemana[]>([]);
  const [formData, setFormData] = useState({
    dia_semana: "",
    hora_inicio: "",
    hora_fin: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDias();
    if (isEditing) {
      loadBloque();
    }
  }, [id]);

  const loadDias = async () => {
    try {
      const data = await getDias();
      setDias(data);
    } catch (error) {
      console.error("Error al cargar días:", error);
    }
  };

  const loadBloque = async () => {
    try {
      setLoading(true);
      const bloque = await getBloqueById(id);
      setFormData({
        dia_semana: bloque.dia_semana.toString(),
        hora_inicio: formatearHoraParaInput(bloque.hora_inicio),
        hora_fin: formatearHoraParaInput(bloque.hora_fin),
      });
    } catch (error) {
      console.error("Error al cargar bloque:", error);
      alert("Error al cargar los datos del bloque horario");
      router.push("/horarios/bloques");
    } finally {
      setLoading(false);
    }
  };

  const formatearHoraParaInput = (hora: string): string => {
    // Si viene en formato HH:MM:SS, tomar solo HH:MM
    if (hora.includes(":")) {
      return hora.substring(0, 5);
    }
    return hora;
  };

  const calcularDuracion = (): string => {
    if (!formData.hora_inicio || !formData.hora_fin) return "";
    try {
      const inicio = new Date(`2000-01-01T${formData.hora_inicio}:00`);
      const fin = new Date(`2000-01-01T${formData.hora_fin}:00`);
      const diffMs = fin.getTime() - inicio.getTime();
      if (diffMs <= 0) return "";
      const minutos = Math.floor(diffMs / 60000);
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      if (horas > 0) {
        return `${horas}h ${mins}min`;
      }
      return `${mins} minutos`;
    } catch {
      return "";
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dia_semana) {
      newErrors.dia_semana = "Selecciona un día de la semana";
    }

    if (!formData.hora_inicio) {
      newErrors.hora_inicio = "La hora de inicio es requerida";
    }

    if (!formData.hora_fin) {
      newErrors.hora_fin = "La hora de fin es requerida";
    }

    if (formData.hora_inicio && formData.hora_fin) {
      const inicio = new Date(`2000-01-01T${formData.hora_inicio}:00`);
      const fin = new Date(`2000-01-01T${formData.hora_fin}:00`);
      if (fin <= inicio) {
        newErrors.hora_fin = "La hora de fin debe ser mayor que la de inicio";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const data = {
        dia_semana: parseInt(formData.dia_semana),
        hora_inicio: formData.hora_inicio,
        hora_fin: formData.hora_fin,
      };

      if (isEditing) {
        await updateBloque(id, data as UpdateBloqueData);
        alert("Bloque horario actualizado exitosamente");
      } else {
        await createBloque(data as CreateBloqueData);
        alert("Bloque horario creado exitosamente");
      }

      router.push("/horarios/bloques");
    } catch (error: any) {
      console.error("Error al guardar bloque:", error);

      // Manejar errores de solapamiento específicos
      if (error.message && error.message.includes("solapamiento")) {
        setErrors({
          ...errors,
          general: error.message,
        });
      } else if (error.message && error.message.includes("único")) {
        setErrors({
          ...errors,
          general:
            "Ya existe un bloque horario con esta combinación de día y horario",
        });
      } else {
        alert(error.message || "Error al guardar el bloque horario");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar error del campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const getDiaIcono = (valor: number): string => {
    const iconos: Record<number, string> = {
      1: "📅",
      2: "📅",
      3: "📅",
      4: "📅",
      5: "📅",
      6: "📅",
      7: "📅",
    };
    return iconos[valor] || "📅";
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/horarios/bloques")}
            className="text-blue-400 hover:text-blue-300 mb-2 flex items-center gap-1 transition-colors"
          >
            ← Volver a Bloques Horarios
          </button>
          <h1 className="text-3xl font-bold text-slate-100">
            {isEditing ? "✏️ Editar Bloque Horario" : "➕ Nuevo Bloque Horario"}
          </h1>
          <p className="text-slate-400 mt-1">
            {isEditing
              ? "Modifica los datos del bloque horario"
              : "Completa los datos para crear un nuevo bloque horario"}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6">
          {loading && !isEditing ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-slate-300">Cargando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error general */}
              {errors.general && (
                <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
                  <div className="flex items-start">
                    <span className="text-red-400 text-xl mr-2">⚠️</span>
                    <p className="text-red-200">{errors.general}</p>
                  </div>
                </div>
              )}

              {/* Día de la semana */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Día de la Semana *
                </label>
                <select
                  name="dia_semana"
                  value={formData.dia_semana}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-slate-700/50 border text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    errors.dia_semana ? "border-red-500" : "border-slate-600"
                  }`}
                >
                  <option value="" className="bg-slate-800">
                    Selecciona un día
                  </option>
                  {dias.map((dia) => (
                    <option
                      key={dia.value}
                      value={dia.value}
                      className="bg-slate-800"
                    >
                      {getDiaIcono(dia.value)} {dia.label}
                    </option>
                  ))}
                </select>
                {errors.dia_semana && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.dia_semana}
                  </p>
                )}
              </div>

              {/* Horas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hora Inicio */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🕐 Hora de Inicio *
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={formData.hora_inicio}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-slate-700/50 border text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.hora_inicio ? "border-red-500" : "border-slate-600"
                    }`}
                  />
                  {errors.hora_inicio && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.hora_inicio}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Formato: HH:MM (ej. 08:00)
                  </p>
                </div>

                {/* Hora Fin */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    🕐 Hora de Fin *
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={formData.hora_fin}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-slate-700/50 border text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.hora_fin ? "border-red-500" : "border-slate-600"
                    }`}
                  />
                  {errors.hora_fin && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.hora_fin}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    Formato: HH:MM (ej. 09:30)
                  </p>
                </div>
              </div>

              {/* Duración calculada */}
              {calcularDuracion() && (
                <div className="bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded">
                  <div className="flex items-center">
                    <span className="text-blue-400 text-xl mr-2">⏱️</span>
                    <div>
                      <p className="text-sm font-medium text-blue-300">
                        Duración del bloque
                      </p>
                      <p className="text-lg font-semibold text-blue-200">
                        {calcularDuracion()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/horarios/bloques")}
                  className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-lg transition-all font-medium"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>💾 {isEditing ? "Actualizar" : "Crear"} Bloque</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-yellow-900/30 border-l-4 border-yellow-600/50 p-4 rounded">
          <div className="flex">
            <span className="text-yellow-400 text-xl mr-2">💡</span>
            <div>
              <p className="text-sm text-yellow-200">
                <strong>Importante:</strong> El sistema validará automáticamente
                que no haya solapamiento de horarios para el mismo día.
                Asegúrate de que las horas no se crucen con bloques existentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}
