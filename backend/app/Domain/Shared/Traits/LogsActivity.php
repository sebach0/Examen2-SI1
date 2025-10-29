<?php

namespace App\Domain\Shared\Traits;

use App\Domain\Shared\Models\Bitacora;

/**
 * Trait LogsActivity
 * 
 * Proporciona métodos para registrar actividades en la bitácora
 * desde cualquier controlador o servicio.
 * 
 * Uso:
 * use LogsActivity;
 * 
 * $this->logActivity(Bitacora::ACCION_CREAR, 'Usuario creó una materia');
 */
trait LogsActivity
{
    /**
     * Registrar una actividad en la bitácora
     * 
     * @param string $accion
     * @param string|null $descripcion
     * @param array $datosAdicionales
     * @return Bitacora
     */
    protected function logActivity(string $accion, ?string $descripcion = null, array $datosAdicionales = []): Bitacora
    {
        return Bitacora::registrar($accion, $descripcion, $datosAdicionales);
    }

    /**
     * Registrar un login exitoso
     */
    protected function logLogin(?string $username = null): Bitacora
    {
        $usuario = auth('sanctum')->user();
        $descripcion = $username 
            ? "Usuario '{$username}' inició sesión correctamente"
            : "Usuario inició sesión correctamente";
        
        return $this->logActivity(
            Bitacora::ACCION_LOGIN,
            $descripcion,
            ['datos_response' => ['success' => true]]
        );
    }

    /**
     * Registrar un intento de login fallido
     */
    protected function logLoginFallido(string $username, string $razon = 'Credenciales inválidas'): Bitacora
    {
        return $this->logActivity(
            Bitacora::ACCION_LOGIN_FALLIDO,
            "Intento fallido de inicio de sesión para usuario '{$username}': {$razon}",
            [
                'datos_response' => [
                    'success' => false,
                    'username' => $username,
                    'razon' => $razon,
                ],
                'codigo_http' => 401,
            ]
        );
    }

    /**
     * Registrar un logout
     */
    protected function logLogout(): Bitacora
    {
        $usuario = auth('sanctum')->user();
        $descripcion = $usuario 
            ? "Usuario '{$usuario->username}' cerró sesión"
            : "Usuario cerró sesión";

        return $this->logActivity(
            Bitacora::ACCION_LOGOUT,
            $descripcion,
            ['datos_response' => ['success' => true]]
        );
    }

    /**
     * Registrar creación de un recurso
     */
    protected function logCrear(string $recurso, $modelo = null): Bitacora
    {
        $id = $modelo ? ($modelo->id ?? 'N/A') : 'N/A';
        return $this->logActivity(
            Bitacora::ACCION_CREAR,
            "Creó {$recurso} con ID: {$id}",
            [
                'datos_response' => [
                    'recurso' => $recurso,
                    'id' => $id,
                ],
                'codigo_http' => 201,
            ]
        );
    }

    /**
     * Registrar actualización de un recurso
     */
    protected function logActualizar(string $recurso, $id): Bitacora
    {
        return $this->logActivity(
            Bitacora::ACCION_ACTUALIZAR,
            "Actualizó {$recurso} con ID: {$id}",
            [
                'datos_response' => [
                    'recurso' => $recurso,
                    'id' => $id,
                ],
                'codigo_http' => 200,
            ]
        );
    }

    /**
     * Registrar eliminación de un recurso
     */
    protected function logEliminar(string $recurso, $id): Bitacora
    {
        return $this->logActivity(
            Bitacora::ACCION_ELIMINAR,
            "Eliminó {$recurso} con ID: {$id}",
            [
                'datos_response' => [
                    'recurso' => $recurso,
                    'id' => $id,
                ],
                'codigo_http' => 200,
            ]
        );
    }

    /**
     * Registrar consulta de un recurso
     */
    protected function logConsultar(string $recurso, ?int $cantidad = null): Bitacora
    {
        $descripcion = $cantidad 
            ? "Consultó {$cantidad} {$recurso}"
            : "Consultó {$recurso}";

        return $this->logActivity(
            Bitacora::ACCION_CONSULTAR,
            $descripcion,
            [
                'datos_response' => [
                    'recurso' => $recurso,
                    'cantidad' => $cantidad,
                ],
                'codigo_http' => 200,
            ]
        );
    }

    /**
     * Registrar exportación de datos
     */
    protected function logExportar(string $recurso, string $formato = 'csv'): Bitacora
    {
        return $this->logActivity(
            Bitacora::ACCION_EXPORTAR,
            "Exportó {$recurso} en formato {$formato}",
            [
                'datos_response' => [
                    'recurso' => $recurso,
                    'formato' => $formato,
                ],
                'codigo_http' => 200,
            ]
        );
    }

    /**
     * Registrar importación de datos
     */
    protected function logImportar(string $recurso, int $registros = 0): Bitacora
    {
        return $this->logActivity(
            Bitacora::ACCION_IMPORTAR,
            "Importó {$registros} {$recurso}",
            [
                'datos_response' => [
                    'recurso' => $recurso,
                    'registros' => $registros,
                ],
                'codigo_http' => 200,
            ]
        );
    }
}
