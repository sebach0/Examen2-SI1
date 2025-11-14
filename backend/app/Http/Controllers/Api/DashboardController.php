<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Shared\Traits\LogsActivity;
use App\Domain\Asistencia\Models\Asistencia;
use App\Domain\Academico\Models\Docente;
use App\Domain\Academico\Models\Grupo;
use App\Domain\Academico\Models\Materia;
use App\Domain\Academico\Models\Gestion;
use App\Domain\TiempoHorarios\Models\HorarioGrupo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

/**
 * 📊 CONTROLADOR DE DASHBOARD
 * ============================
 * Proporciona estadísticas generales del sistema para el dashboard
 */
class DashboardController extends Controller
{
    use LogsActivity;

    /**
     * Obtener estadísticas generales del dashboard
     * 
     * GET /api/dashboard/estadisticas
     */
    public function estadisticas(Request $request)
    {
        try {
            // Usar timezone de Bolivia para todas las fechas
            $hoy = Carbon::today(config('app.timezone'));
            $ayer = Carbon::yesterday(config('app.timezone'));
            $semanaPasada = Carbon::today(config('app.timezone'))->subWeek();
            $mesPasado = Carbon::today(config('app.timezone'))->subMonth();

            // Estadísticas de asistencias - Asegurar timezone correcto
            $asistenciasHoy = Asistencia::whereDate('fecha', $hoy->format('Y-m-d'))->count();
            $asistenciasAyer = Asistencia::whereDate('fecha', $ayer->format('Y-m-d'))->count();
            $asistenciasSemana = Asistencia::where('fecha', '>=', $semanaPasada->format('Y-m-d'))->count();
            $asistenciasMes = Asistencia::where('fecha', '>=', $mesPasado->format('Y-m-d'))->count();
            
            $ausenciasHoy = Asistencia::whereDate('fecha', $hoy->format('Y-m-d'))
                ->whereIn('estado', ['ausente', 'tarde'])
                ->count();
            
            $ausenciasAyer = Asistencia::whereDate('fecha', $ayer->format('Y-m-d'))
                ->whereIn('estado', ['ausente', 'tarde'])
                ->count();

            // Calcular cambio porcentual
            $cambioAsistencias = $asistenciasAyer > 0 
                ? round((($asistenciasHoy - $asistenciasAyer) / $asistenciasAyer) * 100, 1)
                : ($asistenciasHoy > 0 ? 100 : 0);
            
            $cambioAusencias = $ausenciasAyer > 0
                ? round((($ausenciasHoy - $ausenciasAyer) / $ausenciasAyer) * 100, 1)
                : ($ausenciasHoy > 0 ? 100 : 0);

            // Estadísticas de grupos
            $totalGrupos = Grupo::count();
            $ahora = now()->setTimezone(config('app.timezone'));
            $gruposActivos = Grupo::whereHas('gestion', function($q) use ($ahora) {
                $q->where('fecha_inicio', '<=', $ahora->format('Y-m-d'))
                  ->where('fecha_fin', '>=', $ahora->format('Y-m-d'));
            })->count();

            // Estadísticas de docentes
            $totalDocentes = Docente::count();
            $docentesActivos = Docente::whereHas('usuario', function($q) {
                $q->where('estado', 'activo');
            })->count();

            // Asistencias por estado (últimos 7 días)
            $asistenciasPorEstado = Asistencia::where('fecha', '>=', $semanaPasada->format('Y-m-d'))
                ->select('estado', DB::raw('COUNT(*) as total'))
                ->groupBy('estado')
                ->get()
                ->map(function($item) {
                    return [
                        'estado' => $item->estado ?? 'desconocido', // Asegurar que siempre sea un string
                        'total' => (int) $item->total
                    ];
                })
                ->filter(function($item) {
                    return !empty($item['estado']) && $item['estado'] !== 'desconocido'; // Filtrar estados vacíos o desconocidos
                })
                ->values(); // Reindexar array

            // Asistencias por día (últimos 7 días)
            $asistenciasPorDia = Asistencia::where('fecha', '>=', $semanaPasada->format('Y-m-d'))
                ->select(DB::raw('DATE(fecha) as fecha'), DB::raw('COUNT(*) as total'))
                ->groupBy(DB::raw('DATE(fecha)'))
                ->orderBy('fecha', 'asc')
                ->get()
                ->map(function($item) {
                    // Asegurar que fecha sea parseada correctamente
                    $fecha = is_string($item->fecha) 
                        ? Carbon::parse($item->fecha)->setTimezone(config('app.timezone'))
                        : Carbon::instance($item->fecha)->setTimezone(config('app.timezone'));
                    
                    return [
                        'fecha' => $fecha->format('Y-m-d'),
                        'fecha_formateada' => $fecha->format('d/m'),
                        'total' => (int) $item->total
                    ];
                });

            // Top 5 docentes con más asistencias (último mes)
            $topDocentes = Asistencia::where('fecha', '>=', $mesPasado->format('Y-m-d'))
                ->select('docente_id', DB::raw('COUNT(*) as total'))
                ->groupBy('docente_id')
                ->orderBy('total', 'desc')
                ->limit(5)
                ->get()
                ->map(function($item) {
                    // Cargar el docente después del groupBy
                    $docente = Docente::find($item->docente_id);
                    return [
                        'docente' => $docente ? $docente->nombre : 'N/A',
                        'total' => (int) $item->total
                    ];
                })
                ->filter(function($item) {
                    return $item['docente'] !== 'N/A'; // Filtrar docentes no encontrados
                })
                ->values();

            // Actividad reciente (últimas 10 asistencias)
            $actividadReciente = Asistencia::with([
                'docente:id,nombre',
                'grupo.materia:id,nombre',
                'grupo:id,codigo'
            ])
            ->orderBy('fecha', 'desc')
            ->orderBy('hora_marcado', 'desc')
            ->limit(10)
            ->get()
            ->map(function($asistencia) {
                // Asegurar que fecha sea un objeto Carbon
                $fecha = $asistencia->fecha;
                if (is_string($fecha)) {
                    $fecha = Carbon::parse($fecha)->setTimezone(config('app.timezone'));
                } elseif ($fecha instanceof \DateTime) {
                    $fecha = Carbon::instance($fecha)->setTimezone(config('app.timezone'));
                } elseif (!$fecha) {
                    $fecha = null;
                }
                
                // Asegurar que hora_marcado sea un objeto Carbon
                $horaMarcado = $asistencia->hora_marcado;
                if (is_string($horaMarcado)) {
                    $horaMarcado = Carbon::parse($horaMarcado)->setTimezone(config('app.timezone'));
                } elseif ($horaMarcado instanceof \DateTime) {
                    $horaMarcado = Carbon::instance($horaMarcado)->setTimezone(config('app.timezone'));
                } elseif (!$horaMarcado) {
                    $horaMarcado = null;
                }
                
                return [
                    'id' => $asistencia->id,
                    'fecha' => $fecha ? $fecha->format('Y-m-d') : null,
                    'fecha_formateada' => $fecha ? $fecha->format('d/m/Y') : null,
                    'docente' => $asistencia->docente ? $asistencia->docente->nombre : 'N/A',
                    'grupo' => $asistencia->grupo ? $asistencia->grupo->codigo : 'N/A',
                    'materia' => $asistencia->grupo && $asistencia->grupo->materia 
                        ? $asistencia->grupo->materia->nombre 
                        : 'N/A',
                    'estado' => $asistencia->estado ?? 'desconocido', // Asegurar que siempre sea un string
                    'created_at' => $horaMarcado ? $horaMarcado->toIso8601String() : null,
                    'tiempo_relativo' => $horaMarcado ? $horaMarcado->setTimezone(config('app.timezone'))->diffForHumans() : null,
                ];
            })
            ->filter(function($item) {
                // Filtrar items con datos inválidos
                return !empty($item['docente']) && $item['docente'] !== 'N/A';
            })
            ->values();

            // Estadísticas adicionales
            $totalMaterias = Materia::count();
            $totalHorarios = HorarioGrupo::count();
            $ahora = now()->setTimezone(config('app.timezone'));
            $gestionActiva = Gestion::where('fecha_inicio', '<=', $ahora->format('Y-m-d'))
                ->where('fecha_fin', '>=', $ahora->format('Y-m-d'))
                ->first();

            $stats = [
                // Tarjetas principales
                'resumen' => [
                    'asistencias_hoy' => $asistenciasHoy,
                    'cambio_asistencias' => $cambioAsistencias,
                    'grupos_activos' => $gruposActivos,
                    'total_docentes' => $totalDocentes,
                    'docentes_activos' => $docentesActivos,
                    'ausencias_hoy' => $ausenciasHoy,
                    'cambio_ausencias' => $cambioAusencias,
                ],
                
                // Gráficos - Asegurar que sean arrays
                'graficos' => [
                    'asistencias_por_estado' => $asistenciasPorEstado->toArray(),
                    'asistencias_por_dia' => $asistenciasPorDia->toArray(),
                    'top_docentes' => $topDocentes->toArray(),
                ],
                
                // Actividad reciente - Asegurar que sea array
                'actividad_reciente' => $actividadReciente->toArray(),
                
                // Estadísticas generales
                'totales' => [
                    'grupos' => $totalGrupos,
                    'materias' => $totalMaterias,
                    'horarios' => $totalHorarios,
                    'gestion_activa' => $gestionActiva ? $gestionActiva->codigo : null,
                ],
            ];

            $this->logConsultar('dashboard', 1);

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas del dashboard',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

