<?php

namespace App\Http\Controllers\Api\Infraestructura;

use App\Domain\Infraestructura\Models\Edificio;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class EdificioController extends Controller
{
    use LogsActivity;

    /**
     * Listar edificios con búsqueda y filtros
     * 
     * GET /api/edificios?search=Facultad&sort=nombre&perPage=15
     */
    public function index(Request $request)
    {
        try {
            $query = Edificio::withCount('aulas');

            // Búsqueda por nombre
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('nombre', 'ILIKE', "%{$search}%");
            }

            // Ordenamiento
            $sortField = $request->get('sort', 'nombre');
            $sortDirection = $request->get('direction', 'asc');
            $query->orderBy($sortField, $sortDirection);

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $edificios = $query->get();
                $this->logConsultar('edificio', $edificios->count());
                return response()->json($edificios);
            }

            $perPage = $request->get('perPage', 15);
            $edificios = $query->paginate($perPage);

            $this->logConsultar('edificio', $edificios->total());

            return response()->json($edificios);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener los edificios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nuevo edificio
     * 
     * POST /api/edificios
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'nombre' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('edificio', 'nombre')
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Crear el edificio
            $edificio = Edificio::create($request->all());

            $this->logCrear('edificio', $edificio);

            return response()->json([
                'message' => 'Edificio creado exitosamente',
                'data' => $edificio
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el edificio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar un edificio específico
     * 
     * GET /api/edificios/{id}
     */
    public function show($id)
    {
        try {
            $edificio = Edificio::withCount('aulas')->findOrFail($id);
            
            $this->logConsultar('edificio', 1);

            return response()->json($edificio);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Edificio no encontrado',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar un edificio
     * 
     * PUT /api/edificios/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $edificio = Edificio::findOrFail($id);

            // Validación
            $validator = Validator::make($request->all(), [
                'nombre' => [
                    'sometimes',
                    'string',
                    'max:100',
                    Rule::unique('edificio', 'nombre')->ignore($edificio->id)
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $datosAnteriores = $edificio->toArray();

            // Actualizar el edificio
            $edificio->update($request->all());

            $this->logActualizar('edificio', $edificio->id);

            return response()->json([
                'message' => 'Edificio actualizado exitosamente',
                'data' => $edificio
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el edificio',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar un edificio
     * 
     * DELETE /api/edificios/{id}
     */
    public function destroy($id)
    {
        try {
            $edificio = Edificio::findOrFail($id);

            // Verificar si hay aulas asociadas
            if ($edificio->aulas()->count() > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar el edificio porque tiene aulas asociadas'
                ], 422);
            }

            $datosEliminados = $edificio->toArray();
            $edificio->delete();

            $this->logEliminar('edificio', $id);

            return response()->json([
                'message' => 'Edificio eliminado exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el edificio',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
