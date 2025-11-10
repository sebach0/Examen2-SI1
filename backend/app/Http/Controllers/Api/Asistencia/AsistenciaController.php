<?php

namespace App\Http\Controllers\Api\Asistencia;

use App\Domain\Asistencia\Models\Asistencia;
use App\Domain\Asistencia\Models\QrSesion;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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

            // Filtro por docente
            if ($request->filled('docente_id')) {
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
                'modo' => 'required|string|in:manual,qr',
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
     */
    public function marcarPorQr(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'token' => 'required|string',
                'docente_id' => 'required|uuid|exists:docente,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Buscar la sesión QR activa
            $qrSesion = QrSesion::where('token', $request->token)
                ->where('activo', true)
                ->first();

            if (!$qrSesion) {
                return response()->json([
                    'message' => 'Código QR inválido o expirado'
                ], 404);
            }

            // Verificar si no ha expirado
            if ($qrSesion->expira_en < now()) {
                $qrSesion->update(['activo' => false]);
                return response()->json([
                    'message' => 'El código QR ha expirado'
                ], 422);
            }

            // Verificar si ya marcó asistencia
            $existente = Asistencia::where('docente_id', $request->docente_id)
                ->where('grupo_id', $qrSesion->grupo_id)
                ->where('bloque_id', $qrSesion->bloque_id)
                ->whereDate('fecha', $qrSesion->fecha)
                ->first();

            if ($existente) {
                return response()->json([
                    'message' => 'Ya registró su asistencia para esta sesión',
                    'data' => $existente
                ], 422);
            }

            // Crear el registro de asistencia
            $asistencia = Asistencia::create([
                'docente_id' => $request->docente_id,
                'grupo_id' => $qrSesion->grupo_id,
                'bloque_id' => $qrSesion->bloque_id,
                'fecha' => $qrSesion->fecha,
                'estado' => 'presente',
                'modo' => 'qr',
                'observacion' => 'Marcado por QR'
            ]);

            $asistencia->load(['docente', 'grupo.materia', 'bloque']);

            $this->logCrear('asistencia', $asistencia);

            return response()->json([
                'message' => 'Asistencia marcada exitosamente',
                'data' => $asistencia
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al marcar asistencia',
                'error' => $e->getMessage()
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
     * Exportar asistencias a Excel
     * 
     * POST /api/asistencias/exportar
     */
    public function exportar(Request $request)
    {
        try {
            // TODO: Implementar exportación a Excel usando Laravel Excel
            // Por ahora retorna los datos en JSON
            
            $query = Asistencia::with([
                'docente',
                'grupo.materia',
                'bloque'
            ]);

            // Aplicar los mismos filtros que en index
            if ($request->filled('docente_id')) {
                $query->where('docente_id', $request->docente_id);
            }

            if ($request->filled('grupo_id')) {
                $query->where('grupo_id', $request->grupo_id);
            }

            if ($request->filled('fecha_desde')) {
                $query->whereDate('fecha', '>=', $request->fecha_desde);
            }

            if ($request->filled('fecha_hasta')) {
                $query->whereDate('fecha', '<=', $request->fecha_hasta);
            }

            $asistencias = $query->orderBy('fecha', 'desc')->get();

            $this->logConsultar('asistencia', $asistencias->count());

            return response()->json([
                'message' => 'Datos preparados para exportación',
                'total' => $asistencias->count(),
                'data' => $asistencias
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al exportar asistencias',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
