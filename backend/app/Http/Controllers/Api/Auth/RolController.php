<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Domain\Auth\Models\Rol;
use App\Domain\Shared\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

/**
 * 🎭 CONTROLADOR DE ROLES
 * ========================
 * Maneja el CRUD completo de roles y asignación de permisos
 */
class RolController extends Controller
{
    use LogsActivity;

    /**
     * 📋 Listar todos los roles
     * GET /api/roles
     */
    public function index(Request $request)
    {
        try {
            $query = Rol::query()->with('permisos:id,codigo,descripcion');

            // Búsqueda por nombre
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'ilike', "%{$search}%")
                      ->orWhere('descripcion', 'ilike', "%{$search}%");
                });
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'nombre');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            
            if ($request->has('all') && $request->all === 'true') {
                // Retornar todos sin paginar (para selects)
                $roles = $query->get();
                $this->logConsultar('roles', $roles->count());
                return response()->json($roles);
            }

            $roles = $query->paginate($perPage);
            $this->logConsultar('roles', $roles->total());

            return response()->json($roles);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🆕 Crear un nuevo rol
     * POST /api/roles
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50|unique:rol,nombre',
            'descripcion' => 'nullable|string|max:255',
            'permisos' => 'nullable|array',
            'permisos.*' => 'exists:permiso,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rol = Rol::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
            ]);

            // Asignar permisos si se proporcionaron
            if ($request->has('permisos')) {
                $rol->permisos()->sync($request->permisos);
            }

            // Cargar relación para la respuesta
            $rol->load('permisos:id,codigo,descripcion');

            $this->logCrear('rol', $rol);

            return response()->json([
                'message' => 'Rol creado exitosamente',
                'data' => $rol
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 👁️ Mostrar un rol específico
     * GET /api/roles/{id}
     */
    public function show(string $id)
    {
        try {
            $rol = Rol::with('permisos:id,codigo,descripcion')->findOrFail($id);
            
            $this->logConsultar('rol', 1);

            return response()->json($rol);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Rol no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✏️ Actualizar un rol
     * PUT/PATCH /api/roles/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $rol = Rol::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'nombre' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('rol', 'nombre')->ignore($rol->id)
                ],
                'descripcion' => 'nullable|string|max:255',
                'permisos' => 'nullable|array',
                'permisos.*' => 'exists:permiso,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            $rol->update([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
            ]);

            // Actualizar permisos
            if ($request->has('permisos')) {
                $rol->permisos()->sync($request->permisos);
            }

            $rol->load('permisos:id,codigo,descripcion');

            $this->logActualizar('rol', $rol->id);

            return response()->json([
                'message' => 'Rol actualizado exitosamente',
                'data' => $rol
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Rol no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🗑️ Eliminar un rol
     * DELETE /api/roles/{id}
     */
    public function destroy(string $id)
    {
        try {
            $rol = Rol::findOrFail($id);

            // Verificar si hay usuarios con este rol
            $usuariosCount = $rol->usuarios()->count();
            if ($usuariosCount > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el rol porque tiene {$usuariosCount} usuario(s) asignado(s)",
                    'usuarios_count' => $usuariosCount
                ], 409); // 409 Conflict
            }

            $rolNombre = $rol->nombre;
            $rol->delete();

            $this->logEliminar('rol', $id);

            return response()->json([
                'message' => "Rol '{$rolNombre}' eliminado exitosamente"
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Rol no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el rol',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔗 Asignar permisos a un rol
     * POST /api/roles/{id}/permisos
     */
    public function assignPermisos(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'permisos' => 'required|array',
            'permisos.*' => 'exists:permiso,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $rol = Rol::findOrFail($id);
            $rol->permisos()->sync($request->permisos);
            $rol->load('permisos:id,codigo,descripcion');

            $this->logActivity(
                'ACTUALIZAR',
                "Asignó " . count($request->permisos) . " permisos al rol '{$rol->nombre}'"
            );

            return response()->json([
                'message' => 'Permisos asignados exitosamente',
                'data' => $rol
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Rol no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al asignar permisos',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
