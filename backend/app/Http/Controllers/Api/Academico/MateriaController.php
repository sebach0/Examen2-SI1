<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Controller;
use App\Domain\Academico\Models\Materia;
use App\Domain\Academico\Models\Carrera;
use App\Domain\Shared\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * 📚 CONTROLADOR DE MATERIAS
 * ==========================
 * Gestiona el CRUD de materias académicas con sus pre-requisitos
 */
class MateriaController extends Controller
{
    use LogsActivity;

    /**
     * 📋 Listar materias con filtros
     * GET /api/materias
     */
    public function index(Request $request)
    {
        try {
            $query = Materia::query()->with(['carrera:id,nombre,codigo', 'requisitos:id,codigo,nombre']);

            // Filtro por búsqueda (código o nombre)
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('codigo', 'ilike', "%{$search}%")
                      ->orWhere('nombre', 'ilike', "%{$search}%");
                });
            }

            // Filtro por carrera
            if ($request->filled('carrera_id')) {
                $query->where('carrera_id', $request->carrera_id);
            }

            // Ordenamiento
            $sortBy = $request->get('sortBy', 'codigo');
            $sortOrder = $request->get('sortOrder', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación o todos
            if ($request->get('all') === 'true') {
                $materias = $query->get();
                $this->logConsultar('materia', $materias->count());
                return response()->json($materias);
            }

            $perPage = $request->get('perPage', 15);
            $materias = $query->paginate($perPage);
            
            $this->logConsultar('materia', $materias->total());

            return response()->json($materias);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener materias',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ➕ Crear una nueva materia
     * POST /api/materias
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'carrera_id' => 'required|uuid|exists:carrera,id',
                'codigo' => 'required|string|max:20|unique:materia,codigo',
                'nombre' => 'required|string|max:150',
                'horas_semanales' => 'required|integer|min:1|max:40',
                'creditos' => 'required|integer|min:1|max:20',
                'requisito_ids' => 'nullable|array',
                'requisito_ids.*' => 'uuid|exists:materia,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            // 1. Crear materia
            $materia = Materia::create([
                'carrera_id' => $request->carrera_id,
                'codigo' => strtoupper($request->codigo),
                'nombre' => $request->nombre,
                'horas_semanales' => $request->horas_semanales,
                'creditos' => $request->creditos,
            ]);

            // 2. Asignar pre-requisitos si existen
            if ($request->filled('requisito_ids')) {
                $materia->requisitos()->sync($request->requisito_ids);
            }

            // Cargar relaciones para la respuesta
            $materia->load(['carrera', 'requisitos']);

            DB::commit();
            $this->logCrear('materia', $materia);

            return response()->json([
                'message' => 'Materia creada exitosamente',
                'data' => $materia
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear la materia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 👁️ Mostrar una materia específica
     * GET /api/materias/{id}
     */
    public function show(string $id)
    {
        try {
            $materia = Materia::with([
                'carrera:id,nombre,codigo',
                'requisitos:id,codigo,nombre,creditos',
                'esRequisitoDe:id,codigo,nombre',
                'grupos:id,nombre,cupo'
            ])->findOrFail($id);
            
            $this->logConsultar('materia', 1);

            return response()->json($materia);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Materia no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la materia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✏️ Actualizar una materia
     * PUT/PATCH /api/materias/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $materia = Materia::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'carrera_id' => 'required|uuid|exists:carrera,id',
                'codigo' => [
                    'required',
                    'string',
                    'max:20',
                    Rule::unique('materia', 'codigo')->ignore($materia->id)
                ],
                'nombre' => 'required|string|max:150',
                'horas_semanales' => 'required|integer|min:1|max:40',
                'creditos' => 'required|integer|min:1|max:20',
                'requisito_ids' => 'nullable|array',
                'requisito_ids.*' => 'uuid|exists:materia,id',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Validar que no se incluya a sí misma como requisito
            if ($request->filled('requisito_ids') && in_array($id, $request->requisito_ids)) {
                return response()->json([
                    'message' => 'Una materia no puede ser requisito de sí misma'
                ], 422);
            }

            DB::beginTransaction();

            // Actualizar materia
            $materia->update([
                'carrera_id' => $request->carrera_id,
                'codigo' => strtoupper($request->codigo),
                'nombre' => $request->nombre,
                'horas_semanales' => $request->horas_semanales,
                'creditos' => $request->creditos,
            ]);

            // Actualizar pre-requisitos
            if ($request->has('requisito_ids')) {
                $materia->requisitos()->sync($request->requisito_ids ?? []);
            }

            // Cargar relaciones para la respuesta
            $materia->load(['carrera', 'requisitos']);

            DB::commit();
            $this->logActualizar('materia', $materia);

            return response()->json([
                'message' => 'Materia actualizada exitosamente',
                'data' => $materia
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Materia no encontrada'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar la materia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🗑️ Eliminar una materia
     * DELETE /api/materias/{id}
     */
    public function destroy(string $id)
    {
        try {
            $materia = Materia::with(['grupos', 'esRequisitoDe'])->findOrFail($id);

            // Validar que no tenga grupos asociados
            if ($materia->grupos()->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar la materia porque tiene grupos asociados'
                ], 409);
            }

            // Validar que no sea requisito de otras materias
            if ($materia->esRequisitoDe()->exists()) {
                return response()->json([
                    'message' => 'No se puede eliminar la materia porque es requisito de otras materias'
                ], 409);
            }

            DB::beginTransaction();

            // Eliminar relaciones de requisitos
            $materia->requisitos()->detach();

            // Eliminar materia
            $materiaData = $materia->toArray();
            $materia->delete();

            DB::commit();
            $this->logEliminar('materia', $materiaData);

            return response()->json([
                'message' => 'Materia eliminada exitosamente'
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Materia no encontrada'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar la materia',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📊 Obtener estadísticas de materias
     * GET /api/materias/estadisticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_materias' => Materia::count(),
                'por_carrera' => Materia::selectRaw('carrera_id, COUNT(*) as total')
                    ->with('carrera:id,nombre')
                    ->groupBy('carrera_id')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'carrera' => $item->carrera->nombre,
                            'total' => $item->total
                        ];
                    }),
                'con_requisitos' => Materia::has('requisitos')->count(),
                'sin_requisitos' => Materia::doesntHave('requisitos')->count(),
                'promedio_creditos' => round(Materia::avg('creditos'), 2),
                'promedio_horas' => round(Materia::avg('horas_semanales'), 2),
            ];

            $this->logConsultar('materia_estadisticas', 1);

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📚 Obtener todas las carreras para selects
     * GET /api/materias/carreras
     */
    public function carreras()
    {
        try {
            $carreras = Carrera::select('id', 'nombre', 'codigo')
                ->orderBy('nombre')
                ->get();

            return response()->json($carreras);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener carreras',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
