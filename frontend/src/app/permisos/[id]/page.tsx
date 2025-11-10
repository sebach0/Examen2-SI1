"use client";

/**
 * 🔐 FORMULARIO DE PERMISO
 * =========================
 * Crear o editar un permiso del sistema
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getPermisoById,
  createPermiso,
  updatePermiso,
} from "@/services/permiso.service";

export default function PermisoFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadPermiso();
    }
  }, []);

  const loadPermiso = async () => {
    setLoadingData(true);
    try {
      const permiso = await getPermisoById(params.id as string);
      setCodigo(permiso.codigo);
      setDescripcion(permiso.descripcion);
    } catch (error) {
      console.error("Error al cargar permiso:", error);
      alert("Error al cargar el permiso");
      router.push("/permisos");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!codigo.trim()) {
      alert("El código del permiso es obligatorio");
      return;
    }

    if (!descripcion.trim()) {
      alert("La descripción del permiso es obligatoria");
      return;
    }

    setLoading(true);
    try {
      const data = {
        codigo: codigo.trim(),
        descripcion: descripcion.trim(),
      };

      if (isEdit) {
        await updatePermiso(params.id as string, data);
        alert("Permiso actualizado exitosamente");
      } else {
        await createPermiso(data);
        alert("Permiso creado exitosamente");
      }

      router.push("/permisos");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (isEdit
          ? "Error al actualizar el permiso"
          : "Error al crear el permiso");
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-slate-300">Cargando datos del permiso...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Volver
            </button>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                {isEdit ? "✏️ Editar Permiso" : "🆕 Nuevo Permiso"}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {isEdit
                  ? "Modifica los datos del permiso"
                  : "Crea un nuevo permiso para el sistema"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Datos del permiso */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-slate-100">
                Datos del Permiso
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Código del Permiso <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value)}
                  placeholder="ej: academico.materias.crear"
                  required
                  className="w-full px-4 py-2 font-mono bg-slate-700/50 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Formato recomendado:{" "}
                  <code className="bg-slate-700 px-1 py-0.5 rounded">
                    modulo.recurso.accion
                  </code>
                  <br />
                  Ejemplos: academico.materias.crear, asistencia.reportes.ver,
                  auth.usuarios.eliminar
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Descripción <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Describe qué acción permite este permiso..."
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Ejemplos: "Permite crear nuevas materias", "Permite ver
                  reportes de asistencia", "Permite eliminar usuarios del
                  sistema"
                </p>
              </div>
            </div>

            {/* Guía de convención */}
            <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-300 mb-2">
                📘 Convención de Nombres de Permisos
              </h3>
              <div className="text-sm text-blue-200 space-y-2">
                <p>
                  <strong className="text-blue-300">Módulo:</strong> academico,
                  asistencia, infraestructura, horarios, auth, sistema
                </p>
                <p>
                  <strong className="text-blue-300">Recurso:</strong> materias,
                  grupos, gestiones, usuarios, roles, permisos
                </p>
                <p>
                  <strong className="text-blue-300">Acción:</strong> crear, ver,
                  editar, eliminar, exportar, importar
                </p>
                <p className="pt-2 border-t border-blue-700/50">
                  <strong className="text-blue-300">Ejemplos válidos:</strong>
                </p>
                <ul className="list-disc list-inside pl-2 space-y-1 text-blue-200">
                  <li>academico.materias.crear</li>
                  <li>academico.materias.editar</li>
                  <li>asistencia.marcar</li>
                  <li>asistencia.reportes.ver</li>
                  <li>auth.usuarios.gestionar</li>
                  <li>sistema.bitacora.ver</li>
                </ul>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-500 text-slate-100 rounded-md transition-colors font-medium"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading
                  ? "Guardando..."
                  : isEdit
                  ? "Actualizar Permiso"
                  : "Crear Permiso"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}
