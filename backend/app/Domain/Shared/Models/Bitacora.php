<?php

namespace App\Domain\Shared\Models;

use Illuminate\Database\Eloquent\Model;
use App\Domain\Shared\Traits\HasUuid;
use App\Domain\Auth\Models\Usuario;

/**
 * Modelo Bitacora
 * 
 * Registra todas las acciones importantes del sistema para auditoría y seguridad.
 * Implementa el patrón de registro de actividad similar a los audit logs.
 * 
 * @property string $id
 * @property string|null $usuario_id
 * @property string $accion
 * @property string|null $descripcion
 * @property string|null $ip
 * @property string|null $user_agent
 * @property string|null $metodo_http
 * @property string|null $ruta
 * @property array|null $datos_request
 * @property array|null $datos_response
 * @property int|null $codigo_http
 * @property \Carbon\Carbon $created_at
 */
class Bitacora extends Model
{
    use HasUuid;

    /**
     * Nombre de la tabla
     */
    protected $table = 'bitacora';

    /**
     * Deshabilitar updated_at
     */
    public const UPDATED_AT = null;

    /**
     * Campos asignables masivamente
     */
    protected $fillable = [
        'id',
        'usuario_id',
        'accion',
        'descripcion',
        'ip',
        'user_agent',
        'metodo_http',
        'ruta',
        'datos_request',
        'datos_response',
        'codigo_http',
    ];

    /**
     * Campos que son JSON
     */
    protected $casts = [
        'datos_request' => 'array',
        'datos_response' => 'array',
        'created_at' => 'datetime',
    ];

    /**
     * Constantes de acciones comunes
     */
    public const ACCION_LOGIN = 'LOGIN';
    public const ACCION_LOGOUT = 'LOGOUT';
    public const ACCION_LOGIN_FALLIDO = 'LOGIN_FALLIDO';
    public const ACCION_REGISTRO = 'REGISTRO';
    public const ACCION_CREAR = 'CREAR';
    public const ACCION_ACTUALIZAR = 'ACTUALIZAR';
    public const ACCION_ELIMINAR = 'ELIMINAR';
    public const ACCION_CONSULTAR = 'CONSULTAR';
    public const ACCION_EXPORTAR = 'EXPORTAR';
    public const ACCION_IMPORTAR = 'IMPORTAR';
    public const ACCION_DESCARGAR = 'DESCARGAR';

    /**
     * Relación con Usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    /**
     * Scope para filtrar por usuario
     */
    public function scopeDeUsuario($query, $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    /**
     * Scope para filtrar por acción
     */
    public function scopePorAccion($query, $accion)
    {
        return $query->where('accion', $accion);
    }

    /**
     * Scope para filtrar por rango de fechas
     */
    public function scopeEntreFechas($query, $desde, $hasta)
    {
        return $query->whereBetween('created_at', [$desde, $hasta]);
    }

    /**
     * Scope para obtener actividad reciente
     */
    public function scopeReciente($query, $dias = 7)
    {
        return $query->where('created_at', '>=', now()->subDays($dias));
    }

    /**
     * Método estático para registrar una actividad
     * 
     * @param string $accion
     * @param string|null $descripcion
     * @param array $datosAdicionales
     * @return static
     */
    public static function registrar(string $accion, ?string $descripcion = null, array $datosAdicionales = [])
    {
        $request = request();
        
        return static::create([
            'usuario_id' => auth('sanctum')->id(),
            'accion' => strtoupper($accion),
            'descripcion' => $descripcion,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metodo_http' => $request->method(),
            'ruta' => $request->path(),
            'datos_request' => static::sanitizarDatos($request->except(['password', 'password_confirmation', 'token'])),
            ...$datosAdicionales,
        ]);
    }

    /**
     * Sanitizar datos sensibles antes de guardar
     */
    private static function sanitizarDatos(array $datos): array
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
