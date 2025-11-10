"use client";

/**
 * 📅 PÁGINA DE GESTIONES
 * =======================
 * Lista y gestión de periodos académicos
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getGestiones, deleteGestion } from "@/services/gestion.service";
import type { Gestion } from "@/types";

export default function GestionesPage() {
  const router = useRouter();
  const [gestiones, setGestiones] = useState<Gestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadGestiones();
  }, []);

  const loadGestiones = async () => {
    setLoading(true);
    try {
      const data = await getGestiones();
      setGestiones(data);
    } catch (error) {
      console.error("Error al cargar gestiones:", error);
      alert("Error al cargar gestiones");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, codigo: string) => {
    if (!confirm(`¿Eliminar la gestión ${codigo}?`)) return;

    try {
      await deleteGestion(id);
      alert("Gestión eliminada exitosamente");
      loadGestiones();
    } catch (error: any) {
      const msg =
        error.response?.data?.message || "Error al eliminar la gestión";
      alert(msg);
    }
  };

  const gestionesFiltradas = gestiones.filter(
    (g) =>
      g.codigo.toLowerCase().includes(search.toLowerCase()) ||
      g.periodo.toLowerCase().includes(search.toLowerCase()) ||
      g.anio.toString().includes(search)
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const isActiva = (gestion: Gestion) => {
    const hoy = new Date();
    const inicio = new Date(gestion.fecha_inicio);
    const fin = new Date(gestion.fecha_fin);
    return hoy >= inicio && hoy <= fin;
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              📅 Gestiones Académicas
            </h1>
            <p className="text-slate-400 mt-1">
              Gestiona los periodos académicos del sistema
            </p>
          </div>
          <button
            onClick={() => router.push("/academico/gestiones/nuevo")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            ➕ Nueva Gestión
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-4">
          <input
            type="text"
            placeholder="🔍 Buscar por código, periodo o año..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
          />
        </div>

        {/* Tabla */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-300">Cargando gestiones...</p>
            </div>
          ) : gestionesFiltradas.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              {search
                ? "No se encontraron gestiones con ese criterio"
                : "No hay gestiones registradas"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Año
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Periodo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Fecha Inicio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Fecha Fin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-600">
                  {gestionesFiltradas.map((gestion) => (
                    <tr
                      key={gestion.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-medium text-blue-400">
                          {gestion.codigo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {gestion.anio}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-200">
                        {gestion.periodo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(gestion.fecha_inicio)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {formatDate(gestion.fecha_fin)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isActiva(gestion) ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/30 text-green-400 border border-green-700/50">
                            ✓ Activa
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400">
                            Inactiva
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/academico/gestiones/${gestion.id}`)
                          }
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(gestion.id, gestion.codigo)
                          }
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Eliminar"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
          <p className="text-sm text-blue-200">
            <strong className="text-blue-300">💡 Tip:</strong> La gestión activa
            se determina automáticamente según las fechas de inicio y fin. Solo
            puede haber una gestión activa a la vez.
          </p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
