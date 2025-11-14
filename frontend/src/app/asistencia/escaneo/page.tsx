"use client";

/**
 * 📱 ESCANEAR QR Y MARCAR ASISTENCIA
 * ===================================
 * Página para que los docentes escaneen el código QR y marquen su asistencia automáticamente
 */

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  marcarAsistenciaPorQR,
  verificarQR,
  type QrSesion,
} from "@/services/asistencia.service";
import { getStoredUser, isSuperAdmin } from "@/lib/auth";
import { getDocentes } from "@/services/docente.service";
import type { Docente } from "@/types";

export default function EscanearQRPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [qrSesion, setQrSesion] = useState<QrSesion | null>(null);
  const [error, setError] = useState<string>("");
  const [exito, setExito] = useState(false);
  const [asistencia, setAsistencia] = useState<any>(null);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [docenteSeleccionado, setDocenteSeleccionado] = useState<string>("");
  const [esAdmin, setEsAdmin] = useState(false);

  const marcarAsistenciaAutomatica = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError("");

      // Verificar que el usuario esté autenticado
      const user = getStoredUser();
      if (!user) {
        setError("Debe estar autenticado para marcar asistencia");
        router.push("/login");
        return;
      }

      // Determinar docente_id
      let docenteId: string | undefined = undefined;

      if (esAdmin) {
        // Si es admin, usar el docente seleccionado
        if (!docenteSeleccionado) {
          setError("Debe seleccionar un docente para marcar la asistencia");
          setLoading(false);
          return;
        }
        docenteId = docenteSeleccionado;
      } else {
        // Si es docente, usar su propio docente_id
        if (!user.docente?.id) {
          setError("Solo los docentes pueden marcar asistencia por QR. Si es administrador, debe seleccionar un docente.");
          setLoading(false);
          return;
        }
        docenteId = user.docente.id;
      }

      // Marcar asistencia automáticamente
      const resultado = await marcarAsistenciaPorQR(token, docenteId);
      setAsistencia(resultado);
      setExito(true);

      // Redirigir después de 3 segundos
      setTimeout(() => {
        router.push("/asistencia/reportes");
      }, 3000);
    } catch (err: any) {
      console.error("Error al marcar asistencia:", err);
      
      // Si el error es que ya marcó, mostrar información de éxito
      if (err.response?.data?.data) {
        setAsistencia(err.response.data.data);
        setExito(true);
        setError("");
        // Redirigir después de 3 segundos
        setTimeout(() => {
          router.push("/asistencia/reportes");
        }, 3000);
        return;
      }
      
      // Manejar errores de validación con más detalle
      let mensajeError = "Error al marcar asistencia";
      
      if (err.response?.data?.errors) {
        // Si hay errores de validación, mostrar el primero
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        mensajeError = Array.isArray(firstError) 
          ? firstError[0] 
          : String(firstError);
      } else if (err.response?.data?.message) {
        mensajeError = err.response.data.message;
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const verificarToken = async (esAdminUser: boolean) => {
    if (!token) return;

    try {
      setVerificando(true);
      const resultado = await verificarQR(token);

      // Si hay sesión QR (válida o no), mostrar información
      if (resultado.sesion || resultado.data) {
        setQrSesion(resultado.sesion || resultado.data);
        
        // Si es admin, no marcar automáticamente - esperar selección de docente
        if (esAdminUser) {
          setError("");
          setVerificando(false);
          return; // No marcar automáticamente, esperar selección
        }
        
        // Si es docente y el QR es válido, marcar automáticamente
        if (resultado.valido) {
          setError("");
          await marcarAsistenciaAutomatica();
        } else {
          // Si no es válido pero hay sesión, intentar marcar de todas formas
          // (el backend tiene validaciones más estrictas y puede permitirlo)
          const mensajeError = resultado.mensaje || resultado.message || "Código QR inválido o expirado";
          setError(mensajeError);
          await marcarAsistenciaAutomatica();
        }
      } else {
        // No hay sesión QR
        const mensajeError = resultado.mensaje || resultado.message || "Código QR inválido o expirado";
        setError(mensajeError);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Error al verificar el código QR"
      );
    } finally {
      setVerificando(false);
    }
  };

  useEffect(() => {
    // Inicializar: verificar si es admin y cargar docentes si es necesario
    const initializePage = async () => {
      const user = getStoredUser();
      let esAdminUser = false;
      
      if (user) {
        esAdminUser = isSuperAdmin(user);
        setEsAdmin(esAdminUser);
        
        if (esAdminUser) {
          // Cargar docentes para que el admin pueda seleccionar
          try {
            const response = await getDocentes({ perPage: 100 });
            setDocentes(response.data || []);
          } catch (err) {
            console.error("Error al cargar docentes:", err);
          }
        }
      }

      if (token) {
        await verificarToken(esAdminUser);
      } else {
        setError("No se proporcionó un token válido");
        setVerificando(false);
      }
    };

    initializePage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

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

  const formatearHora = (hora: string) => {
    if (!hora) return "N/A";
    try {
      const [h, m] = hora.split(":");
      return `${h}:${m}`;
    } catch {
      return hora;
    }
  };

  if (verificando || loading) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="glass rounded-lg p-8 text-center space-y-4 max-w-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-slate-300">
              {verificando ? "Verificando código QR..." : "Marcando asistencia..."}
            </p>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (error && !qrSesion) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="glass rounded-lg p-8 text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-400">Error</h2>
            <p className="text-slate-300">{error}</p>
            <button
              onClick={() => router.push("/asistencia/marcar")}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
            >
              Volver
            </button>
          </div>
        </div>
      </ProtectedLayout>
    );
  }

  if (exito && asistencia) {
    return (
      <ProtectedLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
          <div className="glass rounded-lg p-8 text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-400">
              Asistencia Marcada
            </h2>
            <div className="bg-slate-700/50 rounded-lg p-4 text-left space-y-2">
              <p className="text-slate-300">
                <span className="font-semibold">Grupo:</span>{" "}
                {asistencia.grupo?.codigo || "N/A"}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Materia:</span>{" "}
                {asistencia.grupo?.materia?.nombre || "N/A"}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Fecha:</span>{" "}
                {asistencia.fecha
                  ? new Date(asistencia.fecha).toLocaleDateString("es-ES")
                  : "N/A"}
              </p>
              <p className="text-slate-300">
                <span className="font-semibold">Estado:</span>{" "}
                <span className="text-green-400 capitalize">
                  {asistencia.estado || "presente"}
                </span>
              </p>
            </div>
            <p className="text-slate-400 text-sm">
              Redirigiendo en 3 segundos...
            </p>
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
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-100">
              📱 Marcar Asistencia por QR
            </h1>
            <p className="text-slate-400 mt-1">
              Escanea el código QR para marcar tu asistencia
            </p>
          </div>

          {/* Información de la sesión QR */}
          {qrSesion && (
            <div className="glass rounded-lg p-6 border border-slate-700 space-y-4">
              <h2 className="text-xl font-semibold text-slate-200 mb-4">
                Información de la Sesión
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Grupo</p>
                  <p className="text-slate-200 font-semibold">
                    {qrSesion.grupo?.codigo || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Materia</p>
                  <p className="text-slate-200 font-semibold">
                    {qrSesion.grupo?.materia?.nombre || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Fecha</p>
                  <p className="text-slate-200 font-semibold">
                    {qrSesion.fecha
                      ? new Date(qrSesion.fecha).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">Horario</p>
                  <p className="text-slate-200 font-semibold">
                    {qrSesion.bloque
                      ? `${getDiaNombre(
                          qrSesion.bloque.dia_semana
                        )} ${formatearHora(
                          qrSesion.bloque.hora_inicio
                        )} - ${formatearHora(qrSesion.bloque.hora_fin)}`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {qrSesion.expira_en && (
                <div className="bg-amber-900/20 border border-amber-700/50 rounded-lg p-3">
                  <p className="text-amber-300 text-sm">
                    ⏱️ Este código expira el{" "}
                    {(() => {
                      try {
                        // El backend envía la fecha en formato ISO 8601 con timezone (ej: "2025-11-14T15:41:18-04:00")
                        // O en formato "Y-m-d H:i:s" (ej: "2025-11-14 15:41:18")
                        let fechaStr = qrSesion.expira_en;
                        
                        if (typeof fechaStr === 'string') {
                          let fecha: Date;
                          
                          // Si ya está en formato ISO con timezone, usarlo directamente
                          if (fechaStr.includes('T') && (fechaStr.includes('+') || fechaStr.includes('-'))) {
                            fecha = new Date(fechaStr);
                          } else if (fechaStr.includes(' ')) {
                            // Formato "Y-m-d H:i:s" - convertir a ISO con timezone de Bolivia
                            const fechaISO = fechaStr.replace(' ', 'T') + '-04:00'; // UTC-4 para Bolivia
                            fecha = new Date(fechaISO);
                          } else {
                            // Intentar parsear directamente
                            fecha = new Date(fechaStr);
                          }
                          
                          // Formatear en español con timezone de Bolivia
                          return fecha.toLocaleString("es-ES", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            timeZone: "America/La_Paz"
                          });
                        }
                        
                        // Si es Date object, formatearlo
                        return new Date(fechaStr).toLocaleString("es-ES", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          timeZone: "America/La_Paz"
                        });
                      } catch (error) {
                        // Si hay error, mostrar el string original
                        return String(qrSesion.expira_en);
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Selector de Docente (solo para admins) */}
          {qrSesion && esAdmin && !exito && (
            <div className="glass rounded-lg p-6 border border-amber-700/50 bg-amber-900/20">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-400 text-lg">⚠️</span>
                <span className="text-amber-300 font-medium">
                  Modo Administrador
                </span>
              </div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                👨‍🏫 Seleccione el Docente para Marcar Asistencia *
              </label>
              <select
                value={docenteSeleccionado}
                onChange={(e) => {
                  setDocenteSeleccionado(e.target.value);
                  setError("");
                }}
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
              {docenteSeleccionado && (
                <button
                  onClick={marcarAsistenciaAutomatica}
                  disabled={loading}
                  className="mt-4 w-full px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Marcando asistencia...
                    </span>
                  ) : (
                    "✅ Marcar Asistencia"
                  )}
                </button>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
              <p className="text-red-300">{error}</p>
            </div>
          )}

          {/* Mensaje informativo - La asistencia se marca automáticamente (solo para docentes) */}
          {qrSesion && !exito && !loading && !esAdmin && (
            <div className="glass rounded-lg p-6 border border-blue-700/50 bg-blue-900/20">
              <p className="text-blue-300 text-center">
                ⏳ La asistencia se está marcando automáticamente...
              </p>
            </div>
          )}

          {/* Botón para volver */}
          <div className="text-center">
            <button
              onClick={() => router.push("/asistencia/marcar")}
              className="text-slate-400 hover:text-slate-300 underline"
            >
              Volver a marcar asistencia
            </button>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}

