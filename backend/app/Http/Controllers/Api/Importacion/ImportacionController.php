<?php

namespace App\Http\Controllers\Api\Importacion;

use App\Domain\Importacion\Models\ImportJob;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use App\Imports\UsuariosImport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

/**
 * 📥 CONTROLADOR DE IMPORTACIÓN
 * ==============================
 * Gestiona la importación masiva de datos desde archivos Excel/CSV
 * 
 * Funcionalidades:
 * - Importar usuarios desde Excel/CSV
 * - Generar cuentas automáticamente
 * - Validación y manejo de errores
 * - Seguimiento de progreso
 */
class ImportacionController extends Controller
{
    use LogsActivity;

    /**
     * Importar usuarios desde archivo Excel/CSV
     * 
     * POST /api/importacion/usuarios
     * 
     * Body (multipart/form-data):
     * - archivo: Archivo Excel o CSV
     */
    public function importarUsuarios(Request $request)
    {
        try {
            // Validar archivo (más flexible para CSV)
            $validator = \Validator::make($request->all(), [
                'archivo' => [
                    'required',
                    'file',
                    function ($attribute, $value, $fail) {
                        if (!$value) {
                            $fail('El archivo es requerido.');
                            return;
                        }
                        
                        $extension = strtolower($value->getClientOriginalExtension());
                        $mimeType = $value->getMimeType();
                        
                        $allowedExtensions = ['xlsx', 'xls', 'csv'];
                        $allowedMimeTypes = [
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
                            'application/vnd.ms-excel', // .xls
                            'text/csv',
                            'text/plain', // Algunos sistemas reportan CSV como text/plain
                            'application/csv',
                        ];
                        
                        if (!in_array($extension, $allowedExtensions)) {
                            $fail('El archivo debe ser Excel (.xlsx, .xls) o CSV (.csv).');
                            return;
                        }
                        
                        // Validar tamaño (max 10MB)
                        if ($value->getSize() > 10 * 1024 * 1024) {
                            $fail('El archivo es demasiado grande. Máximo 10MB.');
                            return;
                        }
                    },
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Guardar archivo temporalmente
            $archivo = $request->file('archivo');
            $extension = strtolower($archivo->getClientOriginalExtension());
            $nombreArchivo = 'import_' . Str::uuid() . '.' . $extension;
            $rutaArchivo = $archivo->storeAs('imports', $nombreArchivo, 'local');

            // Crear registro de importación
            $importJob = ImportJob::create([
                'id' => (string) Str::uuid(),
                'tipo' => 'usuarios',
                'file_path' => $rutaArchivo,
                'estado' => 'pending',
                'total' => 0,
                'procesados' => 0,
                'errores' => 0,
            ]);

            // Procesar importación
            DB::beginTransaction();

            try {
                $importJob->iniciarProcesamiento();

                // Leer archivo y contar filas (excluyendo header)
                $import = new UsuariosImport();
                // Usar el facade Excel directamente con la ruta relativa al storage
                Excel::import($import, $rutaArchivo, 'local');

                // Obtener estadísticas
                $stats = $import->getStats();

                // Actualizar job
                $importJob->update([
                    'total' => $stats['importados'] + $stats['fallidos'],
                    'procesados' => $stats['importados'],
                    'errores' => $stats['fallidos'],
                    'detalle_error' => $stats['errores'],
                ]);

                $importJob->marcarCompletada();

                DB::commit();

                // Log de la acción
                $this->logActivity(
                    'importar',
                    "Importación de usuarios completada: {$stats['importados']} importados, {$stats['fallidos']} fallidos",
                    [
                        'tipo' => 'usuarios',
                        'importados' => $stats['importados'],
                        'fallidos' => $stats['fallidos'],
                        'job_id' => $importJob->id,
                    ]
                );

                return response()->json([
                    'message' => 'Importación completada',
                    'data' => [
                        'job_id' => $importJob->id,
                        'importados' => $stats['importados'],
                        'fallidos' => $stats['fallidos'],
                        'errores' => $stats['errores'],
                        'estado' => $importJob->estado,
                    ],
                ], 200);

            } catch (\Exception $e) {
                DB::rollBack();
                $importJob->marcarFallida($e->getMessage());
                
                Log::error('Error al procesar importación de usuarios', [
                    'job_id' => $importJob->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);

                return response()->json([
                    'message' => 'Error al procesar la importación',
                    'error' => $e->getMessage(),
                ], 500);
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::error('Error de validación en importación', [
                'errors' => $e->errors()
            ]);
            
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error general en importación de usuarios', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al importar usuarios',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener historial de importaciones
     * 
     * GET /api/importacion/historial
     */
    public function historial(Request $request)
    {
        try {
            $tipo = $request->input('tipo');
            $estado = $request->input('estado');
            $perPage = $request->input('perPage', 15);

            $query = ImportJob::query();

            if ($tipo) {
                $query->where('tipo', $tipo);
            }

            if ($estado) {
                $query->where('estado', $estado);
            }

            $importaciones = $query->orderBy('creado_en', 'desc')
                ->paginate($perPage);

            return response()->json($importaciones);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener historial',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener detalle de una importación
     * 
     * GET /api/importacion/{id}
     */
    public function show(string $id)
    {
        try {
            $importJob = ImportJob::findOrFail($id);

            return response()->json([
                'data' => [
                    'id' => $importJob->id,
                    'tipo' => $importJob->tipo,
                    'estado' => $importJob->estado,
                    'total' => $importJob->total,
                    'procesados' => $importJob->procesados,
                    'errores' => $importJob->errores,
                    'porcentaje' => $importJob->porcentaje_progreso,
                    'detalle_error' => $importJob->detalle_error,
                    'creado_en' => $importJob->creado_en,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener importación',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}



