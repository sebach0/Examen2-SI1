<?php

namespace App\Domain\Auth\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Permiso
 * 
 * 📝 CONCEPTO: Permisos Granulares
 * =================================
 * Un permiso es una ACCIÓN específica que se puede hacer en el sistema
 * 
 * Ejemplos de códigos de permiso:
 * - academico.materias.crear
 * - academico.materias.editar
 * - academico.materias.eliminar
 * - asistencia.marcar
 * - asistencia.reportes.ver
 * - usuarios.gestionar
 * 
 * Convención de nombres (como sugerencia):
 * {modulo}.{recurso}.{accion}
 * 
 * ¿Cómo se usan en el código?
 * - En Controllers: $this->authorize('academico.materias.crear');
 * - En Blade: @can('academico.materias.editar', $materia)
 * - En Policies: return $user->hasPermission('asistencia.reportes.ver');
 * 
 * @property string $id
 * @property string $codigo
 * @property string $descripcion
 */
class Permiso extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'permiso';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'codigo',
        'descripcion',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un permiso pertenece a muchos roles (many-to-many inverso)
     * 
     * Ejemplo:
     * $permiso = Permiso::where('codigo', 'academico.materias.crear')->first();
     * $roles = $permiso->roles;  // Qué roles tienen este permiso
     */
    public function roles()
    {
        return $this->belongsToMany(
            Rol::class,
            'rol_permiso',
            'permiso_id',
            'rol_id'
        );
    }

    /**
     * SCOPES
     */

    /**
     * Filtra permisos por módulo
     * 
     * Uso:
     * $permisosAcademicos = Permiso::porModulo('academico')->get();
     * // Retorna todos los permisos que empiezan con "academico."
     */
    public function scopePorModulo($query, string $modulo)
    {
        return $query->where('codigo', 'like', $modulo . '.%');
    }
}
