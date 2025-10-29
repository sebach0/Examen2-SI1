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
});
