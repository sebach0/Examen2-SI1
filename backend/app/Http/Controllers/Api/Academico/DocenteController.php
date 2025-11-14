<?php

namespace App\Http\Controllers\Api\Academico;

use App\Http\Controllers\Controller;
use App\Domain\Academico\Models\Docente;
use App\Domain\Auth\Models\Usuario;
use App\Domain\Shared\Traits\LogsActivity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

/**
 * 👨‍🏫 CONTROLADOR DE DOCENTES
 * ============================
 * Maneja el CRUD completo de docentes y su relación con usuarios
 */
class DocenteController extends Controller
{
    use LogsActivity;

    /**
     * 📋 Listar todos los docentes
     * GET /api/docentes
     */
    public function index(Request $request)
    {
        try {
            $query = Docente::query()->with('usuario:id,username,email,estado');

            // Búsqueda por nombre, CI o email
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'ilike', "%{$search}%")
                      ->orWhere('ci', 'ilike', "%{$search}%")
                      ->orWhere('telefono', 'ilike', "%{$search}%")
                      ->orWhereHas('usuario', function($uq) use ($search) {
                          $uq->where('email', 'ilike', "%{$search}%")
                             ->orWhere('username', 'ilike', "%{$search}%");
                      });
                });
            }

            // Filtro por estado del usuario
            if ($request->has('estado')) {
                $query->whereHas('usuario', function($uq) use ($request) {
                    $uq->where('estado', $request->estado);
                });
            }

            // Ordenamiento
            $sortBy = $request->get('sort_by', 'nombre');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);

            // Paginación
            $perPage = $request->get('per_page', 15);
            
            if ($request->has('all') && $request->all === 'true') {
                $docentes = $query->get();
                $this->logConsultar('docentes', $docentes->count());
                return response()->json($docentes);
            }

            $docentes = $query->paginate($perPage);
            $this->logConsultar('docentes', $docentes->total());

            return response()->json($docentes);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener docentes',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🆕 Crear un nuevo docente (con usuario asociado)
     * POST /api/docentes
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ci' => 'required|string|max:20|unique:docente,ci',
            'nombre' => 'required|string|max:100',
            'telefono' => 'nullable|string|max:30',
            'username' => 'required|string|max:50|unique:usuario,username',
            'email' => 'required|email|max:120|unique:usuario,email',
            'password' => 'required|string|min:6',
            'rol_ids' => 'nullable|array',
            'rol_ids.*' => 'exists:rol,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Errores de validación',
                'errors' => $validator->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 1. Crear usuario
            $usuario = Usuario::create([
                'username' => $request->username,
                'email' => $request->email,
                'password_hash' => Hash::make($request->password),
                'estado' => 'activo',
            ]);

            // 2. Asignar roles (por defecto "docente" si no se especifica)
            if ($request->has('rol_ids')) {
                $usuario->roles()->sync($request->rol_ids);
            } else {
                // Buscar el rol "docente" y asignarlo por defecto
                $rolDocente = \App\Domain\Auth\Models\Rol::where('nombre', 'docente')->first();
                if ($rolDocente) {
                    $usuario->roles()->attach($rolDocente->id);
                }
            }

            // 3. Crear docente
            $docente = Docente::create([
                'usuario_id' => $usuario->id,
                'ci' => $request->ci,
                'nombre' => $request->nombre,
                'telefono' => $request->telefono,
            ]);

            // Cargar relaciones para la respuesta
            $docente->load('usuario.roles');

            DB::commit();
            $this->logCrear('docente', $docente);

            return response()->json([
                'message' => 'Docente creado exitosamente',
                'data' => $docente
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error al crear el docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 👁️ Mostrar un docente específico
     * GET /api/docentes/{id}
     */
    public function show(string $id)
    {
        try {
            // Cargar docente con relaciones básicas
            $docente = Docente::with([
                'usuario:id,username,email,estado',
                'usuario.roles:id,nombre',
            ])->findOrFail($id);
            
            // Cargar cargas con sus relaciones por separado
            $docente->load([
                'cargas.grupo:id,materia_id,gestion_id,codigo,capacidad',
                'cargas.grupo.materia:id,nombre,codigo',
                'cargas.grupo.gestion:id,codigo,periodo,anio'
            ]);
            
            $this->logConsultar('docente', 1);

            // Construir respuesta manualmente para control total
            $data = [
                'id' => $docente->id,
                'usuario_id' => $docente->usuario_id,
                'ci' => $docente->ci,
                'nombre' => $docente->nombre,
                'telefono' => $docente->telefono,
                'usuario' => $docente->usuario ? [
                    'id' => $docente->usuario->id,
                    'username' => $docente->usuario->username,
                    'email' => $docente->usuario->email,
                    'estado' => $docente->usuario->estado,
                    'roles' => $docente->usuario->roles->map(function ($rol) {
                        return [
                            'id' => $rol->id,
                            'nombre' => $rol->nombre,
                        ];
                    })->toArray(),
                ] : null,
                'cargas' => $docente->cargas->map(function ($carga) {
                    return [
                        'id' => $carga->id,
                        'docente_id' => $carga->docente_id,
                        'grupo_id' => $carga->grupo_id,
                        'horas_asignadas' => $carga->horas_asignadas,
                        'grupo' => $carga->grupo ? [
                            'id' => $carga->grupo->id,
                            'materia_id' => $carga->grupo->materia_id,
                            'gestion_id' => $carga->grupo->gestion_id,
                            'codigo' => $carga->grupo->codigo,
                            'capacidad' => $carga->grupo->capacidad,
                            'materia' => $carga->grupo->materia ? [
                                'id' => $carga->grupo->materia->id,
                                'nombre' => $carga->grupo->materia->nombre,
                                'codigo' => $carga->grupo->materia->codigo,
                            ] : null,
                            'gestion' => $carga->grupo->gestion ? [
                                'id' => $carga->grupo->gestion->id,
                                'codigo' => $carga->grupo->gestion->codigo,
                                'periodo' => $carga->grupo->gestion->periodo,
                                'anio' => $carga->grupo->gestion->anio,
                            ] : null,
                        ] : null,
                    ];
                })->toArray(),
            ];

            return response()->json($data);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Docente no encontrado'
            ], 404);
        } catch (\Exception $e) {
            Log::error('Error al obtener docente', [
                'id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al obtener el docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✏️ Actualizar un docente
     * PUT/PATCH /api/docentes/{id}
     */
    public function update(Request $request, string $id)
    {
        try {
            $docente = Docente::with('usuario')->findOrFail($id);

            $validator = Validator::make($request->all(), [
                'ci' => [
                    'required',
                    'string',
                    'max:20',
                    Rule::unique('docente', 'ci')->ignore($docente->id)
                ],
                'nombre' => 'required|string|max:100',
                'telefono' => 'nullable|string|max:30',
                'email' => [
                    'required',
                    'email',
                    'max:120',
                    Rule::unique('usuario', 'email')->ignore($docente->usuario_id)
                ],
                'username' => [
                    'required',
                    'string',
                    'max:50',
                    Rule::unique('usuario', 'username')->ignore($docente->usuario_id)
                ],
                'password' => 'nullable|string|min:6',
                'estado' => 'required|in:activo,suspendido',
                'rol_ids' => 'nullable|array',
                'rol_ids.*' => 'exists:rol,id'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Errores de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            DB::beginTransaction();
            try {
                // Actualizar docente
                $docente->update([
                    'ci' => $request->ci,
                    'nombre' => $request->nombre,
                    'telefono' => $request->telefono,
                ]);

                // Actualizar usuario
                $usuarioData = [
                    'username' => $request->username,
                    'email' => $request->email,
                    'estado' => $request->estado,
                ];

                if ($request->filled('password')) {
                    $usuarioData['password_hash'] = Hash::make($request->password);
                }

                $docente->usuario->update($usuarioData);

                // Actualizar roles
                if ($request->has('rol_ids')) {
                    $docente->usuario->roles()->sync($request->rol_ids);
                }

                $docente->load('usuario.roles');

                DB::commit();
                $this->logActualizar('docente', $docente->id);

                return response()->json([
                    'message' => 'Docente actualizado exitosamente',
                    'data' => $docente
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Docente no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 🗑️ Eliminar un docente
     * DELETE /api/docentes/{id}
     */
    public function destroy(string $id)
    {
        try {
            $docente = Docente::with('usuario')->findOrFail($id);

            // Verificar si tiene cargas asignadas
            $cargasCount = $docente->cargas()->count();
            if ($cargasCount > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el docente porque tiene {$cargasCount} carga(s) asignada(s). Primero debe desasignar las cargas.",
                    'cargas_count' => $cargasCount
                ], 409);
            }

            // Verificar si tiene asistencias registradas
            $asistenciasCount = $docente->asistencias()->count();
            if ($asistenciasCount > 0) {
                return response()->json([
                    'message' => "No se puede eliminar el docente porque tiene {$asistenciasCount} asistencia(s) registrada(s).",
                    'asistencias_count' => $asistenciasCount
                ], 409);
            }

            DB::beginTransaction();
            try {
                $docenteNombre = $docente->nombre;
                $usuario = $docente->usuario;
                
                // Eliminar docente (el usuario se mantiene por si acaso)
                $docente->delete();
                
                // Opcional: También eliminar el usuario si se desea
                // $usuario->delete();

                DB::commit();
                $this->logEliminar('docente', $id);

                return response()->json([
                    'message' => "Docente '{$docenteNombre}' eliminado exitosamente"
                ]);
            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Docente no encontrado'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar el docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📊 Obtener estadísticas de docentes
     * GET /api/docentes/estadisticas
     */
    public function estadisticas()
    {
        try {
            $stats = [
                'total_docentes' => Docente::count(),
                'docentes_activos' => Docente::whereHas('usuario', function($q) {
                    $q->where('estado', 'activo');
                })->count(),
                'docentes_suspendidos' => Docente::whereHas('usuario', function($q) {
                    $q->where('estado', 'suspendido');
                })->count(),
                'docentes_con_cargas' => Docente::has('cargas')->count(),
                'docentes_sin_cargas' => Docente::doesntHave('cargas')->count(),
            ];

            $this->logConsultar('estadísticas de docentes', 1);

            return response()->json($stats);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener estadísticas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * 📤 Exportar docentes a Excel o PDF
     * GET /api/docentes/exportar?formato=excel|pdf
     */
    public function exportar(Request $request)
    {
        try {
            $formato = $request->input('formato', 'excel');
            
            $query = Docente::query()->with([
                'usuario.roles',
                'cargas'
            ]);

            // Aplicar los mismos filtros que en index
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nombre', 'ilike', "%{$search}%")
                      ->orWhere('ci', 'ilike', "%{$search}%")
                      ->orWhere('telefono', 'ilike', "%{$search}%")
                      ->orWhereHas('usuario', function($uq) use ($search) {
                          $uq->where('email', 'ilike', "%{$search}%")
                             ->orWhere('username', 'ilike', "%{$search}%");
                      });
                });
            }

            if ($request->has('estado')) {
                $query->whereHas('usuario', function($uq) use ($request) {
                    $uq->where('estado', $request->estado);
                });
            }

            $docentes = $query->orderBy('nombre', 'asc')->get();

            $this->logActivity(
                'exportar',
                "Exportó listado de docentes en formato {$formato}",
                [
                    'formato' => $formato,
                    'total' => $docentes->count(),
                ]
            );

            if ($formato === 'pdf') {
                $export = new \App\Exports\DocentesPdfExport($docentes, $request->all());
                return $export->download();
            } else {
                return \Maatwebsite\Excel\Facades\Excel::download(
                    new \App\Exports\DocentesExport($docentes),
                    'docentes-' . now()->setTimezone(config('app.timezone'))->format('Y-m-d') . '.xlsx'
                );
            }
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al exportar docentes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
