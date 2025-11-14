<?php

namespace App\Http\Controllers\Api\Asistencia;

use App\Domain\Asistencia\Models\QrSesion;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class QrSesionController extends Controller
{
    use LogsActivity;

    /**
     * Generar un nuevo código QR para una sesión
     * 
     * POST /api/qr-sesiones/generar
     */
    public function generar(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'bloque_id' => 'required|uuid|exists:bloque_horario,id',
                'fecha' => 'required|date',
                'duracion_minutos' => 'sometimes|integer|min:5|max:120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Calcular tiempo de expiración (por defecto 15 minutos)
            // Asegurar que se use el timezone de Bolivia
            // IMPORTANTE: Guardar en formato que PostgreSQL entienda correctamente
            $duracionMinutos = $request->get('duracion_minutos', 15);
            $expiraEn = now()->setTimezone(config('app.timezone'))->addMinutes($duracionMinutos);
            
            // Asegurar que se guarde correctamente en la base de datos
            // Convertir a string con timezone explícito para PostgreSQL timestampTz
            // PostgreSQL espera el formato: 'YYYY-MM-DD HH:MM:SS+TZ'
            $expiraEnString = $expiraEn->format('Y-m-d H:i:sP'); // P = timezone offset (+04:00)

            // Generar token único
            $token = Str::random(32);

            // Buscar si ya existe un QR para este grupo/bloque/fecha
            $qrSesionExistente = QrSesion::where('grupo_id', $request->grupo_id)
                ->where('bloque_id', $request->bloque_id)
                ->whereDate('fecha', $request->fecha)
                ->first();

            $esNuevo = !$qrSesionExistente;

            if ($qrSesionExistente) {
                // Si existe, actualizar con nuevo token y tiempo de expiración
                // Usar DB::raw para insertar directamente el string con timezone
                DB::table('qr_sesion')
                    ->where('id', $qrSesionExistente->id)
                    ->update([
                        'token' => $token,
                        'expira_en' => DB::raw("TIMESTAMP WITH TIME ZONE '{$expiraEnString}'"),
                        'activo' => true,
                    ]);
                $qrSesion = $qrSesionExistente->fresh();
            } else {
                // Si no existe, crear uno nuevo
                // Usar DB::raw para insertar directamente el string con timezone
                $qrSesionId = Str::uuid()->toString();
                DB::table('qr_sesion')->insert([
                    'id' => $qrSesionId,
                    'grupo_id' => $request->grupo_id,
                    'bloque_id' => $request->bloque_id,
                    'fecha' => $request->fecha,
                    'token' => $token,
                    'expira_en' => DB::raw("TIMESTAMP WITH TIME ZONE '{$expiraEnString}'"),
                    'activo' => true,
                    'creado_en' => now()->setTimezone(config('app.timezone'))->format('Y-m-d H:i:sP'),
                ]);
                $qrSesion = QrSesion::find($qrSesionId);
            }

            // Recargar relaciones después de crear/actualizar
            $qrSesion->load(['grupo.materia', 'bloque']);

            // Log según si es nuevo o actualización
            if ($esNuevo) {
                $this->logCrear('qr_sesion', $qrSesion);
            } else {
                $this->logActualizar('qr_sesion', $qrSesion->id);
            }

            // Generar URL completa para el QR (frontend)
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
            $qrUrl = "{$frontendUrl}/asistencia/escaneo?token={$token}";

            // Formatear fechas con timezone de Bolivia para el frontend
            // Enviar en formato ISO con timezone explícito para que el frontend lo interprete correctamente
            $qrSesionData = $qrSesion->toArray();
            if (isset($qrSesionData['expira_en']) && $qrSesion->expira_en) {
                // Formatear expira_en en timezone de Bolivia como ISO 8601 con timezone
                $qrSesionData['expira_en'] = $qrSesion->expira_en
                    ->copy()
                    ->setTimezone(config('app.timezone'))
                    ->toIso8601String(); // Formato: "2025-11-14T15:41:18-04:00"
            }
            if (isset($qrSesionData['fecha']) && $qrSesion->fecha) {
                // Formatear fecha en timezone de Bolivia
                $qrSesionData['fecha'] = $qrSesion->fecha
                    ->copy()
                    ->setTimezone(config('app.timezone'))
                    ->format('Y-m-d');
            }
            if (isset($qrSesionData['creado_en']) && $qrSesion->creado_en) {
                // Formatear creado_en en timezone de Bolivia como ISO 8601 con timezone
                $qrSesionData['creado_en'] = $qrSesion->creado_en
                    ->copy()
                    ->setTimezone(config('app.timezone'))
                    ->toIso8601String(); // Formato: "2025-11-14T15:41:18-04:00"
            }

            return response()->json([
                'message' => 'Código QR generado exitosamente',
                'data' => $qrSesionData,
                'token' => $token,
                'url_qr' => $qrUrl,
                'qr_data' => $qrUrl, // URL completa para incluir en el QR
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Error al generar QR: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request' => $request->all()
            ]);
            
            return response()->json([
                'message' => 'Error al generar código QR',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor'
            ], 500);
        }
    }

    /**
     * Verificar validez de un token QR
     * 
     * GET /api/qr-sesiones/verificar/{token}
     */
    public function verificar($token)
    {
        try {
            $qrSesion = QrSesion::where('token', $token)
                ->with(['grupo.materia', 'bloque'])
                ->first();

            if (!$qrSesion) {
                return response()->json([
                    'valido' => false,
                    'mensaje' => 'Código QR no encontrado',
                    'message' => 'Código QR no encontrado'
                ], 404);
            }

            // Verificar si no ha expirado (tolerancia de 1 minuto después de expiración)
            // Asegurar que ambas fechas estén en el timezone de Bolivia
            $haExpirado = false;
            if ($qrSesion->expira_en) {
                // Asegurar que expira_en esté en el timezone correcto
                $expiraEn = $qrSesion->expira_en->copy()->setTimezone(config('app.timezone'));
                // Obtener hora actual en timezone de Bolivia
                $ahora = now()->setTimezone(config('app.timezone'));
                // Usar copy() para no modificar el objeto original
                $fechaExpiracionConTolerancia = $expiraEn->copy()->addMinutes(1);
                $haExpirado = $fechaExpiracionConTolerancia < $ahora;
            }
            
            // El QR es válido si no ha expirado (activo o no, mientras no haya expirado)
            $esValido = !$haExpirado;

            if ($haExpirado && $qrSesion->activo) {
                // Si expiró pero aún está marcado como activo, desactivarlo
                $qrSesion->update(['activo' => false]);
            } elseif (!$haExpirado && !$qrSesion->activo) {
                // Si no ha expirado pero está inactivo, reactivarlo
                $qrSesion->update(['activo' => true]);
            }

            // Recargar relaciones si no están cargadas
            if (!$qrSesion->relationLoaded('grupo')) {
                $qrSesion->load(['grupo.materia', 'bloque']);
            }

            // Formatear fechas con timezone de Bolivia para el frontend
            // Enviar en formato ISO con timezone explícito para que el frontend lo interprete correctamente
            $qrSesionData = $qrSesion->toArray();
            if (isset($qrSesionData['expira_en']) && $qrSesion->expira_en) {
                // Formatear expira_en en timezone de Bolivia como ISO 8601 con timezone
                $qrSesionData['expira_en'] = $qrSesion->expira_en
                    ->copy()
                    ->setTimezone(config('app.timezone'))
                    ->toIso8601String(); // Formato: "2025-11-14T15:41:18-04:00"
            }
            if (isset($qrSesionData['fecha']) && $qrSesion->fecha) {
                // Formatear fecha en timezone de Bolivia
                $qrSesionData['fecha'] = $qrSesion->fecha
                    ->copy()
                    ->setTimezone(config('app.timezone'))
                    ->format('Y-m-d');
            }
            if (isset($qrSesionData['creado_en']) && $qrSesion->creado_en) {
                // Formatear creado_en en timezone de Bolivia como ISO 8601 con timezone
                $qrSesionData['creado_en'] = $qrSesion->creado_en
                    ->copy()
                    ->setTimezone(config('app.timezone'))
                    ->toIso8601String(); // Formato: "2025-11-14T15:41:18-04:00"
            }

            return response()->json([
                'valido' => $esValido,
                'mensaje' => $esValido ? 'Código QR válido' : 'Código QR expirado o inactivo',
                'message' => $esValido ? 'Código QR válido' : 'Código QR expirado o inactivo', // Compatibilidad
                'sesion' => $qrSesionData,
                'data' => $qrSesionData, // Compatibilidad con código existente
                'expira_en_segundos' => $esValido 
                    ? now()->setTimezone(config('app.timezone'))->diffInSeconds($qrSesion->expira_en->setTimezone(config('app.timezone'))) 
                    : 0
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al verificar código QR',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Desactivar una sesión QR
     * 
     * POST /api/qr-sesiones/{id}/desactivar
     */
    public function desactivar($id)
    {
        try {
            $qrSesion = QrSesion::findOrFail($id);

            $datosAnteriores = $qrSesion->toArray();

            $qrSesion->update(['activo' => false]);

            $this->logActualizar('qr_sesion', $qrSesion->id);

            return response()->json([
                'message' => 'Sesión QR desactivada exitosamente',
                'data' => $qrSesion
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al desactivar sesión QR',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
