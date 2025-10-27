<?php

namespace App\Domain\Academico\Models;

use App\Domain\Auth\Models\Usuario;
use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Docente
 * 
 * 📝 CONCEPTO: Extensión de Usuario
 * ==================================
 * Un Docente es un Usuario con información adicional.
 * Es una relación One-to-One con Usuario.
 * 
 * ¿Por qué separar?
 * - No todos los usuarios son docentes (hay admins, coordinadores)
 * - Los docentes tienen campos específicos (CI, teléfono)
 * - Principio de responsabilidad única
 * 
 * @property string $id
 * @property string $usuario_id
 * @property string $ci
 * @property string $nombre
 * @property string $telefono
 */
class Docente extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'docente';

    public $timestamps = false;

    protected $fillable = [
        'usuario_id',
        'ci',
        'nombre',
        'telefono',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un docente pertenece a un usuario (one-to-one inverso)
     * 
     * Uso:
     * $docente = Docente::find('uuid-123');
     * $email = $docente->usuario->email;  // Acceso al usuario
     */
    public function usuario()
    {
        return $this->belongsTo(Usuario::class);
    }

    /**
     * Un docente tiene muchas cargas (grupos asignados)
     */
    public function cargas()
    {
        return $this->hasMany(\App\Domain\TiempoHorarios\Models\CargaDocente::class);
    }

    /**
     * Acceso directo a grupos del docente
     * 
     * Uso:
     * foreach ($docente->grupos as $grupo) {
     *     echo $grupo->materia->nombre;
     * }
     */
    public function grupos()
    {
        return $this->belongsToMany(
            Grupo::class,
            'carga_docente',
            'docente_id',
            'grupo_id'
        );
    }

    /**
     * Un docente tiene muchas asistencias registradas
     */
    public function asistencias()
    {
        return $this->hasMany(\App\Domain\Asistencia\Models\Asistencia::class);
    }

    /**
     * SCOPES
     */

    /**
     * Buscar docente por CI
     */
    public function scopePorCi($query, string $ci)
    {
        return $query->where('ci', $ci);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Obtiene el nombre completo con CI
     * Ejemplo: "Dr. García (CI: 12345678)"
     */
    public function getNombreCompletoConCiAttribute(): string
    {
        return "{$this->nombre} (CI: {$this->ci})";
    }

    /**
     * Verifica si el docente tiene grupos asignados en una gestión
     */
    public function tieneGruposEnGestion(string $gestionId): bool
    {
        return $this->grupos()
            ->where('gestion_id', $gestionId)
            ->exists();
    }
}
