<?php

namespace App\Http\Controllers\Api\TiempoHorarios;

use App\Domain\TiempoHorarios\Models\BloqueHorario;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class BloqueHorarioController extends Controller
{
    use LogsActivity;

    /**
     * Listar bloques horarios con filtros y ordenamiento
     * 
     * GET /api/bloques?dia_semana=1&sort=dia_semana&perPage=15
     */
    public function index(Request $request)
    {
        try {
            $query = BloqueHorario::query();

            // Filtro por día de la semana
            if ($request->filled('dia_semana')) {
                $query->where('dia_semana', $request->dia_semana);
            }

            // Búsqueda por hora
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->whereRaw("hora_inicio::text LIKE ?", ["%{$search}%"])
                      ->orWhereRaw("hora_fin::text LIKE ?", ["%{$search}%"]);
                });
            }

            // Ordenamiento por defecto: día y hora inicio
            $sortField = $request->get('sort', 'dia_semana');
            $sortDirection = $request->get('direction', 'asc');
            
            if ($sortField === 'dia_semana') {
                $query->orderBy('dia_semana', $sortDirection)
                      ->orderBy('hora_inicio', 'asc');
            } else {
                $query->orderBy($sortField, $sortDirection);
            }

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $bloques = $query->get();
                return response()->json($bloques);
            }

            $perPage = $request->get('perPage', 15);
            $bloques = $query->paginate($perPage);

            $this->logConsultar('bloque_horario', $bloques->total());

            return response()->json($bloques);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los bloques horarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo bloque horario
     * 
     * POST /api/bloques
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'dia_semana' => 'required|integer|min:1|max:7',
                'hora_inicio' => [
                    'required',
                    'date_format:H:i',
                ],
                'hora_fin' => [
                    'required',
                    'date_format:H:i',
                    'after:hora_inicio'
                ],
            ], [
                'dia_semana.required' => 'El día de la semana es obligatorio',
                'dia_semana.min' => 'El día debe estar entre 1 (Lunes) y 7 (Domingo)',
                'dia_semana.max' => 'El día debe estar entre 1 (Lunes) y 7 (Domingo)',
                'hora_inicio.required' => 'La hora de inicio es obligatoria',
                'hora_inicio.date_format' => 'La hora de inicio debe tener formato HH:MM',
                'hora_fin.required' => 'La hora de fin es obligatoria',
                'hora_fin.date_format' => 'La hora de fin debe tener formato HH:MM',
                'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar que no exista el mismo bloque
            $existe = BloqueHorario::where('dia_semana', $request->dia_semana)
                ->where('hora_inicio', $request->hora_inicio)
                ->where('hora_fin', $request->hora_fin)
                ->exists();

            if ($existe) {
                return response()->json([
                    'message' => 'Ya existe un bloque horario con el mismo día y horario'
                ], 422);
            }

            // Validar solapamiento de horarios en el mismo día
            $solapamiento = BloqueHorario::where('dia_semana', $request->dia_semana)
                ->where(function ($query) use ($request) {
                    // El nuevo bloque empieza durante un bloque existente
                    $query->where(function ($q) use ($request) {
                        $q->where('hora_inicio', '<=', $request->hora_inicio)
                          ->where('hora_fin', '>', $request->hora_inicio);
                    })
                    // El nuevo bloque termina durante un bloque existente
                    ->orWhere(function ($q) use ($request) {
                        $q->where('hora_inicio', '<', $request->hora_fin)
                          ->where('hora_fin', '>=', $request->hora_fin);
                    })
                    // El nuevo bloque contiene completamente un bloque existente
                    ->orWhere(function ($q) use ($request) {
                        $q->where('hora_inicio', '>=', $request->hora_inicio)
                          ->where('hora_fin', '<=', $request->hora_fin);
                    });
                })
                ->exists();

            if ($solapamiento) {
                return response()->json([
                    'message' => 'El horario se solapa con otro bloque existente en el mismo día'
                ], 422);
            }

            DB::beginTransaction();

            $bloque = BloqueHorario::create([
                'dia_semana' => $request->dia_semana,
                'hora_inicio' => $request->hora_inicio,
                'hora_fin' => $request->hora_fin,
            ]);

            $this->logCrear('bloque_horario', $bloque);

            DB::commit();

            return response()->json([
                'message' => 'Bloque horario creado exitosamente',
                'data' => $bloque
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el bloque horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar bloque horario específico
     * 
     * GET /api/bloques/{id}
     */
    public function show(string $id)
    {
        try {
            $bloque = BloqueHorario::with(['horariosGrupo.grupo.materia', 'horariosGrupo.aula'])
                ->findOrFail($id);

            $this->logConsultar('bloque_horario');

            return response()->json($bloque);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Bloque horario no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el bloque horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar bloque horario
     * 
     * PUT /api/bloques/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $bloque = BloqueHorario::findOrFail($id);

            // Validación
            $validator = Validator::make($request->all(), [
                'dia_semana' => 'required|integer|min:1|max:7',
                'hora_inicio' => [
                    'required',
                    'date_format:H:i',
                ],
                'hora_fin' => [
                    'required',
                    'date_format:H:i',
                    'after:hora_inicio'
                ],
            ], [
                'dia_semana.required' => 'El día de la semana es obligatorio',
                'dia_semana.min' => 'El día debe estar entre 1 (Lunes) y 7 (Domingo)',
                'dia_semana.max' => 'El día debe estar entre 1 (Lunes) y 7 (Domingo)',
                'hora_inicio.required' => 'La hora de inicio es obligatoria',
                'hora_inicio.date_format' => 'La hora de inicio debe tener formato HH:MM',
                'hora_fin.required' => 'La hora de fin es obligatoria',
                'hora_fin.date_format' => 'La hora de fin debe tener formato HH:MM',
                'hora_fin.after' => 'La hora de fin debe ser posterior a la hora de inicio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar que no exista otro bloque con los mismos datos (excluyendo el actual)
            $existe = BloqueHorario::where('dia_semana', $request->dia_semana)
                ->where('hora_inicio', $request->hora_inicio)
                ->where('hora_fin', $request->hora_fin)
                ->where('id', '!=', $id)
                ->exists();

            if ($existe) {
                return response()->json([
                    'message' => 'Ya existe otro bloque horario con el mismo día y horario'
                ], 422);
            }

            // Validar solapamiento (excluyendo el bloque actual)
            $solapamiento = BloqueHorario::where('dia_semana', $request->dia_semana)
                ->where('id', '!=', $id)
                ->where(function ($query) use ($request) {
                    $query->where(function ($q) use ($request) {
                        $q->where('hora_inicio', '<=', $request->hora_inicio)
                          ->where('hora_fin', '>', $request->hora_inicio);
                    })
                    ->orWhere(function ($q) use ($request) {
                        $q->where('hora_inicio', '<', $request->hora_fin)
                          ->where('hora_fin', '>=', $request->hora_fin);
                    })
                    ->orWhere(function ($q) use ($request) {
                        $q->where('hora_inicio', '>=', $request->hora_inicio)
                          ->where('hora_fin', '<=', $request->hora_fin);
                    });
                })
                ->exists();

            if ($solapamiento) {
                return response()->json([
                    'message' => 'El horario se solapa con otro bloque existente en el mismo día'
                ], 422);
            }

            DB::beginTransaction();

            $bloque->update([
                'dia_semana' => $request->dia_semana,
                'hora_inicio' => $request->hora_inicio,
                'hora_fin' => $request->hora_fin,
            ]);

            $this->logActualizar('bloque_horario', $bloque->id);

            DB::commit();

            return response()->json([
                'message' => 'Bloque horario actualizado exitosamente',
                'data' => $bloque
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Bloque horario no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el bloque horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar bloque horario
     * 
     * DELETE /api/bloques/{id}
     */
    public function destroy(string $id)
    {
        try {
            $bloque = BloqueHorario::findOrFail($id);

            // Verificar si tiene horarios de grupo asignados
            $cantidadHorarios = $bloque->horariosGrupo()->count();
            if ($cantidadHorarios > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el bloque porque tiene {$cantidadHorarios} horario(s) de grupo asignado(s). Debe eliminar o reasignar los horarios primero."
                ], 409);
            }

            // Verificar si tiene asistencias registradas
            $cantidadAsistencias = $bloque->asistencias()->count();
            if ($cantidadAsistencias > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el bloque porque tiene {$cantidadAsistencias} asistencia(s) registrada(s)."
                ], 409);
            }

            DB::beginTransaction();

            $descripcion = $bloque->descripcion_completa;
            $bloque->delete();

            $this->logEliminar('bloque_horario', $id);

            DB::commit();

            return response()->json([
                'message' => 'Bloque horario eliminado exitosamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Bloque horario no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el bloque horario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de bloques horarios
     * 
     * GET /api/bloques/estadisticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_bloques' => BloqueHorario::count(),
                'por_dia' => BloqueHorario::select('dia_semana', DB::raw('COUNT(*) as cantidad'))
                    ->groupBy('dia_semana')
                    ->orderBy('dia_semana')
                    ->get()
                    ->map(function ($item) {
                        $dias = [
                            1 => 'Lunes',
                            2 => 'Martes',
                            3 => 'Miércoles',
                            4 => 'Jueves',
                            5 => 'Viernes',
                            6 => 'Sábado',
                            7 => 'Domingo',
                        ];
                        return [
                            'dia' => $dias[$item->dia_semana] ?? 'Desconocido',
                            'cantidad' => $item->cantidad
                        ];
                    }),
                'con_horarios' => BloqueHorario::has('horariosGrupo')->count(),
                'sin_horarios' => BloqueHorario::doesntHave('horariosGrupo')->count(),
                'duracion_promedio' => round(
                    BloqueHorario::all()->avg(function ($bloque) {
                        return $bloque->duracion_minutos;
                    }), 
                    2
                ),
            ];

            $this->logConsultar('bloque_horario');

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener días de la semana (helper para selects)
     * 
     * GET /api/bloques/dias
     */
    public function dias()
    {
        try {
            $dias = [
                ['value' => 1, 'label' => 'Lunes'],
                ['value' => 2, 'label' => 'Martes'],
                ['value' => 3, 'label' => 'Miércoles'],
                ['value' => 4, 'label' => 'Jueves'],
                ['value' => 5, 'label' => 'Viernes'],
                ['value' => 6, 'label' => 'Sábado'],
                ['value' => 7, 'label' => 'Domingo'],
            ];
            return response()->json($dias);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener días',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
