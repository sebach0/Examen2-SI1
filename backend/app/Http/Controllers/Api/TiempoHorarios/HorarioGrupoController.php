<?php

namespace App\Http\Controllers\Api\TiempoHorarios;

use App\Domain\TiempoHorarios\Models\HorarioGrupo;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class HorarioGrupoController extends Controller
{
    use LogsActivity;

    /**
     * Listar horarios de grupo con búsqueda y filtros
     * 
     * GET /api/horarios-grupo?grupo_id=xxx&aula_id=xxx&perPage=15
     */
    public function index(Request $request)
    {
        try {
            $query = HorarioGrupo::with([
                'grupo.materia', 
                'grupo.gestion',
                'bloque',
                'aula.edificio'
            ]);

            // Filtro por grupo
            if ($request->filled('grupo_id')) {
                $query->where('grupo_id', $request->grupo_id);
            }

            // Filtro por aula
            if ($request->filled('aula_id')) {
                $query->where('aula_id', $request->aula_id);
            }

            // Filtro por tipo
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Ordenamiento por bloque horario
            $query->join('bloque_horario', 'horario_grupo.bloque_id', '=', 'bloque_horario.id')
                  ->select('horario_grupo.*')
                  ->orderBy('bloque_horario.dia_semana', 'asc')
                  ->orderBy('bloque_horario.hora_inicio', 'asc');

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $horarios = $query->get();
                $this->logConsultar('horario_grupo', $horarios->count());
                return response()->json($horarios);
            }

            $perPage = $request->get('perPage', 15);
            $horarios = $query->paginate($perPage);

            $this->logConsultar('horario_grupo', $horarios->total());

            return response()->json($horarios);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los horarios de grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener horarios de un grupo específico
     * 
     * GET /api/horarios-grupo/grupo/{grupoId}
     */
    public function byGrupo($grupoId)
    {
        try {
            $horarios = HorarioGrupo::with(['bloque', 'aula.edificio'])
                ->where('grupo_id', $grupoId)
                ->join('bloque_horario', 'horario_grupo.bloque_id', '=', 'bloque_horario.id')
                ->select('horario_grupo.*')
                ->orderBy('bloque_horario.dia_semana', 'asc')
                ->orderBy('bloque_horario.hora_inicio', 'asc')
                ->get();

            $this->logConsultar('horario_grupo', $horarios->count());

            return response()->json($horarios);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los horarios del grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener horarios de un aula específica
     * 
     * GET /api/horarios-grupo/aula/{aulaId}
     */
    public function byAula($aulaId)
    {
        try {
            $horarios = HorarioGrupo::with(['grupo.materia', 'bloque'])
                ->where('aula_id', $aulaId)
                ->join('bloque_horario', 'horario_grupo.bloque_id', '=', 'bloque_horario.id')
                ->select('horario_grupo.*')
                ->orderBy('bloque_horario.dia_semana', 'asc')
                ->orderBy('bloque_horario.hora_inicio', 'asc')
                ->get();

            $this->logConsultar('horario_grupo', $horarios->count());

            return response()->json($horarios);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los horarios del aula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verificar conflictos de horario
     * 
     * POST /api/horarios-grupo/verificar-conflictos
     */
    public function verificarConflictos(Request $request)
    {
        try {
            // Aceptar tanto bloque_id como bloque_horario_id para compatibilidad
            $bloqueId = $request->bloque_id ?? $request->bloque_horario_id;
            
            $validator = Validator::make(array_merge($request->all(), ['bloque_id' => $bloqueId]), [
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'bloque_id' => 'required|uuid|exists:bloque_horario,id',
                'aula_id' => 'required|uuid|exists:aula,id',
                'excluir_id' => 'sometimes|uuid', // Para excluir un horario al editar
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $conflictos = [];

            // Verificar conflicto de aula (mismo bloque, misma aula)
            $conflictoAula = HorarioGrupo::where('bloque_id', $bloqueId)
                ->where('aula_id', $request->aula_id)
                ->when($request->filled('excluir_id'), function ($q) use ($request) {
                    $q->where('id', '!=', $request->excluir_id);
                })
                ->with(['grupo.materia'])
                ->first();

            if ($conflictoAula) {
                $conflictos[] = [
                    'tipo' => 'aula',
                    'mensaje' => 'El aula ya está ocupada en este horario',
                    'horario' => $conflictoAula
                ];
            }

            // Verificar conflicto de grupo (mismo bloque, mismo grupo)
            $conflictoGrupo = HorarioGrupo::where('bloque_id', $bloqueId)
                ->where('grupo_id', $request->grupo_id)
                ->when($request->filled('excluir_id'), function ($q) use ($request) {
                    $q->where('id', '!=', $request->excluir_id);
                })
                ->with(['aula.edificio'])
                ->first();

            if ($conflictoGrupo) {
                $conflictos[] = [
                    'tipo' => 'grupo',
                    'mensaje' => 'El grupo ya tiene un horario asignado en este bloque',
                    'horario' => $conflictoGrupo
                ];
            }

            return response()->json([
                'tiene_conflictos' => count($conflictos) > 0,
                'conflictos' => $conflictos
            ]);
        } catch (\Exception $e) {
            Log::error('Error al verificar conflictos', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al verificar conflictos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo horario de grupo
     * 
     * POST /api/horarios-grupo
     */
    public function store(Request $request)
    {
        try {
            // Normalizar bloque_id (aceptar tanto bloque_id como bloque_horario_id)
            $bloqueId = $request->bloque_id ?? $request->bloque_horario_id;
            
            // Validación
            $validator = Validator::make(array_merge($request->all(), ['bloque_id' => $bloqueId]), [
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'bloque_id' => 'required|uuid|exists:bloque_horario,id',
                'aula_id' => 'required|uuid|exists:aula,id',
                'tipo' => 'required|string|in:teorica,practica,laboratorio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Preparar datos para crear (usar bloque_id)
            $datosCrear = [
                'grupo_id' => $request->grupo_id,
                'bloque_id' => $bloqueId,
                'aula_id' => $request->aula_id,
                'tipo' => $request->tipo,
            ];

            // Verificar conflictos antes de crear
            $requestVerificacion = new Request($datosCrear);
            $verificacion = $this->verificarConflictos($requestVerificacion);
            $conflictos = json_decode($verificacion->content(), true);

            if ($conflictos['tiene_conflictos']) {
                return response()->json([
                    'message' => 'No se puede crear el horario debido a conflictos',
                    'conflictos' => $conflictos['conflictos']
                ], 422);
            }

            // Crear el horario de grupo
            $horario = HorarioGrupo::create($datosCrear);
            $horario->load(['grupo.materia', 'bloque', 'aula.edificio']);

            $this->logCrear('horario_grupo', $horario);

            return response()->json([
                'message' => 'Horario de grupo creado exitosamente',
                'data' => $horario
            ], 201);
        } catch (\Exception $e) {
            Log::error('Error al crear horario de grupo', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al crear el horario de grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un horario de grupo específico
     * 
     * GET /api/horarios-grupo/{id}
     */
    public function show($id)
    {
        try {
            $horario = HorarioGrupo::with([
                'grupo.materia',
                'grupo.gestion',
                'bloque',
                'aula.edificio'
            ])->findOrFail($id);
            
            $this->logConsultar('horario_grupo', 1);

            return response()->json($horario);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Horario de grupo no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar un horario de grupo
     * 
     * PUT /api/horarios-grupo/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $horario = HorarioGrupo::findOrFail($id);

            // Normalizar bloque_id (aceptar tanto bloque_id como bloque_horario_id)
            $bloqueId = $request->bloque_id ?? $request->bloque_horario_id ?? $horario->bloque_id;
            
            // Validación
            $validator = Validator::make(array_merge($request->all(), ['bloque_id' => $bloqueId]), [
                'grupo_id' => 'sometimes|uuid|exists:grupo,id',
                'bloque_id' => 'sometimes|uuid|exists:bloque_horario,id',
                'aula_id' => 'sometimes|uuid|exists:aula,id',
                'tipo' => 'sometimes|string|in:teorica,practica,laboratorio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Si se modifican campos críticos, verificar conflictos
            if ($request->hasAny(['grupo_id', 'bloque_id', 'bloque_horario_id', 'aula_id'])) {
                $requestConflictos = new Request([
                    'grupo_id' => $request->get('grupo_id', $horario->grupo_id),
                    'bloque_id' => $bloqueId,
                    'aula_id' => $request->get('aula_id', $horario->aula_id),
                    'excluir_id' => $id
                ]);

                $verificacion = $this->verificarConflictos($requestConflictos);
                $conflictos = json_decode($verificacion->content(), true);

                if ($conflictos['tiene_conflictos']) {
                    return response()->json([
                        'message' => 'No se puede actualizar el horario debido a conflictos',
                        'conflictos' => $conflictos['conflictos']
                    ], 422);
                }
            }

            $datosAnteriores = $horario->toArray();

            // Preparar datos para actualizar (usar bloque_id)
            $datosActualizar = [];
            if ($request->has('grupo_id')) $datosActualizar['grupo_id'] = $request->grupo_id;
            if ($bloqueId && ($request->has('bloque_id') || $request->has('bloque_horario_id'))) {
                $datosActualizar['bloque_id'] = $bloqueId;
            }
            if ($request->has('aula_id')) $datosActualizar['aula_id'] = $request->aula_id;
            if ($request->has('tipo')) $datosActualizar['tipo'] = $request->tipo;

            // Actualizar el horario de grupo
            $horario->update($datosActualizar);
            $horario->load(['grupo.materia', 'bloque', 'aula.edificio']);

            $this->logActualizar('horario_grupo', $horario->id);

            return response()->json([
                'message' => 'Horario de grupo actualizado exitosamente',
                'data' => $horario
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el horario de grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un horario de grupo
     * 
     * DELETE /api/horarios-grupo/{id}
     */
    public function destroy($id)
    {
        try {
            $horario = HorarioGrupo::findOrFail($id);

            $datosEliminados = $horario->toArray();
            $horario->delete();

            $this->logEliminar('horario_grupo', $id);

            return response()->json([
                'message' => 'Horario de grupo eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el horario de grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📤 Exportar horarios a Excel
     * GET /api/horarios-grupo/exportar?formato=excel
     */
    public function exportar(Request $request)
    {
        try {
            $formato = $request->input('formato', 'excel');
            
            $query = HorarioGrupo::with([
                'grupo.materia',
                'grupo.gestion',
                'bloque',
                'aula.edificio'
            ]);

            // Aplicar los mismos filtros que en index
            if ($request->filled('grupo_id')) {
                $query->where('grupo_id', $request->grupo_id);
            }

            if ($request->filled('aula_id')) {
                $query->where('aula_id', $request->aula_id);
            }

            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            $horarios = $query->join('bloque_horario', 'horario_grupo.bloque_id', '=', 'bloque_horario.id')
                ->select('horario_grupo.*')
                ->orderBy('bloque_horario.dia_semana', 'asc')
                ->orderBy('bloque_horario.hora_inicio', 'asc')
                ->get();

            $this->logActivity(
                'exportar',
                "Exportó listado de horarios en formato {$formato}",
                ['formato' => $formato, 'total' => $horarios->count()]
            );

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\HorariosExport($horarios),
                    'horarios-' . now()->setTimezone(config('app.timezone'))->format('Y-m-d') . '.xlsx'
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al exportar horarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📅 Obtener horarios por semana
     * 
     * GET /api/horarios-grupo/reportes/semanal?fecha=2024-01-15&grupo_id=xxx&aula_id=xxx&docente_id=xxx
     * 
     * Parámetros:
     * - fecha: Fecha de referencia para la semana (default: hoy)
     * - grupo_id: Filtrar por grupo
     * - aula_id: Filtrar por aula
     * - docente_id: Filtrar por docente (a través de cargas)
     */
    public function reporteSemanal(Request $request)
    {
        try {
            // Obtener fecha de referencia (default: hoy) - Asegurar timezone de Bolivia
            $fechaReferencia = $request->filled('fecha') 
                ? Carbon::parse($request->fecha)->setTimezone(config('app.timezone'))
                : Carbon::today(config('app.timezone'));
            
            // Calcular inicio y fin de semana (Lunes a Viernes) - En timezone de Bolivia
            $inicioSemana = $fechaReferencia->copy()->startOfWeek(Carbon::MONDAY)->setTimezone(config('app.timezone'));
            $finSemana = $fechaReferencia->copy()->endOfWeek(Carbon::FRIDAY)->setTimezone(config('app.timezone'));

            // Construir query base
            $query = HorarioGrupo::with([
                'grupo.materia',
                'grupo.gestion',
                'grupo.cargasDocentes.docente',
                'bloque',
                'aula.edificio'
            ]);

            // Si el usuario es docente, filtrar automáticamente por su docente_id
            $usuario = $request->user();
            $esDocente = $usuario && $usuario->docente;
            $esSuperAdmin = $usuario && $usuario->roles && $usuario->roles->contains(function($rol) {
                return in_array(strtolower($rol->nombre), ['superadmin', 'admin']);
            });

            if ($esDocente && !$esSuperAdmin) {
                // Docente solo ve sus propios horarios
                $query->whereHas('grupo.cargasDocentes', function($q) use ($usuario) {
                    $q->where('docente_id', $usuario->docente->id);
                });
            }

            // Filtros opcionales (solo si no es docente o si es admin)
            if ($request->filled('grupo_id') && (!$esDocente || $esSuperAdmin)) {
                $query->where('grupo_id', $request->grupo_id);
            }

            if ($request->filled('aula_id') && (!$esDocente || $esSuperAdmin)) {
                $query->where('aula_id', $request->aula_id);
            }

            if ($request->filled('docente_id') && (!$esDocente || $esSuperAdmin)) {
                $query->whereHas('grupo.cargasDocentes', function($q) use ($request) {
                    $q->where('docente_id', $request->docente_id);
                });
            }

            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Obtener horarios ordenados por día y hora
            $horarios = $query->join('bloque_horario', 'horario_grupo.bloque_id', '=', 'bloque_horario.id')
                ->select('horario_grupo.*')
                ->orderBy('bloque_horario.dia_semana', 'asc')
                ->orderBy('bloque_horario.hora_inicio', 'asc')
                ->get();

            // Obtener docentes de cada horario y formatear
            $horariosFormateados = $horarios->map(function($horario) {
                // Asegurar que siempre haya un array de docentes, incluso si está vacío
                $docentes = [];
                if ($horario->grupo && $horario->grupo->cargasDocentes) {
                    $docentes = $horario->grupo->cargasDocentes
                        ->map(function($carga) {
                            return [
                                'id' => $carga->docente->id ?? null,
                                'nombre' => $carga->docente->nombre ?? 'N/A',
                            ];
                        })
                        ->filter(function($docente) {
                            return $docente['id'] !== null;
                        })
                        ->unique(function($docente) {
                            return $docente['id'];
                        })
                        ->values()
                        ->toArray();
                }

                return [
                    'id' => $horario->id,
                    'grupo' => [
                        'id' => $horario->grupo->id ?? null,
                        'codigo' => $horario->grupo->codigo ?? 'N/A',
                        'materia' => [
                            'id' => $horario->grupo->materia->id ?? null,
                            'nombre' => $horario->grupo->materia->nombre ?? 'N/A',
                        ],
                    ],
                    'bloque' => [
                        'id' => $horario->bloque->id ?? null,
                        'dia_semana' => $horario->bloque->dia_semana ?? null,
                        'dia_nombre' => $this->getDiaNombre($horario->bloque->dia_semana ?? 0),
                        'hora_inicio' => $horario->bloque->hora_inicio ?? null,
                        'hora_fin' => $horario->bloque->hora_fin ?? null,
                    ],
                    'aula' => [
                        'id' => $horario->aula->id ?? null,
                        'codigo' => $horario->aula->codigo ?? 'N/A',
                        'edificio' => $horario->aula->edificio->nombre ?? 'N/A',
                    ],
                    'tipo' => $horario->tipo,
                    'docentes' => $docentes,
                ];
            });

            // Organizar horarios formateados por día de la semana
            $horariosPorDiaFormateados = [];
            for ($dia = 1; $dia <= 5; $dia++) { // Lunes (1) a Viernes (5)
                $horariosPorDiaFormateados[$dia] = $horariosFormateados->filter(function($horario) use ($dia) {
                    return isset($horario['bloque']['dia_semana']) && $horario['bloque']['dia_semana'] == $dia;
                })->values()->toArray();
            }

            $this->logConsultar('horario_grupo_reporte_semanal', $horarios->count());

            return response()->json([
                'semana' => [
                    'inicio' => $inicioSemana->format('Y-m-d'),
                    'fin' => $finSemana->format('Y-m-d'),
                    'fecha_referencia' => $fechaReferencia->format('Y-m-d'),
                ],
                'horarios' => $horariosFormateados->toArray(),
                'horarios_por_dia' => $horariosPorDiaFormateados,
                'total' => $horarios->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener reporte semanal',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📅 Obtener horarios por día
     * 
     * GET /api/horarios-grupo/reportes/diario?fecha=2024-01-15&grupo_id=xxx&aula_id=xxx&docente_id=xxx
     * 
     * Parámetros:
     * - fecha: Fecha del día (default: hoy)
     * - grupo_id: Filtrar por grupo
     * - aula_id: Filtrar por aula
     * - docente_id: Filtrar por docente
     */
    public function reporteDiario(Request $request)
    {
        try {
            // Obtener fecha (default: hoy) - Asegurar timezone de Bolivia
            $fecha = $request->filled('fecha') 
                ? Carbon::parse($request->fecha)->setTimezone(config('app.timezone'))
                : Carbon::today(config('app.timezone'));
            
            // Obtener día de la semana (1=Lunes, 7=Domingo) - En timezone de Bolivia
            $diaSemana = $fecha->dayOfWeekIso; // 1=Lunes, 7=Domingo

            // Construir query base
            $query = HorarioGrupo::with([
                'grupo.materia',
                'grupo.gestion',
                'grupo.cargasDocentes.docente',
                'bloque',
                'aula.edificio'
            ])->whereHas('bloque', function($q) use ($diaSemana) {
                $q->where('dia_semana', $diaSemana);
            });

            // Si el usuario es docente, filtrar automáticamente por su docente_id
            $usuario = $request->user();
            $esDocente = $usuario && $usuario->docente;
            $esSuperAdmin = $usuario && $usuario->roles && $usuario->roles->contains(function($rol) {
                return in_array(strtolower($rol->nombre), ['superadmin', 'admin']);
            });

            if ($esDocente && !$esSuperAdmin) {
                // Docente solo ve sus propios horarios
                $query->whereHas('grupo.cargasDocentes', function($q) use ($usuario) {
                    $q->where('docente_id', $usuario->docente->id);
                });
            }

            // Filtros opcionales (solo si no es docente o si es admin)
            if ($request->filled('grupo_id') && (!$esDocente || $esSuperAdmin)) {
                $query->where('grupo_id', $request->grupo_id);
            }

            if ($request->filled('aula_id') && (!$esDocente || $esSuperAdmin)) {
                $query->where('aula_id', $request->aula_id);
            }

            if ($request->filled('docente_id') && (!$esDocente || $esSuperAdmin)) {
                $query->whereHas('grupo.cargasDocentes', function($q) use ($request) {
                    $q->where('docente_id', $request->docente_id);
                });
            }

            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Obtener horarios ordenados por hora
            $horarios = $query->join('bloque_horario', 'horario_grupo.bloque_id', '=', 'bloque_horario.id')
                ->select('horario_grupo.*')
                ->orderBy('bloque_horario.hora_inicio', 'asc')
                ->get();

            // Formatear horarios
            $horariosFormateados = $horarios->map(function($horario) {
                // Asegurar que siempre haya un array de docentes, incluso si está vacío
                $docentes = [];
                if ($horario->grupo && $horario->grupo->cargasDocentes) {
                    $docentes = $horario->grupo->cargasDocentes
                        ->map(function($carga) {
                            return [
                                'id' => $carga->docente->id ?? null,
                                'nombre' => $carga->docente->nombre ?? 'N/A',
                            ];
                        })
                        ->filter(function($docente) {
                            return $docente['id'] !== null;
                        })
                        ->unique(function($docente) {
                            return $docente['id'];
                        })
                        ->values()
                        ->toArray();
                }

                return [
                    'id' => $horario->id,
                    'grupo' => [
                        'id' => $horario->grupo->id ?? null,
                        'codigo' => $horario->grupo->codigo ?? 'N/A',
                        'materia' => [
                            'id' => $horario->grupo->materia->id ?? null,
                            'nombre' => $horario->grupo->materia->nombre ?? 'N/A',
                        ],
                    ],
                    'bloque' => [
                        'id' => $horario->bloque->id ?? null,
                        'dia_semana' => $horario->bloque->dia_semana ?? null,
                        'dia_nombre' => $this->getDiaNombre($horario->bloque->dia_semana ?? 0),
                        'hora_inicio' => $horario->bloque->hora_inicio ?? null,
                        'hora_fin' => $horario->bloque->hora_fin ?? null,
                    ],
                    'aula' => [
                        'id' => $horario->aula->id ?? null,
                        'codigo' => $horario->aula->codigo ?? 'N/A',
                        'edificio' => $horario->aula->edificio->nombre ?? 'N/A',
                    ],
                    'tipo' => $horario->tipo,
                    'docentes' => $docentes,
                ];
            });

            $this->logConsultar('horario_grupo_reporte_diario', $horarios->count());

            return response()->json([
                'fecha' => $fecha->format('Y-m-d'),
                'dia_semana' => $diaSemana,
                'dia_nombre' => $this->getDiaNombre($diaSemana),
                'horarios' => $horariosFormateados,
                'total' => $horarios->count(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener reporte diario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Helper: Obtener nombre del día
     */
    private function getDiaNombre(int $dia): string
    {
        $dias = [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo',
        ];
        return $dias[$dia] ?? 'N/A';
    }
}
