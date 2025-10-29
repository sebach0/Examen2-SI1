<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Domain\Shared\Models\Bitacora;
use Illuminate\Support\Facades\Log;

/**
 * Middleware LogActivityMiddleware
 * 
 * Registra automáticamente todas las peticiones API de usuarios autenticados.
 * Solo registra peticiones que modifiquen datos (POST, PUT, DELETE, PATCH).
 * 
 * Para registrar también peticiones GET, modificar el array $metodosARegistrar.
 */
class LogActivityMiddleware
{
    /**
     * Métodos HTTP que se registrarán automáticamente
     */
    private array $metodosARegistrar = ['POST', 'PUT', 'DELETE', 'PATCH'];

    /**
     * Rutas que NO se registrarán (blacklist)
     */
    private array $rutasExcluidas = [
        'api/auth/me',           // Consulta de usuario actual (muy frecuente)
        'sanctum/csrf-cookie',   // Cookie CSRF
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ejecutar la petición
        $response = $next($request);

        // Registrar después de la respuesta (en background)
        if ($this->debeRegistrar($request)) {
            $this->registrarActividad($request, $response);
        }

        return $response;
    }

    /**
     * Determinar si la petición debe registrarse
     */
    private function debeRegistrar(Request $request): bool
    {
        // Solo registrar si hay usuario autenticado
        if (!auth('sanctum')->check()) {
            return false;
        }

        // Verificar si el método HTTP debe registrarse
        if (!in_array($request->method(), $this->metodosARegistrar)) {
            return false;
        }

        // Verificar si la ruta está excluida
        $path = $request->path();
        foreach ($this->rutasExcluidas as $rutaExcluida) {
            if (str_contains($path, $rutaExcluida)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Registrar la actividad en la bitácora
     */
    private function registrarActividad(Request $request, Response $response): void
    {
        try {
            // Determinar la acción según el método HTTP
            $accion = $this->determinarAccion($request);

            // Extraer información de la respuesta
            $codigoHttp = $response->getStatusCode();
            $datosResponse = null;

            if ($response->getContent()) {
                $content = json_decode($response->getContent(), true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $datosResponse = $content;
                }
            }

            // Registrar en bitácora
            Bitacora::create([
                'usuario_id' => auth('sanctum')->id(),
                'accion' => $accion,
                'descripcion' => $this->generarDescripcion($request, $accion),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'metodo_http' => $request->method(),
                'ruta' => $request->path(),
                'datos_request' => $this->sanitizarDatos($request->except(['password', 'password_confirmation', 'token'])),
                'datos_response' => $datosResponse,
                'codigo_http' => $codigoHttp,
            ]);
        } catch (\Exception $e) {
            // Si falla el registro, no debe afectar la respuesta
            Log::error('Error al registrar actividad en bitácora: ' . $e->getMessage());
        }
    }

    /**
     * Determinar la acción según el método HTTP
     */
    private function determinarAccion(Request $request): string
    {
        return match($request->method()) {
            'POST' => Bitacora::ACCION_CREAR,
            'PUT', 'PATCH' => Bitacora::ACCION_ACTUALIZAR,
            'DELETE' => Bitacora::ACCION_ELIMINAR,
            'GET' => Bitacora::ACCION_CONSULTAR,
            default => 'ACCION_DESCONOCIDA',
        };
    }

    /**
     * Generar descripción legible de la acción
     */
    private function generarDescripcion(Request $request, string $accion): string
    {
        $ruta = $request->path();
        $metodo = $request->method();
        
        // Intentar generar una descripción más amigable
        $descripcion = "{$metodo} {$ruta}";

        // Extraer el recurso de la ruta (ejemplo: /api/materias/123 -> materias)
        if (preg_match('/api\/([^\/]+)/', $ruta, $matches)) {
            $recurso = $matches[1];
            $descripcion = match($accion) {
                Bitacora::ACCION_CREAR => "Creó {$recurso}",
                Bitacora::ACCION_ACTUALIZAR => "Actualizó {$recurso}",
                Bitacora::ACCION_ELIMINAR => "Eliminó {$recurso}",
                Bitacora::ACCION_CONSULTAR => "Consultó {$recurso}",
                default => $descripcion,
            };
        }

        return $descripcion;
    }

    /**
     * Sanitizar datos sensibles
     */
    private function sanitizarDatos(array $datos): array
    {
        $camposSensibles = ['password', 'password_confirmation', 'token', 'api_key', 'secret'];
        
        foreach ($camposSensibles as $campo) {
            if (isset($datos[$campo])) {
                $datos[$campo] = '***OCULTO***';
            }
        }
        
        return $datos;
    }
}

