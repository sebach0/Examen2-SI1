"use client";

/**
 * 📥 IMPORTACIÓN DE USUARIOS
 * ===========================
 * Interfaz para importar usuarios desde archivos Excel/CSV
 */

import { useState, useRef } from "react";
import { ProtectedLayout } from "@/components/shared/ProtectedLayout";
import {
  importarUsuarios,
  type ImportResult,
} from "@/services/importacion.service";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  Download,
} from "lucide-react";

export default function ImportacionPage() {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
        "application/vnd.ms-excel", // .xls
        "text/csv", // .csv
      ];

      if (
        !validTypes.includes(file.type) &&
        !file.name.match(/\.(xlsx|xls|csv)$/i)
      ) {
        setError(
          "Por favor selecciona un archivo Excel (.xlsx, .xls) o CSV (.csv)"
        );
        setArchivo(null);
        return;
      }

      // Validar tamaño (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("El archivo es demasiado grande. Máximo 10MB");
        setArchivo(null);
        return;
      }

      setArchivo(file);
      setError(null);
      setResultado(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!archivo) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const result = await importarUsuarios(archivo);
      setResultado(result);
      setArchivo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      let errorMessage = "Error al importar usuarios";
      
      if (err.response?.data) {
        const data = err.response.data;
        if (data.message) {
          errorMessage = data.message;
        }
        if (data.errors) {
          const errorDetails = Object.entries(data.errors)
            .map(([key, value]: [string, any]) => {
              const messages = Array.isArray(value) ? value : [value];
              return `${key}: ${messages.join(', ')}`;
            })
            .join('\n');
          errorMessage += '\n\n' + errorDetails;
        }
        if (data.error) {
          errorMessage += '\n\n' + data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const descargarPlantilla = () => {
    // Función para escapar valores CSV (agregar comillas si contiene comas o comillas)
    const escapeCsvValue = (value: string): string => {
      if (value === null || value === undefined) {
        return "";
      }
      const str = String(value);
      // Si contiene comas, comillas o saltos de línea, envolver en comillas
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        // Escapar comillas dobles duplicándolas
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Crear plantilla CSV con encoding UTF-8 correcto
    const headers = ["nombre", "email", "ci", "rol", "password"];
    const ejemplo = [
      "Juan Pérez",
      "juan.perez@universidad.edu.bo",
      "12345678",
      "docente",
      "", // password vacío (se generará automáticamente)
    ];

    // Crear CSV con formato correcto
    // BOM UTF-8 para mejor compatibilidad con Excel
    const BOM = "\uFEFF";
    
    // Crear filas con valores escapados correctamente
    // Usar punto y coma (;) como delimitador para compatibilidad con Excel en español
    // El sistema detectará automáticamente el delimitador usado
    const delimitador = ";"; // Excel en español usa punto y coma por defecto
    const headerRow = headers.map(escapeCsvValue).join(delimitador);
    const dataRow = ejemplo.map(escapeCsvValue).join(delimitador);
    
    const csv = BOM + [headerRow, dataRow].join("\r\n");
    
    // Crear blob con encoding UTF-8
    const blob = new Blob([csv], { 
      type: "text/csv;charset=utf-8;" 
    });
    
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantilla-importacion-usuarios.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-100">
            📥 Importación de Usuarios
          </h1>
          <p className="text-slate-400 mt-1">
            Importa usuarios desde archivos Excel o CSV
          </p>
        </div>

        {/* Instrucciones */}
        <div className="glass rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-slate-100 mb-4">
            📋 Formato del Archivo
          </h2>
          <div className="space-y-3 text-slate-300">
            <p>
              El archivo debe contener las siguientes columnas (en la primera
              fila):
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>nombre</strong>: Nombre completo del usuario
              </li>
              <li>
                <strong>email</strong>: Correo electrónico único
              </li>
              <li>
                <strong>ci</strong>: Cédula de identidad (opcional)
              </li>
              <li>
                <strong>rol</strong>: Nombre del rol (admin, docente,
                coordinador, etc.)
              </li>
              <li>
                <strong>password</strong>: Contraseña (opcional, se genera
                automáticamente si no se proporciona)
              </li>
            </ul>
            <div className="mt-4">
              <button
                onClick={descargarPlantilla}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg"
              >
                <Download className="w-4 h-4" />
                Descargar Plantilla CSV
              </button>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="glass rounded-lg p-6 border border-slate-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selector de archivo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Seleccionar Archivo
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                  id="archivo-input"
                />
                <label
                  htmlFor="archivo-input"
                  className="flex items-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg cursor-pointer transition"
                >
                  <Upload className="w-5 h-5" />
                  {archivo ? archivo.name : "Seleccionar archivo"}
                </label>
                {archivo && (
                  <div className="flex items-center gap-2 text-green-400">
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="text-sm">
                      {(archivo.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            {/* Resultado */}
            {resultado && (
              <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <div className="flex items-center gap-2 text-green-300 mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Importación Completada</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <p>
                    <strong>Importados:</strong> {resultado.importados} usuarios
                  </p>
                  <p>
                    <strong>Fallidos:</strong> {resultado.fallidos} registros
                  </p>
                  {resultado.errores.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold mb-2">Errores:</p>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {resultado.errores.map((error, index) => (
                          <div
                            key={index}
                            className="text-sm p-3 bg-red-500/10 border border-red-500/30 rounded"
                          >
                            <div className="font-semibold text-red-300 mb-1">
                              Fila {error.fila}:
                            </div>
                            <div className="text-red-200 whitespace-pre-wrap break-words">
                              {error.error}
                            </div>
                            {error.datos && Object.keys(error.datos).length > 0 && (
                              <details className="mt-2">
                                <summary className="cursor-pointer text-red-300 hover:text-red-200 text-xs">
                                  Ver datos de la fila
                                </summary>
                                <pre className="mt-1 text-xs bg-slate-800/50 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(error.datos, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={!archivo || loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              {loading ? "Importando..." : "📥 Importar Usuarios"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedLayout>
  );
}


