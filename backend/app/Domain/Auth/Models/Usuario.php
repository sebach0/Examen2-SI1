<?php

namespace App\Domain\Auth\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Model Usuario
 * 
 * 📝 EXPLICACIÓN PARA APRENDER:
 * ============================
 * Este es un "Modelo" en Laravel (el "M" de MVC - Model View Controller)
 * 
 * ¿Qué es un Modelo (Model)?
 * - Representa una TABLA en la base de datos
 * - Cada instancia = 1 fila/registro
 * - Laravel usa "Eloquent ORM" para manejar la DB sin SQL directo
 * 
 * Ejemplo práctico:
 * $usuario = Usuario::find('uuid-123');  // SELECT * FROM usuarios WHERE id = 'uuid-123'
 * $usuario->email = 'nuevo@mail.com';
 * $usuario->save();  // UPDATE usuarios SET email = '...' WHERE id = '...'
 * 
 * ¿Por qué extiende Authenticatable y no Model?
 * - Authenticatable es para modelos que pueden hacer LOGIN
 * - Trae métodos como: password hashing, remember tokens, etc.
 * 
 * Traits usados:
 * - HasApiTokens: Para Sanctum (tokens de autenticación API)
 * - HasFactory: Para crear datos falsos en tests
 * - Notifiable: Para enviar emails/notificaciones
 * - HasUuid: Nuestro trait custom para UUIDs
 * 
 * @property string $id UUID
 * @property string $username
 * @property string $email
 * @property string $password_hash
 * @property string $estado activo|suspendido
 * @property \Carbon\Carbon $creado_en
 * @property \Carbon\Carbon $actualizado_en
 */
class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasUuid;

    /**
     * Nombre de la tabla en la base de datos
     * Por defecto Laravel buscaría "usuarios" (plural), pero lo especificamos
     */
    protected $table = 'usuario';

    /**
     * Laravel por defecto usa 'created_at' y 'updated_at'
     * Tu DB usa nombres en español, así que los mapeamos
     */
    const CREATED_AT = 'creado_en';
    const UPDATED_AT = 'actualizado_en';

    /**
     * Campos que se pueden asignar masivamente
     * 
     * Ejemplo seguro:
     * Usuario::create([
     *     'username' => 'juan123',
     *     'email' => 'juan@mail.com'
     * ]);
     * 
     * ⚠️ Si pones 'id' aquí, alguien podría cambiar el ID de otro usuario!
     */
    protected $fillable = [
        'id',
        'username',
        'email',
        'password_hash',
        'estado',
    ];

    /**
     * Campos que NUNCA deben aparecer en JSON
     * Útil para APIs: cuando envías el usuario como respuesta,
     * estos campos se ocultan automáticamente
     */
    protected $hidden = [
        'password_hash',
    ];

    /**
     * Conversión automática de tipos (Casting)
     * 
     * ¿Qué hace?
     * - Convierte creado_en (string en DB) → objeto Carbon (fechas fáciles)
     * - Ejemplo: $usuario->creado_en->diffForHumans() → "hace 2 horas"
     */
    protected $casts = [
        'creado_en' => 'datetime',
        'actualizado_en' => 'datetime',
    ];

    /**
     * RELACIONES ELOQUENT
     * ====================
     * Son como "joins" automáticos. Laravel los convierte en propiedades mágicas.
     */

    /**
     * Relación: Un usuario tiene muchos roles (many-to-many)
     * 
     * Ejemplo de uso:
     * $usuario = Usuario::find('uuid-123');
     * $roles = $usuario->roles;  // Laravel hace el JOIN automáticamente
     * 
     * foreach ($usuario->roles as $rol) {
     *     echo $rol->nombre;  // "Admin", "Docente", etc
     * }
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function roles()
    {
        return $this->belongsToMany(
            Rol::class,                // Modelo relacionado
            'usuario_rol',             // Tabla pivote (intermedia)
            'usuario_id',              // FK del usuario en la tabla pivote
            'rol_id'                   // FK del rol en la tabla pivote
        );
    }

    /**
     * Relación: Un usuario tiene un perfil de docente (one-to-one)
     * 
     * Ejemplo:
     * $usuario = Usuario::find('uuid-123');
     * if ($usuario->docente) {
     *     echo $usuario->docente->ci;  // "12345678"
     * }
     */
    public function docente()
    {
        return $this->hasOne(\App\Domain\Academico\Models\Docente::class);
    }

    /**
     * Relación: Un usuario tiene muchos perfiles de gestión
     * (puede ser admin en 2024, docente en 2025)
     */
    public function perfilesGestion()
    {
        return $this->hasMany(\App\Domain\Academico\Models\PerfilGestion::class);
    }

    /**
     * MÉTODOS HELPER
     * ==============
     */

    /**
     * Verifica si el usuario tiene un rol específico
     * 
     * Ejemplo:
     * if ($usuario->hasRole('admin')) {
     *     // Permitir acceso
     * }
     */
    public function hasRole(string $roleName): bool
    {
        return $this->roles()->where('nombre', $roleName)->exists();
    }

    /**
     * Verifica si el usuario tiene un permiso
     * (a través de sus roles)
     */
    public function hasPermission(string $permissionCode): bool
    {
        return $this->roles()
            ->whereHas('permisos', function ($query) use ($permissionCode) {
                $query->where('codigo', $permissionCode);
            })
            ->exists();
    }

    /**
     * Scope: Filtrar solo usuarios activos
     * 
     * Uso:
     * $activos = Usuario::activo()->get();  // WHERE estado = 'activo'
     */
    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }
}
