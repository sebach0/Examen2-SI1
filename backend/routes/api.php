<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\RolController;
use App\Http\Controllers\Api\Auth\PermisoController;
use App\Http\Controllers\Api\Auth\UsuarioController;
use App\Http\Controllers\Api\BitacoraController;
use App\Http\Controllers\Api\Academico\DocenteController;
use App\Http\Controllers\Api\Academico\MateriaController;
use App\Http\Controllers\Api\Academico\GrupoController;
use App\Http\Controllers\Api\Infraestructura\AulaController;
use App\Http\Controllers\Api\TiempoHorarios\BloqueHorarioController;
use App\Http\Controllers\Api\Academico\GestionController;
use App\Http\Controllers\Api\Infraestructura\EdificioController;
use App\Http\Controllers\Api\TiempoHorarios\CargaDocenteController;
use App\Http\Controllers\Api\TiempoHorarios\HorarioGrupoController;
use App\Http\Controllers\Api\Asistencia\AsistenciaController;
use App\Http\Controllers\Api\Asistencia\QrSesionController;
use App\Http\Controllers\Api\Importacion\ImportacionController;
use App\Http\Controllers\Api\DashboardController;

/**
 * Rutas de Autenticación (públicas)
 */
Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/admin-login', [AuthController::class, 'adminLogin']);
    
    // Rutas protegidas de autenticación
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

