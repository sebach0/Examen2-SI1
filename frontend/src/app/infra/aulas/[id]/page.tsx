"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getAulaById,
  createAula,
  updateAula,
  getEdificios,
  getTipos,
  type TipoAula,
} from "@/services/aula.service";
import type { Edificio } from "@/types";

export default function AulaFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id !== "nuevo";
  const aulaId = isEdit ? (params.id as string) : null;

  const [loading, setLoading] = useState(false);
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [tipos, setTipos] = useState<TipoAula[]>([]);

  // Campos del formulario
  const [edificioId, setEdificioId] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("aula");
  const [capacidad, setCapacidad] = useState(30);

  useEffect(() => {
    loadEdificios();
    loadTipos();
    if (isEdit && aulaId) {
      loadAula(aulaId);
    }
  }, [aulaId]);

  const loadEdificios = async () => {
    try {
      const data = await getEdificios();
      setEdificios(data);
    } catch (error) {
      console.error("Error al cargar edificios:", error);
    }
  };

  const loadTipos = async () => {
    try {
      const data = await getTipos();
      setTipos(data);
    } catch (error) {
      console.error("Error al cargar tipos:", error);
    }
  };

  const loadAula = async (id: string) => {
    try {
      setLoading(true);
      const aula = await getAulaById(id);
      setEdificioId(aula.edificio_id);
      setCodigo(aula.codigo);
      setNombre(aula.nombre);
      setTipo(aula.tipo);
      setCapacidad(aula.capacidad);
    } catch (error) {
      console.error("Error al cargar aula:", error);
      alert("Error al cargar el aula");
      router.push("/infra/aulas");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones
    if (!edificioId) {
      alert("Debes seleccionar un edificio");
      return;
    }

    if (!codigo.trim()) {
      alert("El código del aula es obligatorio");
      return;
    }

    if (!nombre.trim()) {
      alert("El nombre del aula es obligatorio");
      return;
    }

    if (!tipo) {
      alert("Debes seleccionar un tipo de aula");
      return;
    }

    if (capacidad < 1 || capacidad > 500) {
      alert("La capacidad debe estar entre 1 y 500");
      return;
    }

    try {
      setLoading(true);
      const aulaData = {
        edificio_id: edificioId,
        codigo: codigo.trim().toUpperCase(),
        nombre: nombre.trim(),
        tipo,
        capacidad,
      };

      if (isEdit && aulaId) {
        await updateAula(aulaId, aulaData);
        alert("Aula actualizada exitosamente");
      } else {
        await createAula(aulaData);
        alert("Aula creada exitosamente");
      }

      router.push("/infra/aulas");
    } catch (error: any) {
      const message = error.message || "Error al guardar el aula";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const getTipoIcon = (tipoValue: string) => {
    const icons: Record<string, string> = {
      aula: "🏫",
      laboratorio: "🔬",
      auditorio: "🎭",
      "sala de cómputo": "💻",
      otro: "📍",
    };
    return icons[tipoValue] || "📍";
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/infra/aulas")}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Volver a aulas
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? "✏️ Editar Aula" : "➕ Nueva Aula"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Modifica la información del aula"
              : "Registra un nuevo espacio físico"}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Edificio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏢 Edificio <span className="text-red-500">*</span>
              </label>
              <select
                value={edificioId}
                onChange={(e) => setEdificioId(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione un edificio</option>
                {edificios.map((edificio) => (
                  <option key={edificio.id} value={edificio.id}>
                    {edificio.nombre}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Edificio al que pertenece el aula
              </p>
            </div>

            {/* Código */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🔤 Código <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={20}
                required
                placeholder="Ej: 101, 202, LAB-A"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
              />
              <p className="text-sm text-gray-500 mt-1">
                Código único del aula dentro del edificio (máx. 20 caracteres)
              </p>
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📝 Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                maxLength={80}
                required
                placeholder="Ej: Aula 101, Laboratorio de Física"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Nombre descriptivo del espacio (máx. 80 caracteres)
              </p>
            </div>

            {/* Tipo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🏷️ Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {tipos.map((t) => (
                  <option key={t.value} value={t.value}>
                    {getTipoIcon(t.value)} {t.label}
                  </option>
                ))}
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Tipo de espacio físico
              </p>
            </div>

            {/* Capacidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                👥 Capacidad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={capacidad}
                onChange={(e) => setCapacidad(parseInt(e.target.value))}
                min={1}
                max={500}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Número máximo de personas (1 - 500)
              </p>
            </div>

            {/* Botones */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? "⏳ Guardando..."
                  : isEdit
                  ? "💾 Actualizar Aula"
                  : "➕ Crear Aula"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/infra/aulas")}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El código debe ser único dentro del edificio seleccionado</li>
            <li>• Los códigos se convierten automáticamente a mayúsculas</li>
            <li>
              • El tipo de aula determina cómo se mostrará en los horarios
            </li>
            <li>
              • La capacidad se usa para validar asignación de estudiantes
            </li>
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  );
}
