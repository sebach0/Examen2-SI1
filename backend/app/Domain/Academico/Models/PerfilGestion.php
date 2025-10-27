<?php

namespace App\Domain\Academico\Models;

use App\Domain\Auth\Models\Rol;
use App\Domain\Auth\Models\Usuario;
use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model PerfilGestion
 * 
 * 📝 CONCEPTO: Roles Temporales por Gestión
 * ===========================================
 * Permite que un usuario tenga diferentes roles en diferentes gestiones.
 * 
 * Ejemplo:
 * - Juan es "coordinador" en 2024-1
 * - Juan es "docente" en 2024-2
 * - María es "docente" en todas las gestiones
 * 
 * ¿Por qué es útil?
 * - Flexibilidad: Los roles cambian cada semestre
 * - Histórico: Puedes ver quién fue coordinador en 2023
 * - Permisos contextuales: Solo puede administrar SU gestión
 * 
 * @property string $id
 * @property string $gestion_id
 * @property string $usuario_id
 * @property string $rol_id
 * @property string $estado
 * @property \Carbon\Carbon $creado_en
 */
class PerfilGestion extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'perfil_gestion';

    const CREATED_AT = 'creado_en';
    const UPDATED_AT = null; // No tiene updated_at

    protected $fillable = [
        'gestion_id',
        'usuario_id',
        'rol_id',
        'estado',
    ];

    protected $casts = [
        'creado_en' => 'datetime',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un perfil pertenece a una gestión
     */
    public function gestion()
    {
        return $this->belongsTo(Gestion::class);
    }

    /**
     * Un perfil pertenece a un usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    /**
     * Un perfil tiene un rol asignado
     */
    public function rol()
    {
        return $this->belongsTo(Rol::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar solo perfiles activos
     */
    public function scopeActivo($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Filtrar por gestión
     */
    public function scopePorGestion($query, string $gestionId)
    {
        return $query->where('gestion_id', $gestionId);
    }

    /**
     * Filtrar por usuario
     */
    public function scopePorUsuario($query, string $usuarioId)
    {
        return $query->where('usuario_id', $usuarioId);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si el perfil está activo
     */
    public function isActivo(): bool
    {
        return $this->estado === 'activo';
    }

    /**
     * Activa el perfil
     */
    public function activar(): void
    {
        $this->update(['estado' => 'activo']);
    }

    /**
     * Desactiva el perfil
     */
    public function desactivar(): void
    {
        $this->update(['estado' => 'inactivo']);
    }
}
