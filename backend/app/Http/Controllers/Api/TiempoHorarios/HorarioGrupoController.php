<?php

namespace App\Http\Controllers\Api\TiempoHorarios;

use App\Domain\TiempoHorarios\Models\HorarioGrupo;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

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
                ->join('bloque_horario', 'horario_grupo.bloque_horario_id', '=', 'bloque_horario.id')
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
                ->join('bloque_horario', 'horario_grupo.bloque_horario_id', '=', 'bloque_horario.id')
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
            $validator = Validator::make($request->all(), [
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'bloque_horario_id' => 'required|uuid|exists:bloque_horario,id',
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

            // Usar bloque_id para las queries (nombre real de la columna)
            $bloqueId = $request->bloque_horario_id;

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
            // Validación
            $validator = Validator::make($request->all(), [
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'bloque_horario_id' => 'required|uuid|exists:bloque_horario,id',
                'aula_id' => 'required|uuid|exists:aula,id',
                'tipo' => 'required|string|in:teorica,practica,laboratorio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar conflictos antes de crear
            $verificacion = $this->verificarConflictos($request);
            $conflictos = json_decode($verificacion->content(), true);

            if ($conflictos['tiene_conflictos']) {
                return response()->json([
                    'message' => 'No se puede crear el horario debido a conflictos',
                    'conflictos' => $conflictos['conflictos']
                ], 422);
            }

            // Crear el horario de grupo - convertir bloque_horario_id a bloque_id
            $data = $request->all();
            $data['bloque_id'] = $data['bloque_horario_id'];
            unset($data['bloque_horario_id']);
            
            $horario = HorarioGrupo::create($data);
            $horario->load(['grupo.materia', 'bloque', 'aula.edificio']);

            $this->logCrear('horario_grupo', $horario);

            return response()->json([
                'message' => 'Horario de grupo creado exitosamente',
                'data' => $horario
            ], 201);
        } catch (\Exception $e) {
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

            // Validación
            $validator = Validator::make($request->all(), [
                'grupo_id' => 'sometimes|uuid|exists:grupo,id',
                'bloque_horario_id' => 'sometimes|uuid|exists:bloque_horario,id',
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
            if ($request->hasAny(['grupo_id', 'bloque_horario_id', 'aula_id'])) {
                $requestConflictos = new Request([
                    'grupo_id' => $request->get('grupo_id', $horario->grupo_id),
                    'bloque_horario_id' => $request->get('bloque_horario_id', $horario->bloque_id),
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

            // Actualizar el horario de grupo - convertir bloque_horario_id a bloque_id si viene
            $data = $request->all();
            if (isset($data['bloque_horario_id'])) {
                $data['bloque_id'] = $data['bloque_horario_id'];
                unset($data['bloque_horario_id']);
            }
            
            $horario->update($data);
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
}
