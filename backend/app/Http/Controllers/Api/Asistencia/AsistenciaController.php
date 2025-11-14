<?php

namespace App\Http\Controllers\Api\Asistencia;

use App\Domain\Asistencia\Models\Asistencia;
use App\Domain\Asistencia\Models\QrSesion;
use App\Domain\TiempoHorarios\Models\CargaDocente;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AsistenciaController extends Controller
{
    use LogsActivity;

    /**
     * Listar asistencias con búsqueda y filtros
     * 
     * GET /api/asistencias?docente_id=xxx&grupo_id=xxx&fecha=2024-01-15&perPage=15
     */
    public function index(Request $request)
    {
        try {
            $query = Asistencia::with([
                'docente',
                'grupo.materia',
                'bloque'
            ]);

            // Si el usuario es docente, filtrar automáticamente por su docente_id
            $usuario = $request->user();
            $esDocente = $usuario && $usuario->docente;
            $esSuperAdmin = $usuario && $usuario->roles && $usuario->roles->contains(function($rol) {
                return in_array(strtolower($rol->nombre), ['superadmin', 'admin']);
            });

            if ($esDocente && !$esSuperAdmin) {
                // Docente solo ve sus propias asistencias
                $query->where('docente_id', $usuario->docente->id);
            } elseif ($request->filled('docente_id') && (!$esDocente || $esSuperAdmin)) {
                // Filtro por docente (solo si no es docente o si es admin)
                $query->where('docente_id', $request->docente_id);
            }

            // Filtro por grupo
            if ($request->filled('grupo_id')) {
                $query->where('grupo_id', $request->grupo_id);
            }

            // Filtro por fecha
            if ($request->filled('fecha')) {
                $query->whereDate('fecha', $request->fecha);
            }

            // Filtro por rango de fechas
            if ($request->filled('fecha_desde')) {
                $query->whereDate('fecha', '>=', $request->fecha_desde);
            }
            if ($request->filled('fecha_hasta')) {
                $query->whereDate('fecha', '<=', $request->fecha_hasta);
            }

            // Filtro por estado
            if ($request->filled('estado')) {
                $query->where('estado', $request->estado);
            }

            // Ordenamiento
            $sortField = $request->get('sort', 'fecha');
            $sortDirection = $request->get('direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $asistencias = $query->get();
                $this->logConsultar('asistencia', $asistencias->count());
                return response()->json($asistencias);
            }

            $perPage = $request->get('perPage', 15);
            $asistencias = $query->paginate($perPage);

            $this->logConsultar('asistencia', $asistencias->total());

            return response()->json($asistencias);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Registrar asistencia manualmente
     * 
     * POST /api/asistencias
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'docente_id' => 'required|uuid|exists:docente,id',
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'bloque_id' => 'required|uuid|exists:bloque_horario,id',
                'fecha' => 'required|date',
                'estado' => 'required|string|in:presente,ausente,permiso,retraso',
                'modo' => 'required|string|in:manual,QR', // Debe coincidir con el enum de la base de datos
                'observacion' => 'nullable|string|max:500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar si ya existe un registro de asistencia
            $existente = Asistencia::where('docente_id', $request->docente_id)
                ->where('grupo_id', $request->grupo_id)
                ->where('bloque_id', $request->bloque_id)
                ->whereDate('fecha', $request->fecha)
                ->first();

            if ($existente) {
                return response()->json([
                    'message' => 'Ya existe un registro de asistencia para este docente en esta fecha y bloque'
                ], 422);
            }

            // Crear la asistencia
            $asistencia = Asistencia::create($request->all());
            $asistencia->load(['docente', 'grupo.materia', 'bloque']);

            $this->logCrear('asistencia', $asistencia);

            return response()->json([
                'message' => 'Asistencia registrada exitosamente',
                'data' => $asistencia
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al registrar la asistencia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Marcar asistencia por código QR
     * 
     * POST /api/asistencias/qr
     * 
     * El docente_id se obtiene del usuario autenticado si es docente,
     * o puede ser especificado por un admin.
     */
    public function marcarPorQr(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'docente_id' => 'sometimes|uuid|exists:docente,id', // Opcional, se obtiene del usuario si no se proporciona
            ]);

            if ($validator->fails()) {
                Log::error('Error de validación en marcarPorQr', [
                    'errors' => $validator->errors()->toArray(),
                    'request' => $request->all()
                ]);
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Obtener usuario autenticado
            $usuario = $request->user();
            if (!$usuario) {
                return response()->json([
                    'message' => 'No autenticado'
                ], 401);
            }

            // Cargar relación docente si no está cargada
            if (!$usuario->relationLoaded('docente')) {
                $usuario->load('docente');
            }

            // Determinar docente_id: del request o del usuario autenticado
            $docenteId = $request->docente_id;
            
            // Si no se proporciona docente_id, intentar obtenerlo del usuario autenticado
            if (!$docenteId && $usuario->docente) {
                $docenteId = $usuario->docente->id;
            }

            // Si aún no hay docente_id, es un error
            if (!$docenteId) {
                \Log::error('No se pudo determinar docente_id en marcarPorQr', [
                    'usuario_id' => $usuario->id ?? null,
                    'tiene_docente' => $usuario->docente ? true : false,
                    'docente_id_request' => $request->docente_id ?? null
                ]);
                return response()->json([
                    'message' => 'No se pudo determinar el docente. Debe estar autenticado como docente o proporcionar docente_id.'
                ], 422);
            }

            // Buscar la sesión QR por token (no filtrar por activo aquí, lo verificamos después)
            // Cargar relaciones necesarias: grupo, bloque
            $qrSesion = QrSesion::where('token', $request->token)
                ->with(['grupo.materia', 'bloque'])
                ->first();

            if (!$qrSesion) {
                return response()->json([
                    'message' => 'Código QR no encontrado'
                ], 404);
            }

            // Verificar si no ha expirado (tolerancia de 1 minuto después de expiración)
            // Asegurar que ambas fechas estén en el timezone de Bolivia
            $haExpirado = false;
            if ($qrSesion->expira_en) {
                try {
                    // Asegurar que expira_en esté en el timezone correcto
                    // El accessor ya debería haberlo convertido, pero por seguridad lo verificamos
                    $expiraEn = $qrSesion->expira_en instanceof \Carbon\Carbon 
                        ? $qrSesion->expira_en->copy()->setTimezone(config('app.timezone'))
                        : \Carbon\Carbon::parse($qrSesion->expira_en)->setTimezone(config('app.timezone'));
                    
                    // Obtener hora actual en timezone de Bolivia
                    $ahora = now()->setTimezone(config('app.timezone'));
                    // Usar copy() para no modificar el objeto original
                    $fechaExpiracionConTolerancia = $expiraEn->copy()->addMinutes(1);
                    $haExpirado = $fechaExpiracionConTolerancia < $ahora;
                } catch (\Exception $e) {
                    Log::error('Error al verificar expiración del QR', [
                        'error' => $e->getMessage(),
                        'expira_en' => $qrSesion->expira_en,
                        'token' => $request->token
                    ]);
                    // Si hay error al verificar, considerar como expirado por seguridad
                    $haExpirado = true;
                }
            }
            
            if ($haExpirado) {
                // Si expiró, desactivarlo si aún está activo
                if ($qrSesion->activo) {
                    $qrSesion->update(['activo' => false]);
                }
                return response()->json([
                    'message' => 'El código QR ha expirado. Por favor, solicite un nuevo código QR.'
                ], 422);
            }

            // Verificar si está activo (pero permitir marcar si no ha expirado)
            if (!$qrSesion->activo && !$haExpirado) {
                // Si está inactivo pero no ha expirado, reactivarlo y permitir marcar
                $qrSesion->update(['activo' => true]);
            }

            // Verificar si el docente tiene carga en este grupo
            $tieneCarga = CargaDocente::where('docente_id', $docenteId)
                ->where('grupo_id', $qrSesion->grupo_id)
                ->exists();

            if (!$tieneCarga) {
                return response()->json([
                    'message' => 'No tiene asignación en este grupo'
                ], 403);
            }

            // Validar que la fecha de la sesión QR coincida con la fecha actual (en hora de Bolivia)
            $fechaActual = now()->setTimezone(config('app.timezone'))->format('Y-m-d');
            $fechaSesion = $qrSesion->fecha instanceof \Carbon\Carbon 
                ? $qrSesion->fecha->setTimezone(config('app.timezone'))->format('Y-m-d')
                : \Carbon\Carbon::parse($qrSesion->fecha)->setTimezone(config('app.timezone'))->format('Y-m-d');

            if ($fechaActual !== $fechaSesion) {
                return response()->json([
                    'message' => 'La fecha de la sesión no coincide con la fecha actual. Solo se puede marcar asistencia el día de la clase.'
                ], 422);
            }

            // Validar que la hora actual esté dentro del horario del bloque (en hora de Bolivia)
            // Solo validar si el bloque está cargado y existe
            if ($qrSesion->bloque_id && $qrSesion->bloque) {
                try {
                    $bloque = $qrSesion->bloque;
                    $ahora = now()->setTimezone(config('app.timezone'));
                    $horaActual = $ahora->format('H:i:s');
                    
                    // Obtener hora de inicio y fin del bloque (son campos time, no datetime)
                    // Los campos time se almacenan como strings en formato H:i:s
                    $horaInicioStr = is_string($bloque->hora_inicio) 
                        ? $bloque->hora_inicio 
                        : ($bloque->hora_inicio instanceof \Carbon\Carbon 
                            ? $bloque->hora_inicio->format('H:i:s')
                            : (string) $bloque->hora_inicio);
                    
                    $horaFinStr = is_string($bloque->hora_fin) 
                        ? $bloque->hora_fin 
                        : ($bloque->hora_fin instanceof \Carbon\Carbon 
                            ? $bloque->hora_fin->format('H:i:s')
                            : (string) $bloque->hora_fin);
                    
                    // Asegurar formato H:i:s (agregar :00 si solo tiene H:i)
                    if (strlen($horaInicioStr) === 5) {
                        $horaInicioStr .= ':00';
                    }
                    if (strlen($horaFinStr) === 5) {
                        $horaFinStr .= ':00';
                    }

                    // Crear objetos Carbon para comparar (usando fecha de hoy en timezone de Bolivia)
                    $hoy = $ahora->copy()->startOfDay();
                    $horaInicioCarbon = \Carbon\Carbon::parse($hoy->format('Y-m-d') . ' ' . $horaInicioStr)->setTimezone(config('app.timezone'));
                    $horaFinCarbon = \Carbon\Carbon::parse($hoy->format('Y-m-d') . ' ' . $horaFinStr)->setTimezone(config('app.timezone'));

                    // Verificar que la hora actual esté dentro del rango del bloque
                    // Permitir marcar desde 15 minutos antes del inicio hasta 30 minutos después del fin
                    $horaInicioPermitida = $horaInicioCarbon->copy()->subMinutes(15);
                    $horaFinPermitida = $horaFinCarbon->copy()->addMinutes(30);

                    if ($ahora < $horaInicioPermitida || $ahora > $horaFinPermitida) {
                        return response()->json([
                            'message' => "La asistencia solo se puede marcar durante el horario de la clase. Horario: {$horaInicioStr} - {$horaFinStr} (Hora de Bolivia). Hora actual: {$horaActual}"
                        ], 422);
                    }
                } catch (\Exception $e) {
                    Log::error('Error al validar horario del bloque en marcarPorQr', [
                        'error' => $e->getMessage(),
                        'bloque_id' => $qrSesion->bloque_id,
                        'token' => $request->token,
                        'trace' => $e->getTraceAsString()
                    ]);
                    // Si hay error al validar el horario, permitir marcar (no bloquear por error técnico)
                    // pero registrar el error para debugging
                }
            }

            // Verificar si ya marcó asistencia
            // Convertir fecha a formato string para whereDate
            $fechaFormato = $qrSesion->fecha instanceof \Carbon\Carbon 
                ? $qrSesion->fecha->toDateString() 
                : $qrSesion->fecha;
            
            $existente = Asistencia::where('docente_id', $docenteId)
                ->where('grupo_id', $qrSesion->grupo_id)
                ->where('bloque_id', $qrSesion->bloque_id)
                ->whereDate('fecha', $fechaFormato)
                ->first();

            if ($existente) {
                return response()->json([
                    'message' => 'Ya registró su asistencia para esta sesión',
                    'data' => $existente
                ], 422);
            }

            // Crear el registro de asistencia
            // Asegurar que la fecha esté en el formato correcto
            $fechaAsistencia = $qrSesion->fecha instanceof \Carbon\Carbon 
                ? $qrSesion->fecha->format('Y-m-d') 
                : $qrSesion->fecha;
            
            $asistencia = Asistencia::create([
                'docente_id' => $docenteId,
                'grupo_id' => $qrSesion->grupo_id,
                'bloque_id' => $qrSesion->bloque_id,
                'fecha' => $fechaAsistencia,
                'estado' => 'presente',
                'modo' => 'QR', // Debe ser 'QR' en mayúsculas según el enum de la base de datos
                'observacion' => 'Marcado por QR',
                'hora_marcado' => now()->setTimezone(config('app.timezone')),
            ]);

            $asistencia->load(['docente', 'grupo.materia', 'bloque']);

            $this->logCrear('asistencia', $asistencia);

            return response()->json([
                'message' => 'Asistencia marcada exitosamente',
                'data' => $asistencia
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al marcar asistencia por QR', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'request' => $request->all(),
                'usuario_id' => $request->user()?->id,
                'token' => $request->token ?? null
            ]);
            
            return response()->json([
                'message' => 'Error al marcar asistencia',
                'error' => config('app.debug') ? $e->getMessage() : 'Error interno del servidor',
                'file' => config('app.debug') ? $e->getFile() . ':' . $e->getLine() : null
            ], 500);
        }
    }

    /**
     * Estadísticas de asistencia de un docente
     * 
     * GET /api/asistencias/estadisticas/docente/{docenteId}
     */
    public function estadisticasDocente($docenteId)
    {
        try {
            $total = Asistencia::where('docente_id', $docenteId)->count();
            $presentes = Asistencia::where('docente_id', $docenteId)
                ->where('estado', 'presente')
                ->count();
            $ausentes = Asistencia::where('docente_id', $docenteId)
                ->where('estado', 'ausente')
                ->count();
            $retrasos = Asistencia::where('docente_id', $docenteId)
                ->where('estado', 'retraso')
                ->count();
            $permisos = Asistencia::where('docente_id', $docenteId)
                ->where('estado', 'permiso')
                ->count();

            $porcentajeAsistencia = $total > 0 ? round(($presentes / $total) * 100, 2) : 0;

            return response()->json([
                'total' => $total,
                'presentes' => $presentes,
                'ausentes' => $ausentes,
                'retrasos' => $retrasos,
                'permisos' => $permisos,
                'porcentaje_asistencia' => $porcentajeAsistencia
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Estadísticas de asistencia de un grupo
     * 
     * GET /api/asistencias/estadisticas/grupo/{grupoId}
     */
    public function estadisticasGrupo($grupoId)
    {
        try {
            $total = Asistencia::where('grupo_id', $grupoId)->count();
            $presentes = Asistencia::where('grupo_id', $grupoId)
                ->where('estado', 'presente')
                ->count();
            $ausentes = Asistencia::where('grupo_id', $grupoId)
                ->where('estado', 'ausente')
                ->count();
            $retrasos = Asistencia::where('grupo_id', $grupoId)
                ->where('estado', 'retraso')
                ->count();
            $permisos = Asistencia::where('grupo_id', $grupoId)
                ->where('estado', 'permiso')
                ->count();

            $porcentajeAsistencia = $total > 0 ? round(($presentes / $total) * 100, 2) : 0;

            // Asistencia por docente
            $porDocente = Asistencia::where('grupo_id', $grupoId)
                ->select('docente_id', DB::raw('count(*) as total'))
                ->with('docente:id,nombre,apellido')
                ->groupBy('docente_id')
                ->get();

            return response()->json([
                'total' => $total,
                'presentes' => $presentes,
                'ausentes' => $ausentes,
                'retrasos' => $retrasos,
                'permisos' => $permisos,
                'porcentaje_asistencia' => $porcentajeAsistencia,
                'por_docente' => $porDocente
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exportar asistencias a Excel o PDF
     * 
     * GET /api/asistencias/exportar?formato=excel|pdf
     * 
     * Query params:
     * - formato: excel o pdf (default: excel)
     * - docente_id: Filtrar por docente
     * - grupo_id: Filtrar por grupo
     * - fecha_inicio: Fecha inicio
     * - fecha_fin: Fecha fin
     * - estado: Filtrar por estado
     */
    public function exportar(Request $request)
    {
        try {
            $formato = $request->input('formato', 'excel'); // excel o pdf
            
            $query = Asistencia::with([
                'docente',
                'grupo.materia',
                'bloque'
            ]);

            // Aplicar filtros
            if ($request->filled('docente_id')) {
                $query->where('docente_id', $request->docente_id);
            }

            if ($request->filled('grupo_id')) {
                $query->where('grupo_id', $request->grupo_id);
            }

            if ($request->filled('fecha_inicio')) {
                $query->whereDate('fecha', '>=', $request->fecha_inicio);
            }

            if ($request->filled('fecha_fin')) {
                $query->whereDate('fecha', '<=', $request->fecha_fin);
            }

            if ($request->filled('estado')) {
                $query->where('estado', $request->estado);
            }

            $asistencias = $query->orderBy('fecha', 'desc')->get();

            $this->logActivity(
                'exportar',
                "Exportó reporte de asistencias en formato {$formato}",
                [
                    'formato' => $formato,
                    'total' => $asistencias->count(),
                    'filtros' => $request->only(['docente_id', 'grupo_id', 'fecha_inicio', 'fecha_fin', 'estado']),
                ]
            );

            if ($formato === 'pdf') {
                // Exportar a PDF
                $export = new \App\Exports\AsistenciasPdfExport(
                    $asistencias,
                    $request->only(['docente_id', 'grupo_id', 'fecha_inicio', 'fecha_fin', 'estado'])
                );
                
                return $export->download();
            } else {
                // Exportar a Excel
                return \Maatwebsite\Excel\Facades\Excel::download(
                    new \App\Exports\AsistenciasExport($asistencias),
                    'reporte-asistencias-' . now()->setTimezone(config('app.timezone'))->format('Y-m-d') . '.xlsx'
                );
            }

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al exportar asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
