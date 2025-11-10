"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import { getEdificios, deleteEdificio } from "@/services/edificio.service";
import type { Edificio } from "@/types";

export default function EdificiosPage() {
  const router = useRouter();
  const [edificios, setEdificios] = useState<Edificio[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEdificios();
  }, []);

  const loadEdificios = async () => {
    try {
      const data = await getEdificios();
      setEdificios(data);
    } catch (error) {
      alert("Error al cargar edificios");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar edificio "${nombre}"?`)) return;
    try {
      await deleteEdificio(id);
      alert("Edificio eliminado");
      loadEdificios();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al eliminar");
    }
  };

  const filtrados = edificios.filter((e) =>
    e.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-100">🏢 Edificios</h1>
            <p className="text-slate-400 mt-1">
              Gestiona los edificios del campus
            </p>
          </div>
          <button
            onClick={() => router.push("/infra/edificios/nuevo")}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            ➕ Nuevo Edificio
          </button>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-4">
          <input
            type="text"
            placeholder="🔍 Buscar edificio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
          />
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-slate-300">Cargando...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              No hay edificios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-600">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase">
                      # Aulas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-slate-800/30 divide-y divide-slate-600">
                  {filtrados.map((edificio) => (
                    <tr
                      key={edificio.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-slate-200">
                        {edificio.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {edificio.aulas?.length || 0}
                      </td>
                      <td className="px-6 py-4 text-right text-sm space-x-2">
                        <button
                          onClick={() =>
                            router.push(`/infra/edificios/${edificio.id}`)
                          }
                          className="text-blue-400 hover:text-blue-300"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(edificio.id, edificio.nombre)
                          }
                          className="text-red-400 hover:text-red-300"
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
      </div>
    </ProtectedLayout>
  );
}
