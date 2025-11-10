<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

/**
 * Middleware de Autenticación Personalizado
 * 
 * Sobrescribe el comportamiento por defecto de Laravel para rutas API.
 * En lugar de redirigir a 'login', devuelve null para que Sanctum 
 * lance AuthenticationException y se devuelva JSON 401.
 */
class Authenticate extends Middleware
{
    /**
     * Obtener la ruta a la que debe redirigirse cuando no está autenticado.
     * 
     * Para rutas API, devuelve null para que no intente redirigir.
     * Esto permite que el exception handler devuelva JSON 401.
     */
    protected function redirectTo(Request $request): ?string
    {
        // NUNCA redirigir - siempre devolver null
        // Esto hace que Laravel lance AuthenticationException
        // que luego es capturada por el exception handler en bootstrap/app.php
        return null;
    }
}
