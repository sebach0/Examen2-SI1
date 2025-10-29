"use client";

/**
 * 🎭 FORMULARIO DE ROL
 * ====================
 * Crear o editar un rol con asignación de permisos por checkboxes
 */

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getRolById, createRol, updateRol } from "@/services/rol.service";
import { getPermisosGrouped } from "@/services/permiso.service";
import type { Permiso } from "@/types";

export default function RolFormPage() {
  const router = useRouter();
  const params = useParams();
  const isEdit = params.id && params.id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [permisosGrouped, setPermisosGrouped] = useState<
    Record<string, Permiso[]>
  >({});
  const [selectedPermisos, setSelectedPermisos] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadPermisos();
    if (isEdit) {
      loadRol();
    }
  }, []);

  const loadPermisos = async () => {
    try {
      const grouped = await getPermisosGrouped();
      setPermisosGrouped(grouped);
    } catch (error) {
      console.error("Error al cargar permisos:", error);
    }
  };

  const loadRol = async () => {
    setLoadingData(true);
    try {
      const rol = await getRolById(params.id as string);
      setNombre(rol.nombre);
      setDescripcion(rol.descripcion || "");

      // Marcar permisos actuales
      if (rol.permisos) {
        setSelectedPermisos(new Set(rol.permisos.map((p) => p.id)));
      }
    } catch (error) {
      console.error("Error al cargar rol:", error);
      alert("Error al cargar el rol");
      router.push("/roles");
    } finally {
      setLoadingData(false);
    }
  };

  const handleTogglePermiso = (permisoId: string) => {
    setSelectedPermisos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(permisoId)) {
        newSet.delete(permisoId);
      } else {
        newSet.add(permisoId);
      }
      return newSet;
    });
  };

  const handleToggleModulo = (modulo: string) => {
    const permisosDelModulo = permisosGrouped[modulo] || [];
    const todosSeleccionados = permisosDelModulo.every((p) =>
      selectedPermisos.has(p.id)
    );

    setSelectedPermisos((prev) => {
      const newSet = new Set(prev);
      if (todosSeleccionados) {
        // Deseleccionar todos
        permisosDelModulo.forEach((p) => newSet.delete(p.id));
      } else {
        // Seleccionar todos
        permisosDelModulo.forEach((p) => newSet.add(p.id));
      }
      return newSet;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      alert("El nombre del rol es obligatorio");
      return;
    }

    setLoading(true);
    try {
      const data = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        permisos: Array.from(selectedPermisos),
      };

      if (isEdit) {
        await updateRol(params.id as string, data);
        alert("Rol actualizado exitosamente");
      } else {
        await createRol(data);
        alert("Rol creado exitosamente");
      }

      router.push("/roles");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        (isEdit ? "Error al actualizar el rol" : "Error al crear el rol");
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Cargando datos del rol...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEdit ? "✏️ Editar Rol" : "🆕 Nuevo Rol"}
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              {isEdit
                ? "Modifica los datos del rol y sus permisos"
                : "Crea un nuevo rol y asigna sus permisos"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos básicos */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Datos del Rol
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Rol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej: Coordinador"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Describe las responsabilidades de este rol..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Asignación de permisos */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Permisos del Rol
              </h2>
              <p className="text-sm text-gray-600">
                Selecciona los permisos que tendrá este rol.{" "}
                {selectedPermisos.size} permisos seleccionados
              </p>
            </div>

            <div className="space-y-4">
              {Object.keys(permisosGrouped).length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No hay permisos disponibles
                </p>
              ) : (
                Object.entries(permisosGrouped).map(([modulo, permisos]) => {
                  const todosSeleccionados = permisos.every((p) =>
                    selectedPermisos.has(p.id)
                  );
                  const algunosSeleccionados =
                    !todosSeleccionados &&
                    permisos.some((p) => selectedPermisos.has(p.id));

                  return (
                    <div
                      key={modulo}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      {/* Header del módulo */}
                      <div className="flex items-center gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={todosSeleccionados}
                          ref={(el) => {
                            if (el) el.indeterminate = algunosSeleccionados;
                          }}
                          onChange={() => handleToggleModulo(modulo)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <label className="text-base font-semibold text-gray-900 uppercase">
                          📦 {modulo}
                        </label>
                        <span className="text-xs text-gray-500">
                          ({permisos.length} permisos)
                        </span>
                      </div>

                      {/* Lista de permisos del módulo */}
                      <div className="ml-8 grid grid-cols-1 md:grid-cols-2 gap-2">
                        {permisos.map((permiso) => (
                          <label
                            key={permiso.id}
                            className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermisos.has(permiso.id)}
                              onChange={() => handleTogglePermiso(permiso.id)}
                              className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {permiso.codigo}
                              </div>
                              <div className="text-xs text-gray-500">
                                {permiso.descripcion}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Guardando..."
                : isEdit
                ? "Actualizar Rol"
                : "Crear Rol"}
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
