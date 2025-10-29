"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  getUsuarioById,
  createUsuario,
  updateUsuario,
  type CreateUsuarioData,
  type UpdateUsuarioData,
} from "@/services/usuario.service";
import { getRoles } from "@/services/rol.service";
import type { Usuario, Rol } from "@/types";

export default function UsuarioFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const isEditing = id && id !== "nuevo";

  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    estado: "activo" as "activo" | "suspendido",
    roles: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadRoles();
    if (isEditing) {
      loadUsuario();
    }
  }, [id]);

  const loadRoles = async () => {
    try {
      const response: any = await getRoles({ per_page: 100 });
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error al cargar roles:", error);
    }
  };

  const loadUsuario = async () => {
    try {
      setLoading(true);
      const usuario = await getUsuarioById(id);
      setFormData({
        username: usuario.username,
        email: usuario.email,
        password: "",
        password_confirm: "",
        estado: usuario.estado,
        roles: usuario.roles ? usuario.roles.map((r: Rol) => r.id) : [],
      });
    } catch (error) {
      console.error("Error al cargar usuario:", error);
      alert("Error al cargar los datos del usuario");
      router.push("/usuarios");
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (formData.username.length > 50) {
      newErrors.username =
        "El nombre de usuario no puede exceder 50 caracteres";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username =
        "El nombre de usuario solo puede contener letras, números, guiones y guiones bajos";
    }

    // Email
    if (!formData.email.trim()) {
      newErrors.email = "El correo electrónico es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Debe ser un correo electrónico válido";
    } else if (formData.email.length > 120) {
      newErrors.email = "El correo electrónico no puede exceder 120 caracteres";
    }

    // Password (solo requerido al crear)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = "La contraseña es requerida";
      } else if (formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
    } else {
      // Al editar, validar solo si se proporcionó contraseña
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      }
    }

    // Confirmar contraseña
    if (formData.password || formData.password_confirm) {
      if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = "Las contraseñas no coinciden";
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

      if (isEditing) {
        const data: UpdateUsuarioData = {
          username: formData.username,
          email: formData.email,
          estado: formData.estado,
          roles: formData.roles,
        };

        // Solo incluir password si se proporcionó
        if (formData.password) {
          data.password = formData.password;
        }

        await updateUsuario(id, data);
        alert("Usuario actualizado exitosamente");
      } else {
        const data: CreateUsuarioData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          estado: formData.estado,
          roles: formData.roles,
        };

        await createUsuario(data);
        alert("Usuario creado exitosamente");
      }

      router.push("/usuarios");
    } catch (error: any) {
      console.error("Error al guardar usuario:", error);

      // Manejar errores de validación del backend
      if (error.errors) {
        const backendErrors: Record<string, string> = {};
        Object.keys(error.errors).forEach((key) => {
          backendErrors[key] = error.errors[key][0];
        });
        setErrors(backendErrors);
      } else {
        alert(error.message || "Error al guardar el usuario");
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

  const handleRoleToggle = (rolId: string) => {
    setFormData((prev) => {
      const roles = prev.roles.includes(rolId)
        ? prev.roles.filter((id) => id !== rolId)
        : [...prev.roles, rolId];
      return { ...prev, roles };
    });
  };

  return (
    <ProtectedLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/usuarios")}
            className="text-blue-500 hover:text-blue-700 mb-2 flex items-center gap-1"
          >
            ← Volver a Usuarios
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? "✏️ Editar Usuario" : "➕ Nuevo Usuario"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? "Modifica los datos del usuario"
              : "Completa los datos para crear un nuevo usuario"}
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading && isEditing ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600">Cargando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username y Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    👤 Nombre de Usuario *
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="usuario123"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.username ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.username}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Solo letras, números, guiones y guiones bajos
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📧 Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="usuario@ejemplo.com"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>

              {/* Contraseñas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔒 Contraseña{" "}
                    {isEditing ? "(dejar vacío para mantener)" : "*"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 6 caracteres
                  </p>
                </div>

                {/* Confirmar Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔒 Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    name="password_confirm"
                    value={formData.password_confirm}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.password_confirm
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.password_confirm && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.password_confirm}
                    </p>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⚡ Estado *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="activo">✓ Activo</option>
                  <option value="suspendido">✕ Suspendido</option>
                </select>
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  🎭 Roles del Usuario
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {roles.map((rol) => (
                    <div
                      key={rol.id}
                      className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleRoleToggle(rol.id)}
                    >
                      <input
                        type="checkbox"
                        checked={formData.roles.includes(rol.id)}
                        onChange={() => handleRoleToggle(rol.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {rol.nombre}
                        </div>
                        {rol.descripcion && (
                          <div className="text-xs text-gray-500">
                            {rol.descripcion}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {roles.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    No hay roles disponibles
                  </p>
                )}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.push("/usuarios")}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Guardando...
                    </>
                  ) : (
                    <>💾 {isEditing ? "Actualizar" : "Crear"} Usuario</>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info adicional */}
        {!isEditing && (
          <div className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <span className="text-blue-400 text-xl mr-2">💡</span>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Nota:</strong> El usuario podrá iniciar sesión con el
                  nombre de usuario o correo electrónico y la contraseña que
                  establezcas. Los roles determinan los permisos que tendrá en
                  el sistema.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
