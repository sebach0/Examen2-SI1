<?php

namespace App\Http\Controllers\Api\Infraestructura;

use App\Domain\Infraestructura\Models\Aula;
use App\Domain\Infraestructura\Models\Edificio;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AulaController extends Controller
{
    use LogsActivity;

    /**
     * Listar aulas con búsqueda, filtros y paginación
     * 
     * GET /api/aulas?search=101&edificio_id=xxx&tipo=laboratorio&sort=codigo&perPage=15
     */
    public function index(Request $request)
    {
        try {
            $query = Aula::with('edificio');

            // Búsqueda por código o nombre
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('codigo', 'ILIKE', "%{$search}%")
                      ->orWhere('nombre', 'ILIKE', "%{$search}%");
                });
            }

            // Filtro por edificio
            if ($request->filled('edificio_id')) {
                $query->where('edificio_id', $request->edificio_id);
            }

            // Filtro por tipo
            if ($request->filled('tipo')) {
                $query->where('tipo', $request->tipo);
            }

            // Filtro por capacidad mínima
            if ($request->filled('capacidad_min')) {
                $query->where('capacidad', '>=', $request->capacidad_min);
            }

            // Ordenamiento
            $sortField = $request->get('sort', 'codigo');
            $sortDirection = $request->get('direction', 'asc');
            
            // Permitir ordenar por edificio
            if ($sortField === 'edificio') {
                $query->join('edificio', 'aula.edificio_id', '=', 'edificio.id')
                      ->select('aula.*')
                      ->orderBy('edificio.nombre', $sortDirection)
                      ->orderBy('aula.codigo', 'asc');
            } else {
                $query->orderBy($sortField, $sortDirection);
            }

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $aulas = $query->get();
                return response()->json($aulas);
            }

            $perPage = $request->get('perPage', 15);
            $aulas = $query->paginate($perPage);

            $this->logConsultar('aula', $aulas->total());

            return response()->json($aulas);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las aulas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva aula
     * 
     * POST /api/aulas
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'edificio_id' => 'required|uuid|exists:edificio,id',
                'codigo' => [
                    'required',
                    'string',
                    'max:20',
                    // Código único por edificio
                    Rule::unique('aula')->where(function ($query) use ($request) {
                        return $query->where('edificio_id', $request->edificio_id);
                    })
                ],
                'nombre' => 'required|string|max:80',
                'tipo' => [
                    'required',
                    'string',
                    'max:30',
                    Rule::in(['aula', 'laboratorio', 'auditorio', 'sala de cómputo', 'otro'])
                ],
                'capacidad' => 'required|integer|min:1|max:500',
            ], [
                'edificio_id.required' => 'El edificio es obligatorio',
                'edificio_id.exists' => 'El edificio seleccionado no existe',
                'codigo.required' => 'El código del aula es obligatorio',
                'codigo.unique' => 'Ya existe un aula con este código en el edificio seleccionado',
                'nombre.required' => 'El nombre del aula es obligatorio',
                'tipo.required' => 'El tipo de aula es obligatorio',
                'tipo.in' => 'El tipo debe ser: aula, laboratorio, auditorio, sala de cómputo u otro',
                'capacidad.required' => 'La capacidad es obligatoria',
                'capacidad.min' => 'La capacidad mínima es 1',
                'capacidad.max' => 'La capacidad máxima es 500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $aula = Aula::create([
                'edificio_id' => $request->edificio_id,
                'codigo' => strtoupper(trim($request->codigo)),
                'nombre' => trim($request->nombre),
                'tipo' => $request->tipo,
                'capacidad' => $request->capacidad,
            ]);

            // Cargar relación
            $aula->load('edificio');

            $this->logCrear('aula', $aula);

            DB::commit();

            return response()->json([
                'message' => 'Aula creada exitosamente',
                'data' => $aula
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el aula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar aula específica
     * 
     * GET /api/aulas/{id}
     */
    public function show(string $id)
    {
        try {
            $aula = Aula::with(['edificio', 'horarios.grupo.materia'])
                ->findOrFail($id);

            $this->logConsultar('aula', "Consulta del aula {$aula->codigo}");

            return response()->json($aula);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aula no encontrada'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el aula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Actualizar aula
     * 
     * PUT /api/aulas/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $aula = Aula::findOrFail($id);

            // Validación
            $validator = Validator::make($request->all(), [
                'edificio_id' => 'required|uuid|exists:edificio,id',
                'codigo' => [
                    'required',
                    'string',
                    'max:20',
                    // Código único por edificio, excluyendo el aula actual
                    Rule::unique('aula')->where(function ($query) use ($request) {
                        return $query->where('edificio_id', $request->edificio_id);
                    })->ignore($id)
                ],
                'nombre' => 'required|string|max:80',
                'tipo' => [
                    'required',
                    'string',
                    'max:30',
                    Rule::in(['aula', 'laboratorio', 'auditorio', 'sala de cómputo', 'otro'])
                ],
                'capacidad' => 'required|integer|min:1|max:500',
            ], [
                'edificio_id.required' => 'El edificio es obligatorio',
                'edificio_id.exists' => 'El edificio seleccionado no existe',
                'codigo.required' => 'El código del aula es obligatorio',
                'codigo.unique' => 'Ya existe un aula con este código en el edificio seleccionado',
                'nombre.required' => 'El nombre del aula es obligatorio',
                'tipo.required' => 'El tipo de aula es obligatorio',
                'tipo.in' => 'El tipo debe ser: aula, laboratorio, auditorio, sala de cómputo u otro',
                'capacidad.required' => 'La capacidad es obligatoria',
                'capacidad.min' => 'La capacidad mínima es 1',
                'capacidad.max' => 'La capacidad máxima es 500',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();

            $aula->update([
                'edificio_id' => $request->edificio_id,
                'codigo' => strtoupper(trim($request->codigo)),
                'nombre' => trim($request->nombre),
                'tipo' => $request->tipo,
                'capacidad' => $request->capacidad,
            ]);

            // Recargar relación
            $aula->load('edificio');

            $this->logActualizar('aula', $aula->id);

            DB::commit();

            return response()->json([
                'message' => 'Aula actualizada exitosamente',
                'data' => $aula
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aula no encontrada'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el aula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar aula
     * 
     * DELETE /api/aulas/{id}
     */
    public function destroy(string $id)
    {
        try {
            $aula = Aula::findOrFail($id);

            // Verificar si tiene horarios asignados
            $cantidadHorarios = $aula->horarios()->count();
            if ($cantidadHorarios > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el aula porque tiene {$cantidadHorarios} horario(s) asignado(s). Debe eliminar o reasignar los horarios primero."
                ], 409);
            }

            DB::beginTransaction();

            $codigo = $aula->codigo;
            $edificioNombre = $aula->edificio->nombre;

            $aula->delete();

            $this->logEliminar('aula', $id);

            DB::commit();

            return response()->json([
                'message' => 'Aula eliminada exitosamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Aula no encontrada'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el aula',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener estadísticas de aulas
     * 
     * GET /api/aulas/estadisticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_aulas' => Aula::count(),
                'por_tipo' => Aula::select('tipo', DB::raw('COUNT(*) as cantidad'))
                    ->groupBy('tipo')
                    ->orderBy('cantidad', 'desc')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'tipo' => $item->tipo,
                            'cantidad' => $item->cantidad
                        ];
                    }),
                'por_edificio' => Aula::select('edificio.nombre as edificio', DB::raw('COUNT(*) as cantidad'))
                    ->join('edificio', 'aula.edificio_id', '=', 'edificio.id')
                    ->groupBy('edificio.id', 'edificio.nombre')
                    ->orderBy('cantidad', 'desc')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'edificio' => $item->edificio,
                            'cantidad' => $item->cantidad
                        ];
                    }),
                'capacidad_total' => Aula::sum('capacidad'),
                'capacidad_promedio' => round(Aula::avg('capacidad'), 2),
                'con_horarios' => Aula::has('horarios')->count(),
                'sin_horarios' => Aula::doesntHave('horarios')->count(),
            ];

            $this->logConsultar('aula');

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener lista de edificios (helper para selects)
     * 
     * GET /api/aulas/edificios
     */
    public function edificios()
    {
        try {
            $edificios = Edificio::orderBy('nombre', 'asc')->get();
            return response()->json($edificios);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener edificios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener tipos de aula disponibles (helper para selects)
     * 
     * GET /api/aulas/tipos
     */
    public function tipos()
    {
        try {
            $tipos = [
                ['value' => 'aula', 'label' => 'Aula'],
                ['value' => 'laboratorio', 'label' => 'Laboratorio'],
                ['value' => 'auditorio', 'label' => 'Auditorio'],
                ['value' => 'sala de cómputo', 'label' => 'Sala de Cómputo'],
                ['value' => 'otro', 'label' => 'Otro'],
            ];
            return response()->json($tipos);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener tipos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
