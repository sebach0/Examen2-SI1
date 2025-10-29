<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Domain\Shared\Models\Bitacora;
use Illuminate\Http\Request;

/**
 * Controlador de Bitácora
 * 
 * Maneja la consulta y administración de registros de bitácora.
 * Solo accesible para usuarios autenticados.
 */
class BitacoraController extends Controller
{
    /**
     * Listar registros de bitácora con filtros
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Bitacora::query()->with('usuario:id,username,email');

        // Filtro por usuario
        if ($request->has('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }

        // Filtro por acción
        if ($request->has('accion')) {
            $query->where('accion', $request->accion);
        }

        // Filtro por fecha desde
        if ($request->has('desde')) {
            $query->where('created_at', '>=', $request->desde);
        }

        // Filtro por fecha hasta
        if ($request->has('hasta')) {
            $query->where('created_at', '<=', $request->hasta);
        }

        // Ordenar por fecha descendente (más recientes primero)
        $query->orderBy('created_at', 'desc');

        // Paginación
        $perPage = $request->get('per_page', 50);
        $bitacora = $query->paginate($perPage);

        return response()->json($bitacora);
    }

    /**
     * Obtener estadísticas de la bitácora
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function estadisticas(Request $request)
    {
        $dias = $request->get('dias', 30);

        $stats = [
            'total_eventos' => Bitacora::reciente($dias)->count(),
            'logins_exitosos' => Bitacora::reciente($dias)->porAccion(Bitacora::ACCION_LOGIN)->count(),
            'logins_fallidos' => Bitacora::reciente($dias)->porAccion(Bitacora::ACCION_LOGIN_FALLIDO)->count(),
            'usuarios_activos' => Bitacora::reciente($dias)->distinct('usuario_id')->count('usuario_id'),
            'acciones_por_tipo' => Bitacora::reciente($dias)
                ->selectRaw('accion, COUNT(*) as total')
                ->groupBy('accion')
                ->orderBy('total', 'desc')
                ->get(),
            'actividad_por_dia' => Bitacora::reciente($dias)
                ->selectRaw('DATE(created_at) as fecha, COUNT(*) as total')
                ->groupBy('fecha')
                ->orderBy('fecha', 'desc')
                ->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Obtener actividad reciente de un usuario específico
     * 
     * @param string $usuarioId
     * @return \Illuminate\Http\JsonResponse
     */
    public function actividadUsuario($usuarioId)
    {
        $actividad = Bitacora::where('usuario_id', $usuarioId)
            ->orderBy('created_at', 'desc')
            ->limit(100)
            ->get();

        return response()->json($actividad);
    }
}
