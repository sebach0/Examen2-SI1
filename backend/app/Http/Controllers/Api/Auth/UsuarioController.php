<?php

namespace App\Http\Controllers\Api\Auth;

use App\Domain\Auth\Models\Usuario;
use App\Domain\Auth\Models\Rol;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

/**
 * 📋 CONTROLADOR DE USUARIOS
 * ===========================
 * Gestión completa del CRUD de usuarios del sistema
 * Incluye asignación de roles y gestión de estados
 */
class UsuarioController extends Controller
{
    use LogsActivity;

    /**
     * 📄 GET /api/usuarios
     * Lista todos los usuarios con filtros y paginación
     * 
     * Query params opcionales:
     * - page: número de página
     * - perPage: resultados por página (default: 15)
     * - search: buscar por username o email
     * - estado: filtrar por estado (activo|suspendido)
     * - rol_id: filtrar por rol
     * - sort: campo para ordenar (default: username)
     * - direction: dirección del orden (asc|desc, default: asc)
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('perPage', 15);
            $search = $request->input('search', '');
            $estado = $request->input('estado', '');
            $rolId = $request->input('rol_id', '');
            $sort = $request->input('sort', 'username');
            $direction = $request->input('direction', 'asc');

            // Query base con roles eager loaded
            $query = Usuario::with(['roles']);

            // Filtro de búsqueda
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('username', 'ilike', "%{$search}%")
                      ->orWhere('email', 'ilike', "%{$search}%");
                });
            }

            // Filtro por estado
            if ($estado) {
                $query->where('estado', $estado);
            }

            // Filtro por rol
            if ($rolId) {
                $query->whereHas('roles', function ($q) use ($rolId) {
                    $q->where('rol.id', $rolId);
                });
            }

            // Ordenamiento
            $allowedSorts = ['username', 'email', 'estado', 'creado_en'];
            if (in_array($sort, $allowedSorts)) {
                $query->orderBy($sort, $direction);
            }

            // Paginación
            $usuarios = $query->paginate($perPage);

            // Log de la acción
            $this->logActivity(
                'usuarios.listar',
                'Listó usuarios',
                ['filtros' => $request->only(['search', 'estado', 'rol_id', 'page'])]
            );

            return response()->json($usuarios);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener usuarios',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📄 GET /api/usuarios/{id}
     * Obtener detalle de un usuario específico
     */
    public function show(string $id)
    {
        try {
            $usuario = Usuario::with([
                'roles.permisos',
                'docente'
            ])->findOrFail($id);

            $this->logActivity(
                'usuarios.ver',
                "Vio detalles del usuario: {$usuario->username}",
                ['usuario_id' => $id]
            );

            return response()->json($usuario);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ POST /api/usuarios
     * Crear un nuevo usuario
     * 
     * Body esperado:
     * {
     *   "username": "string (50 chars max, único)",
     *   "email": "string (120 chars max, único)",
     *   "password": "string (min 6 chars)",
     *   "estado": "activo|suspendido (opcional, default: activo)",
     *   "roles": ["uuid1", "uuid2"] (opcional)
     * }
     */
    public function store(Request $request)
    {
        try {
            // Validaciones
            $validated = $request->validate([
                'username' => [
                    'required',
                    'string',
                    'max:50',
                    'unique:usuario,username',
                    'regex:/^[a-zA-Z0-9_-]+$/' // Solo letras, números, guiones
                ],
                'email' => [
                    'required',
                    'email',
                    'max:120',
                    'unique:usuario,email'
                ],
                'password' => [
                    'required',
                    'string',
                    'min:6'
                ],
                'estado' => [
                    'nullable',
                    'in:activo,suspendido'
                ],
                'roles' => [
                    'nullable',
                    'array'
                ],
                'roles.*' => [
                    'exists:rol,id'
                ]
            ], [
                'username.required' => 'El nombre de usuario es requerido',
                'username.unique' => 'Este nombre de usuario ya está en uso',
                'username.regex' => 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos',
                'email.required' => 'El correo electrónico es requerido',
                'email.email' => 'Debe ser un correo electrónico válido',
                'email.unique' => 'Este correo electrónico ya está registrado',
                'password.required' => 'La contraseña es requerida',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres',
                'roles.*.exists' => 'Uno o más roles seleccionados no existen'
            ]);

            DB::beginTransaction();

            // Crear usuario
            $usuario = Usuario::create([
                'username' => $validated['username'],
                'email' => $validated['email'],
                'password_hash' => Hash::make($validated['password']),
                'estado' => $validated['estado'] ?? 'activo',
            ]);

            // Asignar roles si se proporcionaron
            if (!empty($validated['roles'])) {
                $usuario->roles()->attach($validated['roles']);
            }

            DB::commit();

            // Log de la acción
            $this->logActivity(
                'usuarios.crear',
                "Creó el usuario: {$usuario->username}",
                [
                    'usuario_id' => $usuario->id,
                    'username' => $usuario->username,
                    'roles' => $validated['roles'] ?? []
                ]
            );

            // Retornar con roles cargados
            return response()->json(
                $usuario->load('roles'),
                201
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✏️ PUT /api/usuarios/{id}
     * Actualizar un usuario existente
     * 
     * Body esperado:
     * {
     *   "username": "string (50 chars max, único)",
     *   "email": "string (120 chars max, único)",
     *   "password": "string (opcional, min 6 chars)",
     *   "estado": "activo|suspendido",
     *   "roles": ["uuid1", "uuid2"] (opcional)
     * }
     */
    public function update(Request $request, string $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);

            // Validaciones
            $validated = $request->validate([
                'username' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('usuario', 'username')->ignore($usuario->id),
                    'regex:/^[a-zA-Z0-9_-]+$/'
                ],
                'email' => [
                    'required',
                    'email',
                    'max:120',
                    Rule::unique('usuario', 'email')->ignore($usuario->id)
                ],
                'password' => [
                    'nullable',
                    'string',
                    'min:6'
                ],
                'estado' => [
                    'required',
                    'in:activo,suspendido'
                ],
                'roles' => [
                    'nullable',
                    'array'
                ],
                'roles.*' => [
                    'exists:rol,id'
                ]
            ], [
                'username.required' => 'El nombre de usuario es requerido',
                'username.unique' => 'Este nombre de usuario ya está en uso',
                'username.regex' => 'El nombre de usuario solo puede contener letras, números, guiones y guiones bajos',
                'email.required' => 'El correo electrónico es requerido',
                'email.email' => 'Debe ser un correo electrónico válido',
                'email.unique' => 'Este correo electrónico ya está registrado',
                'password.min' => 'La contraseña debe tener al menos 6 caracteres',
                'estado.required' => 'El estado es requerido',
                'roles.*.exists' => 'Uno o más roles seleccionados no existen'
            ]);

            DB::beginTransaction();

            // Actualizar datos del usuario
            $usuario->username = $validated['username'];
            $usuario->email = $validated['email'];
            $usuario->estado = $validated['estado'];

            // Actualizar contraseña solo si se proporcionó
            if (!empty($validated['password'])) {
                $usuario->password_hash = Hash::make($validated['password']);
            }

            $usuario->save();

            // Sincronizar roles (reemplaza los existentes)
            if (isset($validated['roles'])) {
                $usuario->roles()->sync($validated['roles']);
            }

            DB::commit();

            // Log de la acción
            $this->logActivity(
                'usuarios.actualizar',
                "Actualizó el usuario: {$usuario->username}",
                [
                    'usuario_id' => $usuario->id,
                    'cambios' => $request->only(['username', 'email', 'estado']),
                    'roles_actualizados' => isset($validated['roles'])
                ]
            );

            return response()->json(
                $usuario->load('roles')
            );
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al actualizar el usuario',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🗑️ DELETE /api/usuarios/{id}
     * Eliminar un usuario
     * 
     * Validaciones:
     * - No se puede eliminar si es el único admin
     * - No se puede eliminar si tiene un perfil docente activo
     * - No se puede eliminar el propio usuario autenticado
     */
    public function destroy(string $id)
    {
        try {
            $usuario = Usuario::with(['roles', 'docente'])->findOrFail($id);

            // Validar que no sea el usuario autenticado
            if (auth('sanctum')->id() === $usuario->id) {
                return response()->json([
                    'message' => 'No puedes eliminar tu propia cuenta'
                ], 409);
            }

            // Validar que no sea el único admin
            $esAdmin = $usuario->roles->contains(function ($rol) {
                return strtolower($rol->nombre) === 'admin';
            });

            if ($esAdmin) {
                $totalAdmins = Usuario::whereHas('roles', function ($q) {
                    $q->where('nombre', 'ilike', 'admin');
                })->count();

                if ($totalAdmins <= 1) {
                    return response()->json([
                        'message' => 'No se puede eliminar el único administrador del sistema'
                    ], 409);
                }
            }

            // Validar que no tenga un perfil docente
            if ($usuario->docente) {
                return response()->json([
                    'message' => 'No se puede eliminar un usuario que tiene un perfil de docente asociado. Elimina primero el docente.'
                ], 409);
            }

            DB::beginTransaction();

            // Guardar información para el log ANTES de eliminar
            $usuarioUsername = $usuario->username;
            $usuarioEmail = $usuario->email;

            // Log de la acción ANTES de eliminar el usuario
            $this->logActivity(
                'USUARIOS.ELIMINAR',
                "Eliminó el usuario: {$usuarioUsername} ({$usuarioEmail})",
                [
                    'usuario_eliminado_id' => $id,
                    'username' => $usuarioUsername,
                    'email' => $usuarioEmail,
                    'roles' => $usuario->roles->pluck('nombre')->toArray()
                ]
            );

            // Eliminar relaciones de roles
            $usuario->roles()->detach();

            // Eliminar el usuario (la FK onDelete('set null') en bitacora manejará la referencia)
            $usuario->delete();

            DB::commit();

            return response()->json([
                'message' => 'Usuario eliminado exitosamente'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al eliminar el usuario',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    /**
     * 📊 GET /api/usuarios/estadisticas
     * Obtener estadísticas de usuarios
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_usuarios' => Usuario::count(),
                'por_estado' => Usuario::select('estado', DB::raw('count(*) as cantidad'))
                    ->groupBy('estado')
                    ->get()
                    ->map(function ($item) {
                        return [
                            'estado' => $item->estado,
                            'cantidad' => $item->cantidad
                        ];
                    }),
                'por_rol' => Rol::withCount('usuarios')
                    ->get()
                    ->map(function ($rol) {
                        return [
                            'rol' => $rol->nombre,
                            'cantidad' => $rol->usuarios_count
                        ];
                    }),
                'recientes' => Usuario::orderBy('creado_en', 'desc')
                    ->take(5)
                    ->get(['id', 'username', 'email', 'creado_en'])
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🔄 POST /api/usuarios/{id}/cambiar-estado
     * Cambiar el estado de un usuario (activo/suspendido)
     */
    public function cambiarEstado(Request $request, string $id)
    {
        try {
            $usuario = Usuario::findOrFail($id);

            $validated = $request->validate([
                'estado' => 'required|in:activo,suspendido'
            ]);

            // Validar que no se suspenda al único admin
            if ($validated['estado'] === 'suspendido') {
                $esAdmin = $usuario->roles->contains(function ($rol) {
                    return strtolower($rol->nombre) === 'admin';
                });

                if ($esAdmin) {
                    $totalAdminsActivos = Usuario::activo()
                        ->whereHas('roles', function ($q) {
                            $q->where('nombre', 'ilike', 'admin');
                        })->count();

                    if ($totalAdminsActivos <= 1) {
                        return response()->json([
                            'message' => 'No se puede suspender el único administrador activo'
                        ], 409);
                    }
                }
            }

            $estadoAnterior = $usuario->estado;
            $usuario->estado = $validated['estado'];
            $usuario->save();

            $this->logActivity(
                'usuarios.cambiar_estado',
                "Cambió el estado del usuario {$usuario->username} de '{$estadoAnterior}' a '{$validated['estado']}'",
                [
                    'usuario_id' => $id,
                    'estado_anterior' => $estadoAnterior,
                    'estado_nuevo' => $validated['estado']
                ]
            );

            return response()->json([
                'message' => 'Estado actualizado exitosamente',
                'usuario' => $usuario
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Usuario no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al cambiar el estado',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
