<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Confiar en proxies de Azure (Application Gateway, Load Balancer)
        // Esto permite detectar la IP real del cliente cuando está detrás de un proxy
        $middleware->trustProxies(
            at: '*',
            headers: \Illuminate\Http\Request::HEADER_X_FORWARDED_FOR |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_HOST |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_PORT |
                     \Illuminate\Http\Request::HEADER_X_FORWARDED_PROTO
        );

        // Middleware de bitácora para rutas API autenticadas
        $middleware->api(append: [
            \App\Http\Middleware\LogActivityMiddleware::class,
        ]);
        
        // USAR NUESTRO MIDDLEWARE PERSONALIZADO DE AUTENTICACIÓN
        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Manejo de excepciones de autenticación para APIs
        $exceptions->render(function (\Illuminate\Auth\AuthenticationException $e, Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'message' => 'No autenticado. Por favor inicie sesión.',
                    'error' => 'Unauthenticated'
                ], 401);
            }
            
            throw $e;
        });
    })->create();
