<?php

namespace App\Http\Controllers\Api\Asistencia;

use App\Domain\Asistencia\Models\QrSesion;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
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

            // Desactivar sesiones QR anteriores para el mismo grupo/bloque/fecha
            QrSesion::where('grupo_id', $request->grupo_id)
                ->where('bloque_id', $request->bloque_id)
                ->whereDate('fecha', $request->fecha)
                ->update(['activo' => false]);

            // Generar token único
            $token = Str::random(32);

            // Calcular tiempo de expiración (por defecto 15 minutos)
            $duracionMinutos = $request->get('duracion_minutos', 15);
            $expiraEn = now()->addMinutes($duracionMinutos);

            // Crear la sesión QR
            $qrSesion = QrSesion::create([
                'grupo_id' => $request->grupo_id,
                'bloque_id' => $request->bloque_id,
                'fecha' => $request->fecha,
                'token' => $token,
                'expira_en' => $expiraEn,
                'activo' => true
            ]);

            $qrSesion->load(['grupo.materia', 'bloque']);

            $this->logCrear('qr_sesion', $qrSesion);

            return response()->json([
                'message' => 'Código QR generado exitosamente',
                'data' => $qrSesion,
                'url_qr' => url("/asistencia/qr/{$token}")
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al generar código QR',
                'error' => $e->getMessage()
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
                    'message' => 'Código QR no encontrado'
                ], 404);
            }

            // Verificar si está activo y no ha expirado
            $esValido = $qrSesion->activo && $qrSesion->expira_en > now();

            if (!$esValido && $qrSesion->activo) {
                // Si expiró pero aún está marcado como activo, desactivarlo
                $qrSesion->update(['activo' => false]);
            }

            return response()->json([
                'valido' => $esValido,
                'message' => $esValido ? 'Código QR válido' : 'Código QR expirado o inactivo',
                'data' => $qrSesion,
                'expira_en_segundos' => $esValido ? now()->diffInSeconds($qrSesion->expira_en) : 0
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
