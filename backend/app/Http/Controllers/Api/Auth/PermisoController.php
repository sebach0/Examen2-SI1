<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Domain\Auth\Models\Permiso;
use App\Domain\Shared\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * 🔐 CONTROLADOR DE PERMISOS
 * ===========================
 * Maneja el CRUD completo de permisos del sistema
 */
class PermisoController extends Controller
{
    use LogsActivity;

    /**
     * 📋 Listar todos los permisos
     * GET /api/permisos
     */
    public function index(Request $request)
    {
        try {
            $query = Permiso::query()->with('roles:id,nombre');

            // Búsqueda
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('codigo', 'ilike', "%{$search}%")
                      ->orWhere('descripcion', 'ilike', "%{$search}%");
                });
            }

            // Filtro por módulo
            if ($request->has('modulo')) {
                $query->porModulo($request->modulo);
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'codigo');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación o retornar todos
            $perPage = $request->get('per_page', 15);
            
            if ($request->has('all') && $request->all === 'true') {
                $permisos = $query->get();
                $this->logConsultar('permisos', $permisos->count());
                return response()->json($permisos);
            }

            $permisos = $query->paginate($perPage);
            $this->logConsultar('permisos', $permisos->total());

            return response()->json($permisos);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener permisos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🆕 Crear un nuevo permiso
     * POST /api/permisos
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'codigo' => 'required|string|max:100|unique:permiso,codigo',
            'descripcion' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $permiso = Permiso::create([
                'codigo' => $request->codigo,
                'descripcion' => $request->descripcion,
            ]);

            $this->logCrear('permiso', $permiso);

            return response()->json([
                'message' => 'Permiso creado exitosamente',
                'data' => $permiso
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 👁️ Mostrar un permiso específico
     * GET /api/permisos/{id}
     */
    public function show(string $id)
    {
        try {
            $permiso = Permiso::with('roles:id,nombre,descripcion')->findOrFail($id);
            
            $this->logConsultar('permiso', 1);

            return response()->json($permiso);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Permiso no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✏️ Actualizar un permiso
     * PUT/PATCH /api/permisos/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $permiso = Permiso::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'codigo' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::unique('permiso', 'codigo')->ignore($permiso->id)
                ],
                'descripcion' => 'required|string|max:255',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $permiso->update([
                'codigo' => $request->codigo,
                'descripcion' => $request->descripcion,
            ]);

            $this->logActualizar('permiso', $permiso->id);

            return response()->json([
                'message' => 'Permiso actualizado exitosamente',
                'data' => $permiso
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Permiso no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🗑️ Eliminar un permiso
     * DELETE /api/permisos/{id}
     */
    public function destroy(string $id)
    {
        try {
            $permiso = Permiso::findOrFail($id);

            // Verificar si hay roles con este permiso
            $rolesCount = $permiso->roles()->count();
            if ($rolesCount > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el permiso porque está asignado a {$rolesCount} rol(es)",
                    'roles_count' => $rolesCount
                ], 409);
            }

            $permisoCodigo = $permiso->codigo;
            $permiso->delete();

            $this->logEliminar('permiso', $id);

            return response()->json([
                'message' => "Permiso '{$permisoCodigo}' eliminado exitosamente"
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Permiso no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el permiso',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📊 Obtener permisos agrupados por módulo
     * GET /api/permisos/grouped
     */
    public function grouped()
    {
        try {
            $permisos = Permiso::orderBy('codigo')->get();

            // Agrupar por módulo (primera parte del código antes del punto)
            $grouped = $permisos->groupBy(function($permiso) {
                $parts = explode('.', $permiso->codigo);
                return $parts[0] ?? 'otros';
            });

            $this->logConsultar('permisos agrupados', $permisos->count());

            return response()->json($grouped);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener permisos agrupados',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