/**
 * Rutas protegidas (requieren autenticación)
 */
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    /**
     * Rutas de Dashboard
     */
    Route::prefix('dashboard')->group(function () {
        Route::get('/estadisticas', [DashboardController::class, 'estadisticas']);
    });

    /**
     * Rutas de Bitácora
     */
    Route::prefix('bitacora')->group(function () {
        Route::get('/', [BitacoraController::class, 'index']);
        Route::get('/estadisticas', [BitacoraController::class, 'estadisticas']);
        Route::get('/usuario/{usuarioId}', [BitacoraController::class, 'actividadUsuario']);
    });

    /**
     * Rutas de Roles
     */
    Route::prefix('roles')->group(function () {
        Route::get('/', [RolController::class, 'index']);
        Route::post('/', [RolController::class, 'store']);
        Route::get('/{id}', [RolController::class, 'show']);
        Route::put('/{id}', [RolController::class, 'update']);
        Route::delete('/{id}', [RolController::class, 'destroy']);
        Route::post('/{id}/permisos', [RolController::class, 'assignPermisos']);
    });

    /**
     * Rutas de Permisos
     */
    Route::prefix('permisos')->group(function () {
        Route::get('/', [PermisoController::class, 'index']);
        Route::get('/grouped', [PermisoController::class, 'grouped']);
        Route::post('/', [PermisoController::class, 'store']);
        Route::get('/{id}', [PermisoController::class, 'show']);
        Route::put('/{id}', [PermisoController::class, 'update']);
        Route::delete('/{id}', [PermisoController::class, 'destroy']);
    });

    /**
     * Rutas de Usuarios
     */
    Route::prefix('usuarios')->group(function () {
        Route::get('/', [UsuarioController::class, 'index']);
        Route::get('/estadisticas', [UsuarioController::class, 'estadisticas']);
        Route::post('/', [UsuarioController::class, 'store']);
        Route::get('/{id}', [UsuarioController::class, 'show']);
        Route::put('/{id}', [UsuarioController::class, 'update']);
        Route::delete('/{id}', [UsuarioController::class, 'destroy']);
        Route::post('/{id}/cambiar-estado', [UsuarioController::class, 'cambiarEstado']);
    });

    /**
     * Rutas de Docentes
     */
    Route::prefix('docentes')->group(function () {
        Route::get('/', [DocenteController::class, 'index']);
        Route::get('/estadisticas', [DocenteController::class, 'estadisticas']);
        Route::get('/exportar', [DocenteController::class, 'exportar']);
        Route::post('/', [DocenteController::class, 'store']);
        Route::get('/{id}', [DocenteController::class, 'show']);
        Route::put('/{id}', [DocenteController::class, 'update']);
        Route::delete('/{id}', [DocenteController::class, 'destroy']);
    });

    /**
     * Rutas de Materias
     */
    Route::prefix('materias')->group(function () {
        Route::get('/', [MateriaController::class, 'index']);
        Route::get('/carreras', [MateriaController::class, 'carreras']);
        Route::get('/estadisticas', [MateriaController::class, 'estadisticas']);
        Route::get('/exportar', [MateriaController::class, 'exportar']);
        Route::post('/', [MateriaController::class, 'store']);
        Route::get('/{id}', [MateriaController::class, 'show']);
        Route::put('/{id}', [MateriaController::class, 'update']);
        Route::delete('/{id}', [MateriaController::class, 'destroy']);
    });

    /**
     * Rutas de Grupos
     */
    Route::prefix('grupos')->group(function () {
        Route::get('/', [GrupoController::class, 'index']);
        Route::get('/gestiones', [GrupoController::class, 'gestiones']);
        Route::get('/estadisticas', [GrupoController::class, 'estadisticas']);
        Route::get('/exportar', [GrupoController::class, 'exportar']);
        Route::post('/', [GrupoController::class, 'store']);
        Route::get('/{id}', [GrupoController::class, 'show']);
        Route::put('/{id}', [GrupoController::class, 'update']);
        Route::delete('/{id}', [GrupoController::class, 'destroy']);
    });

    /**
     * Rutas de Aulas
     */
    Route::prefix('aulas')->group(function () {
        Route::get('/', [AulaController::class, 'index']);
        Route::get('/edificios', [AulaController::class, 'edificios']);
        Route::get('/tipos', [AulaController::class, 'tipos']);
        Route::get('/estadisticas', [AulaController::class, 'estadisticas']);
        Route::post('/', [AulaController::class, 'store']);
        Route::get('/{id}', [AulaController::class, 'show']);
        Route::put('/{id}', [AulaController::class, 'update']);
        Route::delete('/{id}', [AulaController::class, 'destroy']);
    });

    /**
     * Rutas de Bloques Horarios
     */
    Route::prefix('bloques')->group(function () {
        Route::get('/', [BloqueHorarioController::class, 'index']);
        Route::get('/dias', [BloqueHorarioController::class, 'dias']);
        Route::get('/estadisticas', [BloqueHorarioController::class, 'estadisticas']);
        Route::post('/', [BloqueHorarioController::class, 'store']);
        Route::get('/{id}', [BloqueHorarioController::class, 'show']);
        Route::put('/{id}', [BloqueHorarioController::class, 'update']);
        Route::delete('/{id}', [BloqueHorarioController::class, 'destroy']);
    });

    /**
     * Rutas de Gestiones Académicas
     */
    Route::prefix('gestiones')->group(function () {
        Route::get('/', [GestionController::class, 'index']);
        Route::get('/activa', [GestionController::class, 'activa']);
        Route::post('/', [GestionController::class, 'store']);
        Route::get('/{id}', [GestionController::class, 'show']);
        Route::put('/{id}', [GestionController::class, 'update']);
        Route::delete('/{id}', [GestionController::class, 'destroy']);
    });

    /**
     * Rutas de Edificios
     */
    Route::prefix('edificios')->group(function () {
        Route::get('/', [EdificioController::class, 'index']);
        Route::post('/', [EdificioController::class, 'store']);
        Route::get('/{id}', [EdificioController::class, 'show']);
        Route::put('/{id}', [EdificioController::class, 'update']);
        Route::delete('/{id}', [EdificioController::class, 'destroy']);
    });

    /**
     * Rutas de Cargas Docentes
     */
    Route::prefix('cargas-docentes')->group(function () {
        Route::get('/', [CargaDocenteController::class, 'index']);
        Route::get('/docente/{docenteId}', [CargaDocenteController::class, 'byDocente']);
        Route::get('/grupo/{grupoId}', [CargaDocenteController::class, 'byGrupo']);
        Route::get('/exportar', [CargaDocenteController::class, 'exportar']);
        Route::post('/', [CargaDocenteController::class, 'store']);
        Route::get('/{id}', [CargaDocenteController::class, 'show']);
        Route::put('/{id}', [CargaDocenteController::class, 'update']);
        Route::delete('/{id}', [CargaDocenteController::class, 'destroy']);
    });

    /**
     * Rutas de Horarios de Grupo
     */
    Route::prefix('horarios-grupo')->group(function () {
        Route::get('/', [HorarioGrupoController::class, 'index']);
        Route::get('/grupo/{grupoId}', [HorarioGrupoController::class, 'byGrupo']);
        Route::get('/aula/{aulaId}', [HorarioGrupoController::class, 'byAula']);
        Route::get('/exportar', [HorarioGrupoController::class, 'exportar']);
        Route::get('/reportes/semanal', [HorarioGrupoController::class, 'reporteSemanal']);
        Route::get('/reportes/diario', [HorarioGrupoController::class, 'reporteDiario']);
        Route::post('/verificar-conflictos', [HorarioGrupoController::class, 'verificarConflictos']);
        Route::post('/', [HorarioGrupoController::class, 'store']);
        Route::get('/{id}', [HorarioGrupoController::class, 'show']);
        Route::put('/{id}', [HorarioGrupoController::class, 'update']);
        Route::delete('/{id}', [HorarioGrupoController::class, 'destroy']);
    });

    /**
     * Rutas de Asistencias
     */
    Route::prefix('asistencias')->group(function () {
        Route::get('/', [AsistenciaController::class, 'index']);
        Route::post('/', [AsistenciaController::class, 'store']);
        Route::post('/qr', [AsistenciaController::class, 'marcarPorQr']);
        Route::get('/estadisticas/docente/{docenteId}', [AsistenciaController::class, 'estadisticasDocente']);
        Route::get('/estadisticas/grupo/{grupoId}', [AsistenciaController::class, 'estadisticasGrupo']);
        Route::get('/exportar', [AsistenciaController::class, 'exportar']);
    });

    /**
     * Rutas de Importación
     */
    Route::prefix('importacion')->group(function () {
        Route::post('/usuarios', [ImportacionController::class, 'importarUsuarios']);
        Route::get('/historial', [ImportacionController::class, 'historial']);
        Route::get('/{id}', [ImportacionController::class, 'show']);
    });

    /**
     * Rutas de QR Sesiones
     */
    Route::prefix('qr-sesiones')->group(function () {
        Route::post('/generar', [QrSesionController::class, 'generar']);
        Route::get('/verificar/{token}', [QrSesionController::class, 'verificar']);
        Route::post('/{id}/desactivar', [QrSesionController::class, 'desactivar']);
    });
});

