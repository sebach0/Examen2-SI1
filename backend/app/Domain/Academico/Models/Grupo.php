<?php

namespace App\Domain\Academico\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Grupo
 * 
 * 📝 CONCEPTO: Grupos/Paralelos
 * ===============================
 * Representa secciones/paralelos de una materia en una gestión específica.
 * 
 * Ejemplo:
 * - "Cálculo I" en "2024-1" tiene 3 grupos: A, B, C
 * - Cada grupo tiene su propio horario, docente y aula
 * 
 * @property string $id
 * @property string $materia_id
 * @property string $gestion_id
 * @property string $codigo (A, B, C, LAB-1, etc.)
 * @property int $capacidad
 */
class Grupo extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'grupo';

    public $timestamps = false;

    protected $fillable = [
        'materia_id',
        'gestion_id',
        'codigo',
        'capacidad',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un grupo pertenece a una materia
     */
    public function materia()
    {
        return $this->belongsTo(Materia::class);
    }

    /**
     * Un grupo pertenece a una gestión
     */
    public function gestion()
    {
        return $this->belongsTo(Gestion::class);
    }

    /**
     * Un grupo tiene muchas cargas docentes
     * (puede haber múltiples docentes: teoría, práctica, lab)
     */
    public function cargasDocentes()
    {
        return $this->hasMany(\App\Domain\TiempoHorarios\Models\CargaDocente::class);
    }

    /**
     * Acceso directo a docentes asignados
     */
    public function docentes()
    {
        return $this->belongsToMany(
            Docente::class,
            'carga_docente',
            'grupo_id',
            'docente_id'
        );
    }

    /**
     * Un grupo tiene muchos horarios
     */
    public function horarios()
    {
        return $this->hasMany(\App\Domain\TiempoHorarios\Models\HorarioGrupo::class);
    }

    /**
     * Un grupo tiene muchas asistencias registradas
     */
    public function asistencias()
    {
        return $this->hasMany(\App\Domain\Asistencia\Models\Asistencia::class);
    }

    /**
     * Un grupo tiene sesiones QR generadas
     */
    public function sesionesQr()
    {
        return $this->hasMany(\App\Domain\Asistencia\Models\QrSesion::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por gestión
     */
    public function scopePorGestion($query, string $gestionId)
    {
        return $query->where('gestion_id', $gestionId);
    }

    /**
     * Filtrar por materia
     */
    public function scopePorMateria($query, string $materiaId)
    {
        return $query->where('materia_id', $materiaId);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Obtiene el nombre descriptivo del grupo
     * Ejemplo: "Cálculo I - Grupo A (2024-1)"
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->materia->nombre} - Grupo {$this->codigo} ({$this->gestion->codigo})";
    }
}
