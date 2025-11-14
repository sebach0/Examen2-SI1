<?php

namespace App\Http\Controllers\Api\Academico;

use App\Domain\Academico\Models\Gestion;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class GestionController extends Controller
{
    use LogsActivity;

    /**
     * Listar gestiones con búsqueda y filtros
     * 
     * GET /api/gestiones?search=2024&periodo=1&sort=año&perPage=15
     */
    public function index(Request $request)
    {
        try {
            $query = Gestion::query();

            // Búsqueda por año o código
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('anio', 'ILIKE', "%{$search}%")
                      ->orWhere('codigo', 'ILIKE', "%{$search}%");
                });
            }

            // Filtro por periodo
            if ($request->filled('periodo')) {
                $query->where('periodo', $request->periodo);
            }

            // Filtro por año
            if ($request->filled('anio')) {
                $query->where('anio', $request->anio);
            }

            // Ordenamiento
            $sortField = $request->get('sort', 'anio');
            $sortDirection = $request->get('direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Si solicita periodo también ordena por eso
            if ($sortField !== 'periodo') {
                $query->orderBy('periodo', 'desc');
            }

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $gestiones = $query->get();
                $this->logConsultar('gestion', $gestiones->count());
                return response()->json($gestiones);
            }

            $perPage = $request->get('perPage', 15);
            $gestiones = $query->paginate($perPage);

            $this->logConsultar('gestion', $gestiones->total());

            return response()->json($gestiones);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las gestiones',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener la gestión académica activa
     * 
     * GET /api/gestiones/activa
     */
    public function activa()
    {
        try {
            // Obtener la gestión activa basada en fechas (fecha actual entre inicio y fin)
            $gestionActiva = Gestion::actual()->first();

            if (!$gestionActiva) {
                return response()->json([
                    'message' => 'No hay gestión académica activa'
                ], 404);
            }

            return response()->json($gestionActiva);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener la gestión activa',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva gestión
     * 
     * POST /api/gestiones
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'anio' => 'required|integer|min:2000|max:2100',
                'periodo' => 'required|string|max:20|in:Primer Semestre,Segundo Semestre,Anual,Verano',
                'codigo' => [
                    'required',
                    'string',
                    'max:20',
                    Rule::unique('gestion', 'codigo')
                ],
                'fecha_inicio' => 'required|date',
                'fecha_fin' => 'required|date|after:fecha_inicio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear la gestión (solo campos permitidos)
            $gestion = Gestion::create([
                'anio' => $request->anio,
                'periodo' => $request->periodo,
                'codigo' => $request->codigo,
                'fecha_inicio' => $request->fecha_inicio,
                'fecha_fin' => $request->fecha_fin,
            ]);

            $this->logCrear('gestion', $gestion);

            return response()->json([
                'message' => 'Gestión creada exitosamente',
                'data' => $gestion
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la gestión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una gestión específica
     * 
     * GET /api/gestiones/{id}
     */
    public function show($id)
    {
        try {
            $gestion = Gestion::findOrFail($id);
            
            $this->logConsultar('gestion', 1);

            return response()->json($gestion);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gestión no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar una gestión
     * 
     * PUT /api/gestiones/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $gestion = Gestion::findOrFail($id);

            // Validación
            $validator = Validator::make($request->all(), [
                'anio' => 'sometimes|integer|min:2000|max:2100',
                'periodo' => 'sometimes|string|max:20|in:Primer Semestre,Segundo Semestre,Anual,Verano',
                'codigo' => [
                    'sometimes',
                    'string',
                    'max:20',
                    Rule::unique('gestion', 'codigo')->ignore($gestion->id)
                ],
                'fecha_inicio' => 'sometimes|date',
                'fecha_fin' => 'sometimes|date|after:fecha_inicio',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $datosAnteriores = $gestion->toArray();

            // Actualizar solo los campos permitidos
            $gestion->update([
                'anio' => $request->input('anio', $gestion->anio),
                'periodo' => $request->input('periodo', $gestion->periodo),
                'codigo' => $request->input('codigo', $gestion->codigo),
                'fecha_inicio' => $request->input('fecha_inicio', $gestion->fecha_inicio),
                'fecha_fin' => $request->input('fecha_fin', $gestion->fecha_fin),
            ]);

            $this->logActualizar('gestion', $gestion->id);

            return response()->json([
                'message' => 'Gestión actualizada exitosamente',
                'data' => $gestion
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la gestión',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una gestión
     * 
     * DELETE /api/gestiones/{id}
     */
    public function destroy($id)
    {
        try {
            $gestion = Gestion::findOrFail($id);

            // Verificar si hay grupos asociados
            if ($gestion->grupos()->count() > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar la gestión porque tiene grupos asociados'
                ], 422);
            }

            $datosEliminados = $gestion->toArray();
            $gestion->delete();

            $this->logEliminar('gestion', $id);

            return response()->json([
                'message' => 'Gestión eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la gestión',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
