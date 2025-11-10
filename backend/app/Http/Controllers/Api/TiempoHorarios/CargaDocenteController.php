<?php

namespace App\Http\Controllers\Api\TiempoHorarios;

use App\Domain\TiempoHorarios\Models\CargaDocente;
use App\Domain\Shared\Traits\LogsActivity;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class CargaDocenteController extends Controller
{
    use LogsActivity;

    /**
     * Listar cargas docentes con búsqueda y filtros
     * 
     * GET /api/cargas-docentes?docente_id=xxx&grupo_id=xxx&perPage=15
     */
    public function index(Request $request)
    {
        try {
            // LOG: Ver qué parámetros llegan
            Log::info('🔍 CargaDocente@index llamado', [
                'all' => $request->get('all'),
                'all_value' => $request->get('all') === 'true' ? 'YES' : 'NO',
                'query_params' => $request->all()
            ]);
            
            $query = CargaDocente::with(['docente.usuario', 'grupo.materia', 'grupo.gestion']);

            // Filtro por docente
            if ($request->filled('docente_id')) {
                $query->where('docente_id', $request->docente_id);
            }

            // Filtro por grupo
            if ($request->filled('grupo_id')) {
                $query->where('grupo_id', $request->grupo_id);
            }

            // Ordenamiento
            $sortField = $request->get('sort', 'id');
            $sortDirection = $request->get('direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Paginación o retornar todos
            if ($request->get('all') === 'true') {
                $cargas = $query->get();
                Log::info('✅ CargaDocente: Devolviendo ' . $cargas->count() . ' registros');
                $this->logConsultar('carga_docente', $cargas->count());
                return response()->json($cargas, 200);
            }

            $perPage = $request->get('perPage', 15);
            $cargas = $query->paginate($perPage);

            $this->logConsultar('carga_docente', $cargas->total());

            return response()->json($cargas);
        } catch (\Exception $e) {
            // Log el error completo para debugging
            Log::error('Error en CargaDocenteController@index', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Error al obtener las cargas docentes',
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
    }

    /**
     * Obtener cargas de un docente específico
     * 
     * GET /api/cargas-docentes/docente/{docenteId}
     */
    public function byDocente($docenteId)
    {
        try {
            $cargas = CargaDocente::with(['grupo.materia', 'grupo.gestion'])
                ->where('docente_id', $docenteId)
                ->orderBy('id', 'desc')
                ->get();

            $this->logConsultar('carga_docente', $cargas->count());

            return response()->json($cargas);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las cargas del docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Obtener cargas de un grupo específico
     * 
     * GET /api/cargas-docentes/grupo/{grupoId}
     */
    public function byGrupo($grupoId)
    {
        try {
            $cargas = CargaDocente::with(['docente'])
                ->where('grupo_id', $grupoId)
                ->orderBy('id', 'desc')
                ->get();

            $this->logConsultar('carga_docente', $cargas->count());

            return response()->json($cargas);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener las cargas del grupo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Crear nueva carga docente
     * 
     * POST /api/cargas-docentes
     */
    public function store(Request $request)
    {
        try {
            // Validación
            $validator = Validator::make($request->all(), [
                'docente_id' => 'required|uuid|exists:docente,id',
                'grupo_id' => 'required|uuid|exists:grupo,id',
                'horas_asignadas' => 'required|integer|min:1|max:40',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Verificar que no exista ya una carga para ese docente y grupo
            $existente = CargaDocente::where('docente_id', $request->docente_id)
                ->where('grupo_id', $request->grupo_id)
                ->first();

            if ($existente) {
                return response()->json([
                    'message' => 'Ya existe una carga para este docente en este grupo'
                ], 422);
            }

            // Crear la carga docente
            $carga = CargaDocente::create($request->all());
            $carga->load(['docente', 'grupo.materia']);

            $this->logCrear('carga_docente', $carga);

            return response()->json([
                'message' => 'Carga docente creada exitosamente',
                'data' => $carga
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear la carga docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mostrar una carga docente específica
     * 
     * GET /api/cargas-docentes/{id}
     */
    public function show($id)
    {
        try {
            $carga = CargaDocente::with(['docente', 'grupo.materia', 'grupo.gestion'])
                ->findOrFail($id);
            
            $this->logConsultar('carga_docente', 1);

            return response()->json($carga);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Carga docente no encontrada',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Actualizar una carga docente
     * 
     * PUT /api/cargas-docentes/{id}
     */
    public function update(Request $request, $id)
    {
        try {
            $carga = CargaDocente::findOrFail($id);

            // Validación
            $validator = Validator::make($request->all(), [
                'docente_id' => 'sometimes|uuid|exists:docente,id',
                'grupo_id' => 'sometimes|uuid|exists:grupo,id',
                'horas_asignadas' => 'sometimes|integer|min:1|max:40',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error de validación',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Si se cambia docente o grupo, verificar duplicados
            if ($request->has('docente_id') || $request->has('grupo_id')) {
                $docenteId = $request->get('docente_id', $carga->docente_id);
                $grupoId = $request->get('grupo_id', $carga->grupo_id);

                $existente = CargaDocente::where('docente_id', $docenteId)
                    ->where('grupo_id', $grupoId)
                    ->where('id', '!=', $id)
                    ->first();

                if ($existente) {
                    return response()->json([
                        'message' => 'Ya existe una carga para este docente en este grupo'
                    ], 422);
                }
            }

            $datosAnteriores = $carga->toArray();

            // Actualizar la carga docente
            $carga->update($request->all());
            $carga->load(['docente', 'grupo.materia']);

            $this->logActualizar('carga_docente', $carga->id);

            return response()->json([
                'message' => 'Carga docente actualizada exitosamente',
                'data' => $carga
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar la carga docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar una carga docente
     * 
     * DELETE /api/cargas-docentes/{id}
     */
    public function destroy($id)
    {
        try {
            $carga = CargaDocente::findOrFail($id);

            $datosEliminados = $carga->toArray();
            $carga->delete();

            $this->logEliminar('carga_docente', $id);

            return response()->json([
                'message' => 'Carga docente eliminada exitosamente'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al eliminar la carga docente',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
