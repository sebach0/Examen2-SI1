"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  createDocente,
  updateDocente,
  getDocenteById,
  type CreateDocenteData,
  type UpdateDocenteData,
} from "@/services/docente.service";
import { getAllRoles } from "@/services/rol.service";
import type { Docente, Rol } from "@/types";

export default function DocenteFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEdit = id && id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);

  // Formulario
  const [formData, setFormData] = useState({
    ci: "",
    nombre: "",
    telefono: "",
    username: "",
    email: "",
    password: "",
    estado: "activo" as "activo" | "suspendido",
    rol_ids: [] as string[],
  });

  useEffect(() => {
    loadRoles();
    if (isEdit) {
      loadDocente();
    }
  }, [isEdit]);

  const loadRoles = async () => {
    try {
      const rolesData = await getAllRoles();
      setRoles(rolesData);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    }
  };

  const loadDocente = async () => {
    try {
      setLoadingData(true);
      const docente = await getDocenteById(id);
      setFormData({
        ci: docente.ci || "",
        nombre: docente.nombre,
        telefono: docente.telefono || "",
        username: docente.usuario?.username || "",
        email: docente.usuario?.email || "",
        password: "",
        estado: docente.usuario?.estado || "activo",
        rol_ids: docente.usuario?.roles?.map((r) => r.id) || [],
      });
    } catch (error) {
      console.error("Error al cargar docente:", error);
      alert("Error al cargar los datos del docente");
      router.push("/docentes");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación básica
    if (
      !formData.ci ||
      !formData.nombre ||
      !formData.username ||
      !formData.email
    ) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    if (!isEdit && !formData.password) {
      alert("La contraseña es obligatoria al crear un docente");
      return;
    }

    try {
      setLoading(true);

      if (isEdit) {
        const updateData: UpdateDocenteData = {
          ci: formData.ci,
          nombre: formData.nombre,
          telefono: formData.telefono || undefined,
          username: formData.username,
          email: formData.email,
          estado: formData.estado,
          rol_ids: formData.rol_ids,
        };

        // Solo incluir password si se especificó uno nuevo
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateDocente(id, updateData);
        alert("Docente actualizado exitosamente");
      } else {
        const createData: CreateDocenteData = {
          ci: formData.ci,
          nombre: formData.nombre,
          telefono: formData.telefono || undefined,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          rol_ids: formData.rol_ids.length > 0 ? formData.rol_ids : undefined,
        };

        await createDocente(createData);
        alert("Docente creado exitosamente");
      }

      router.push("/docentes");
    } catch (error: any) {
      console.error("Error al guardar docente:", error);
      const message = error.message || "Error al guardar el docente";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      rol_ids: prev.rol_ids.includes(roleId)
        ? prev.rol_ids.filter((id) => id !== roleId)
        : [...prev.rol_ids, roleId],
    }));
  };

  if (loadingData) {
    return (
      <ProtectedLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Cargando datos del docente...</p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/docentes")}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Volver a Docentes
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEdit ? "✏️ Editar Docente" : "➕ Nuevo Docente"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEdit
              ? "Modifica los datos del docente"
              : "Completa el formulario para crear un nuevo docente"}
          </p>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CI */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CI *
              </label>
              <input
                type="text"
                value={formData.ci}
                onChange={(e) =>
                  setFormData({ ...formData, ci: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 1234567"
                required
              />
            </div>

            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: 77123456"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usuario *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: jperez"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: jperez@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña {isEdit ? "(dejar vacío para mantener actual)" : "*"}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
                required={!isEdit}
                minLength={6}
              />
            </div>

            {/* Estado (solo en edición) */}
            {isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as "activo" | "suspendido",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="activo">Activo</option>
                  <option value="suspendido">Suspendido</option>
                </select>
              </div>
            )}
          </div>

          {/* Roles */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Roles del Sistema
            </label>
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
              {roles.length === 0 ? (
                <p className="text-gray-500 text-sm">Cargando roles...</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {roles.map((rol) => (
                    <label
                      key={rol.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.rol_ids.includes(rol.id)}
                        onChange={() => handleRoleToggle(rol.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        {rol.nombre}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-3">
                💡 Si no seleccionas ningún rol, se asignará automáticamente el
                rol "docente"
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="mt-6 flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Guardando..."
                : isEdit
                ? "Actualizar Docente"
                : "Crear Docente"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/docentes")}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </ProtectedLayout>
  );
}
