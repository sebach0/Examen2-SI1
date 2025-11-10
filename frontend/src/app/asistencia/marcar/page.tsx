"use client";

/**
 * ✅ MARCAR ASISTENCIA
 * ====================
 * Interfaz para que docentes marquen asistencia
 * Los admins pueden seleccionar cualquier docente
 */

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  marcarAsistencia,
  marcarAsistenciaPorQR,
  generarQR,
  type MarcarAsistenciaData,
} from "@/services/asistencia.service";
import { getCargasByDocente } from "@/services/carga.service";
import { getAllBloques } from "@/services/bloque.service";
import { getDocentes } from "@/services/docente.service";
import { getStoredUser } from "@/lib/auth";
import type { CargaDocente, BloqueHorario, Docente } from "@/types";

export default function MarcarAsistenciaPage() {
  const [modo, setModo] = useState<"manual" | "qr">("manual");
  const [cargas, setCargas] = useState<CargaDocente[]>([]);
  const [bloques, setBloques] = useState<BloqueHorario[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [qrToken, setQrToken] = useState<string>("");
  const [qrURL, setQrURL] = useState<string>("");
  const [docenteId, setDocenteId] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [formData, setFormData] = useState<MarcarAsistenciaData>({
    docente_id: "",
    grupo_id: "",
    bloque_id: "",
    fecha: new Date().toISOString().split("T")[0],
    estado: "presente",
    modo: "manual",
    observacion: "",
  });

  useEffect(() => {
    initializePage();
  }, []);

  const initializePage = async () => {
    const user = getStoredUser();

    if (user?.docente?.id) {
      // Usuario es docente - cargar sus propias cargas
      const idDocente = user.docente.id;
      setDocenteId(idDocente);
      setFormData((prev) => ({ ...prev, docente_id: idDocente }));
      setIsAdmin(false);
      await loadData(idDocente);
    } else {
      // Usuario es admin - permitir seleccionar docente
      setIsAdmin(true);
      await loadDocentes();
      // No cargar bloques aún - se cargarán cuando seleccione un docente
    }
  };

  const loadDocentes = async () => {
    try {
      const response = await getDocentes({ perPage: 100 });
      setDocentes(response.data);
    } catch (error) {
      alert("Error al cargar docentes");
    }
  };

  const loadBloques = async () => {
    try {
      const bloquesData = await getAllBloques();
      setBloques(bloquesData);
    } catch (error) {
      alert("Error al cargar bloques");
    }
  };

  const loadData = async (docenteId: string) => {
    try {
      const [cargasData, bloquesData] = await Promise.all([
        getCargasByDocente(docenteId),
        getAllBloques(),
      ]);
      setCargas(cargasData);
      setBloques(bloquesData);
    } catch (error) {
      alert("Error al cargar datos");
    }
  };

  const handleDocenteChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedDocenteId = e.target.value;
    setDocenteId(selectedDocenteId);
    setFormData((prev) => ({
      ...prev,
      docente_id: selectedDocenteId,
      grupo_id: "",
    }));

    if (selectedDocenteId) {
      await loadData(selectedDocenteId);
    } else {
      setCargas([]);
    }
  };

  const handleMarcarManual = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marcarAsistencia(formData);
      alert("✅ Asistencia marcada");
      setFormData({
        ...formData,
        observacion: "",
      });
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al marcar");
    }
  };

  const handleGenerarQR = async () => {
    if (!formData.grupo_id || !formData.bloque_id || !formData.fecha) {
      alert("Complete grupo, bloque y fecha");
      return;
    }

    try {
      const result = await generarQR({
        grupo_id: formData.grupo_id,
        bloque_id: formData.bloque_id,
        fecha: formData.fecha,
        duracion_minutos: 5,
      });

      setQrToken(result.token);
      // Generar URL del QR manualmente (podrías usar una librería como qrcode)
      setQrURL(
        `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(
          result.token
        )}`
      );
      alert("✅ Código QR generado (válido por 5 minutos)");
    } catch (error: any) {
      alert(error.response?.data?.message || "Error al generar QR");
    }
  };

  const getDiaNombre = (dia: number) => {
    const dias = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];
    return dias[dia] || "N/A";
  };

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            ✅ Marcar Asistencia
          </h1>
          <p className="text-slate-400 mt-1">Registro manual o por código QR</p>
        </div>

        {/* Toggle Modo */}
        <div className="flex gap-3">
          <button
            onClick={() => setModo("manual")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium ${
              modo === "manual"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            📝 Marcar Manual
          </button>
          <button
            onClick={() => setModo("qr")}
            className={`flex-1 px-6 py-3 rounded-lg font-medium ${
              modo === "qr"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            📱 Generar QR
          </button>
        </div>

        {/* Modo Manual */}
        {modo === "manual" && (
          <form
            onSubmit={handleMarcarManual}
            className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-slate-200">
              📝 Registro Manual
            </h2>

            {/* Selector de Docente (solo para admins) */}
            {isAdmin && (
              <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-400 text-lg">⚠️</span>
                  <span className="text-amber-300 font-medium">
                    Modo Administrador
                  </span>
                </div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  👨‍🏫 Seleccione Docente *
                </label>
                <select
                  value={docenteId}
                  onChange={handleDocenteChange}
                  required
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">-- Seleccione un docente --</option>
                  {docentes.map((docente) => (
                    <option key={docente.id} value={docente.id}>
                      {docente.nombre} (CI: {docente.ci})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-2">
                  Seleccione el docente para el cual marcará la asistencia
                </p>
              </div>
            )}

            {/* Grupo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👥 Grupo *
              </label>
              <select
                value={formData.grupo_id}
                onChange={(e) =>
                  setFormData({ ...formData, grupo_id: e.target.value })
                }
                required
                disabled={isAdmin && !docenteId}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {isAdmin && !docenteId
                    ? "Primero seleccione un docente"
                    : "Seleccione grupo"}
                </option>
                {cargas.map((c) => (
                  <option key={c.id} value={c.grupo_id}>
                    {c.grupo?.codigo} - {c.grupo?.materia?.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Bloque */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                🕐 Bloque *
              </label>
              <select
                value={formData.bloque_id}
                onChange={(e) =>
                  setFormData({ ...formData, bloque_id: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione bloque</option>
                {bloques.map((b) => (
                  <option key={b.id} value={b.id}>
                    {getDiaNombre(b.dia_semana)} {b.hora_inicio} - {b.hora_fin}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📅 Fecha *
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) =>
                  setFormData({ ...formData, fecha: e.target.value })
                }
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                ✔️ Estado *
              </label>
              <select
                value={formData.estado}
                onChange={(e) =>
                  setFormData({ ...formData, estado: e.target.value as any })
                }
                required
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="presente">✅ Presente</option>
                <option value="ausente">❌ Ausente</option>
                <option value="tarde">⏰ Tardanza</option>
                <option value="justificado">📝 Justificado</option>
              </select>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                📝 Observaciones
              </label>
              <textarea
                value={formData.observacion || ""}
                onChange={(e) =>
                  setFormData({ ...formData, observacion: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium"
            >
              ✅ Marcar Asistencia
            </button>
          </form>
        )}

        {/* Modo QR */}
        {modo === "qr" && (
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-6 space-y-4">
              <h2 className="text-xl font-bold text-slate-200">
                📱 Generar Código QR
              </h2>

              {/* Selector de Docente (solo para admins) */}
              {isAdmin && (
                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-amber-400 text-lg">⚠️</span>
                    <span className="text-amber-300 font-medium">
                      Modo Administrador
                    </span>
                  </div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    👨‍🏫 Seleccione Docente *
                  </label>
                  <select
                    value={docenteId}
                    onChange={handleDocenteChange}
                    required
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">-- Seleccione un docente --</option>
                    {docentes.map((docente) => (
                      <option key={docente.id} value={docente.id}>
                        {docente.nombre} (CI: {docente.ci})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-2">
                    Seleccione el docente para el cual generará el código QR
                  </p>
                </div>
              )}

              {/* Grupo */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  👥 Grupo *
                </label>
                <select
                  value={formData.grupo_id}
                  onChange={(e) =>
                    setFormData({ ...formData, grupo_id: e.target.value })
                  }
                  disabled={isAdmin && !docenteId}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {isAdmin && !docenteId
                      ? "Primero seleccione un docente"
                      : "Seleccione grupo"}
                  </option>
                  {cargas.map((c) => (
                    <option key={c.id} value={c.grupo_id}>
                      {c.grupo?.codigo} - {c.grupo?.materia?.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bloque */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  🕐 Bloque *
                </label>
                <select
                  value={formData.bloque_id}
                  onChange={(e) =>
                    setFormData({ ...formData, bloque_id: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione bloque</option>
                  {bloques.map((b) => (
                    <option key={b.id} value={b.id}>
                      {getDiaNombre(b.dia_semana)} {b.hora_inicio} -{" "}
                      {b.hora_fin}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  📅 Fecha *
                </label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 text-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleGenerarQR}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
              >
                📱 Generar Código QR
              </button>
            </div>

            {/* Mostrar QR */}
            {qrURL && (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-green-600 rounded-lg shadow-xl p-8 text-center space-y-4">
                <h3 className="text-xl font-bold text-green-300">
                  ✅ Código QR Generado
                </h3>
                <div className="bg-white p-4 rounded-lg inline-block">
                  <img src={qrURL} alt="QR Code" className="w-64 h-64" />
                </div>
                <p className="text-slate-300">
                  Muestra este código a los estudiantes
                </p>
                <p className="text-red-300 text-sm">⏱️ Válido por 5 minutos</p>
                <div className="font-mono text-xs text-slate-500 break-all">
                  Token: {qrToken}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}
