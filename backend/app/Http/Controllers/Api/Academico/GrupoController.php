<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Controller;
use App\Domain\Academico\Models\Grupo;
use App\Domain\Academico\Models\Materia;
use App\Domain\Academico\Models\Gestion;
use App\Domain\Shared\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * 👥 CONTROLADOR DE GRUPOS
 * =========================
 * Gestiona el CRUD de grupos/paralelos académicos
 */
class GrupoController extends Controller
{
    use LogsActivity;

    /**
     * 📋 Listar grupos con filtros
     * GET /api/grupos
     */
    public function index(Request $request)
    {
        try {
            $query = Grupo::query()->with([
                'materia:id,codigo,nombre,carrera_id',
                'materia.carrera:id,nombre,codigo',
                'gestion:id,codigo,anio,periodo'
            ]);

            // Filtro por búsqueda (código del grupo o nombre de materia)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('codigo', 'ilike', "%{$search}%")
                      ->orWhereHas('materia', function ($mq) use ($search) {
                          $mq->where('nombre', 'ilike', "%{$search}%")
                             ->orWhere('codigo', 'ilike', "%{$search}%");
                      });
                });
            }

            // Filtro por gestión
            if ($request->filled('gestion_id')) {
                $query->where('gestion_id', $request->gestion_id);
            }

            // Filtro por materia
            if ($request->filled('materia_id')) {
                $query->where('materia_id', $request->materia_id);
            }

            // Filtro por carrera (a través de materia)
            if ($request->filled('carrera_id')) {
                $query->whereHas('materia', function ($q) use ($request) {
                    $q->where('carrera_id', $request->carrera_id);
                });
            }

            // Ordenamiento
            $sortBy = $request->get('sortBy', 'codigo');
            $sortOrder = $request->get('sortOrder', 'asc');
            
            if ($sortBy === 'materia') {
                $query->join('materia', 'grupo.materia_id', '=', 'materia.id')
                      ->orderBy('materia.nombre', $sortOrder)
                      ->select('grupo.*');
            } else {
                $query->orderBy($sortBy, $sortOrder);
            }

            // Paginación o todos
            if ($request->get('all') === 'true') {
                $grupos = $query->get();
                $this->logConsultar('grupo', $grupos->count());
                return response()->json($grupos);
            }

            $perPage = $request->get('perPage', 15);
            $grupos = $query->paginate($perPage);
            
            $this->logConsultar('grupo', $grupos->total());

            return response()->json($grupos);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener grupos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ➕ Crear un nuevo grupo
     * POST /api/grupos
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'materia_id' => 'required|uuid|exists:materia,id',
                'gestion_id' => 'required|uuid|exists:gestion,id',
                'codigo' => 'required|string|max:10',
                'capacidad' => 'required|integer|min:1|max:200',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar que no exista ya un grupo con el mismo código para esa materia/gestión
            $exists = Grupo::where('materia_id', $request->materia_id)
                           ->where('gestion_id', $request->gestion_id)
                           ->where('codigo', strtoupper($request->codigo))
                           ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Ya existe un grupo con ese código para esta materia y gestión'
                ], 422);
            }

            DB::beginTransaction();

            // Crear grupo
            $grupo = Grupo::create([
                'materia_id' => $request->materia_id,
                'gestion_id' => $request->gestion_id,
                'codigo' => strtoupper($request->codigo),
                'capacidad' => $request->capacidad,
            ]);

            // Cargar relaciones para la respuesta
            $grupo->load(['materia.carrera', 'gestion']);

            DB::commit();
            $this->logCrear('grupo', $grupo);

            return response()->json([
                'message' => 'Grupo creado exitosamente',
                'data' => $grupo
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 👁️ Mostrar un grupo específico
     * GET /api/grupos/{id}
     */
    public function show(string $id)
    {
        try {
            $grupo = Grupo::with([
                'materia:id,codigo,nombre,creditos,horas_semanales,carrera_id',
                'materia.carrera:id,nombre,codigo',
                'gestion:id,codigo,anio,periodo,fecha_inicio,fecha_fin',
                'cargasDocentes:id,grupo_id,docente_id,horas_asignadas',
                'cargasDocentes.docente:id,nombre,ci',
                'horarios:id,grupo_id,bloque_id,aula_id,tipo',
                'horarios.bloque:id,dia_semana,hora_inicio,hora_fin',
                'horarios.aula:id,nombre,codigo,capacidad'
            ])->findOrFail($id);
            
            $this->logConsultar('grupo', 1);

            return response()->json($grupo);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Grupo no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✏️ Actualizar un grupo
     * PUT/PATCH /api/grupos/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $grupo = Grupo::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'materia_id' => 'required|uuid|exists:materia,id',
                'gestion_id' => 'required|uuid|exists:gestion,id',
                'codigo' => 'required|string|max:10',
                'capacidad' => 'required|integer|min:1|max:200',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar unicidad del código (excluyendo el grupo actual)
            $exists = Grupo::where('materia_id', $request->materia_id)
                           ->where('gestion_id', $request->gestion_id)
                           ->where('codigo', strtoupper($request->codigo))
                           ->where('id', '!=', $id)
                           ->exists();

            if ($exists) {
                return response()->json([
                    'message' => 'Ya existe otro grupo con ese código para esta materia y gestión'
                ], 422);
            }

            DB::beginTransaction();

            // Actualizar grupo
            $grupo->update([
                'materia_id' => $request->materia_id,
                'gestion_id' => $request->gestion_id,
                'codigo' => strtoupper($request->codigo),
                'capacidad' => $request->capacidad,
            ]);

            // Cargar relaciones para la respuesta
            $grupo->load(['materia.carrera', 'gestion']);

            DB::commit();
            $this->logActualizar('grupo', $grupo);

            return response()->json([
                'message' => 'Grupo actualizado exitosamente',
                'data' => $grupo
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Grupo no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🗑️ Eliminar un grupo
     * DELETE /api/grupos/{id}
     */
    public function destroy(string $id)
    {
        try {
            $grupo = Grupo::with(['cargasDocentes', 'asistencias', 'horarios'])->findOrFail($id);

            // Validar que no tenga cargas docentes asignadas
            if ($grupo->cargasDocentes()->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar el grupo porque tiene docentes asignados'
                ], 409);
            }

            // Validar que no tenga asistencias registradas
            if ($grupo->asistencias()->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar el grupo porque tiene asistencias registradas'
                ], 409);
            }

            DB::beginTransaction();

            // Eliminar horarios asociados
            $grupo->horarios()->delete();

            // Eliminar grupo
            $grupoData = $grupo->toArray();
            $grupo->delete();

            DB::commit();
            $this->logEliminar('grupo', $grupoData);

            return response()->json([
                'message' => 'Grupo eliminado exitosamente'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Grupo no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📊 Obtener estadísticas de grupos
     * GET /api/grupos/estadisticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_grupos' => Grupo::count(),
                'por_gestion' => Grupo::selectRaw('gestion_id, COUNT(*) as total')
                    ->with('gestion:id,codigo')
                    ->groupBy('gestion_id')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'gestion' => $item->gestion->codigo,
                            'total' => $item->total
                        ];
                    }),
                'capacidad_promedio' => round(Grupo::avg('capacidad'), 0),
                'capacidad_total' => Grupo::sum('capacidad'),
                'con_docentes' => Grupo::has('cargasDocentes')->count(),
                'sin_docentes' => Grupo::doesntHave('cargasDocentes')->count(),
            ];

            $this->logConsultar('grupo_estadisticas', 1);

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📚 Obtener todas las gestiones para selects
     * GET /api/grupos/gestiones
     */
    public function gestiones()
    {
        try {
            $gestiones = Gestion::select('id', 'codigo', 'anio', 'periodo')
                ->orderBy('anio', 'desc')
                ->orderBy('periodo', 'desc')
                ->get();

            return response()->json($gestiones);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener gestiones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📤 Exportar grupos a Excel
     * GET /api/grupos/exportar?formato=excel
     */
    public function exportar(Request $request)
    {
        try {
            $formato = $request->input('formato', 'excel');
            
            $query = Grupo::query()->with([
                'materia.carrera',
                'gestion'
            ]);

            // Aplicar los mismos filtros que en index
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('codigo', 'ilike', "%{$search}%")
                      ->orWhereHas('materia', function ($mq) use ($search) {
                          $mq->where('nombre', 'ilike', "%{$search}%")
                             ->orWhere('codigo', 'ilike', "%{$search}%");
                      });
                });
            }

            if ($request->filled('gestion_id')) {
                $query->where('gestion_id', $request->gestion_id);
            }

            if ($request->filled('materia_id')) {
                $query->where('materia_id', $request->materia_id);
            }

            if ($request->filled('carrera_id')) {
                $query->whereHas('materia', function ($q) use ($request) {
                    $q->where('carrera_id', $request->carrera_id);
                });
            }

            $grupos = $query->orderBy('codigo', 'asc')->get();

            $this->logActivity(
                'exportar',
                "Exportó listado de grupos en formato {$formato}",
                ['formato' => $formato, 'total' => $grupos->count()]
            );

            return \Maatwebsite\Excel\Facades\Excel::download(
                new \App\Exports\GruposExport($grupos),
                'grupos-' . now()->setTimezone(config('app.timezone'))->format('Y-m-d') . '.xlsx'
            );
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al exportar grupos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
