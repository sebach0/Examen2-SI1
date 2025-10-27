<?php

namespace App\Domain\Auth\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Rol
 * 
 * 📝 CONCEPTO: Roles y Permisos
 * =============================
 * RBAC = Role-Based Access Control (Control de Acceso Basado en Roles)
 * 
 * Estructura:
 * - USUARIO → tiene → ROLES → tienen → PERMISOS
 * - Ejemplo: Juan (usuario) es "Admin" (rol) puede "crear_usuarios" (permiso)
 * 
 * ¿Por qué no asignar permisos directo al usuario?
 * - Escalabilidad: Si tienes 100 docentes, asignas el rol "Docente" 100 veces
 *   en vez de asignar 20 permisos × 100 usuarios = 2000 registros
 * - Mantenimiento: Si cambias permisos del rol, afecta a todos automáticamente
 * 
 * @property string $id
 * @property string $nombre admin|docente|coordinador
 * @property string $descripcion
 */
class Rol extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'rol';

    // Esta tabla NO tiene timestamps (creado_en, actualizado_en)
    public $timestamps = false;

    protected $fillable = [
        'id',
        'nombre',
        'descripcion',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un rol pertenece a muchos usuarios (many-to-many inverso)
     * 
     * Ejemplo:
     * $rol = Rol::where('nombre', 'admin')->first();
     * foreach ($rol->usuarios as $usuario) {
     *     echo $usuario->email;  // Todos los admins
     * }
     */
    public function usuarios()
    {
        return $this->belongsToMany(
            Usuario::class,
            'usuario_rol',
            'rol_id',
            'usuario_id'
        );
    }

    /**
     * Un rol tiene muchos permisos (many-to-many)
     * 
     * Ejemplo:
     * $rol = Rol::find('uuid-123');
     * $permisos = $rol->permisos;  // ['crear_usuarios', 'editar_materias', ...]
     */
    public function permisos()
    {
        return $this->belongsToMany(
            Permiso::class,
            'rol_permiso',
            'rol_id',
            'permiso_id'
        );
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si este rol tiene un permiso específico
     * 
     * Uso:
     * if ($rol->hasPermission('eliminar_usuarios')) {
     *     // Permitir acción
     * }
     */
    public function hasPermission(string $permissionCode): bool
    {
        return $this->permisos()->where('codigo', $permissionCode)->exists();
    }

    /**
     * Asigna un permiso a este rol
     * 
     * Uso:
     * $rol = Rol::where('nombre', 'admin')->first();
     * $permiso = Permiso::where('codigo', 'ver_reportes')->first();
     * $rol->givePermission($permiso);
     */
    public function givePermission(Permiso $permiso): void
    {
        // attach() es el método de Laravel para many-to-many
        // Si ya existe, no lo duplica
        $this->permisos()->syncWithoutDetaching([$permiso->id]);
    }
}
