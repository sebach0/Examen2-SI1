<?php

namespace App\Domain\Academico\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Materia
 * 
 * 📝 CONCEPTO: Materias y Pre-requisitos
 * ========================================
 * Representa asignaturas de cada carrera.
 * 
 * Relación de pre-requisitos:
 * - Una materia puede tener MUCHAS materias como requisito
 * - Una materia puede ser requisito de MUCHAS materias
 * - Es una relación many-to-many consigo misma
 * 
 * Ejemplo:
 * - "Cálculo II" requiere "Cálculo I"
 * - "Física II" requiere "Física I" + "Cálculo I"
 * 
 * @property string $id
 * @property string $carrera_id
 * @property string $codigo
 * @property string $nombre
 * @property int $horas_semanales
 * @property int $creditos
 */
class Materia extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'materia';

    public $timestamps = false;

    protected $fillable = [
        'carrera_id',
        'codigo',
        'nombre',
        'horas_semanales',
        'creditos',
    ];

    /**
     * RELACIONES
     */

    /**
     * Una materia pertenece a una carrera
     */
    public function carrera()
    {
        return $this->belongsTo(Carrera::class);
    }

    /**
     * Materias que SON requisito PARA CURSAR esta materia
     * 
     * Ejemplo: Si estás en Materia "Cálculo II"
     * $calculo2->requisitos; // [Cálculo I]
     */
    public function requisitos()
    {
        return $this->belongsToMany(
            Materia::class,
            'materia_requisito',
            'materia_id',      // Esta materia
            'requisito_id'     // Materias requeridas
        );
    }

    /**
     * Materias que REQUIEREN esta materia como pre-requisito
     * 
     * Ejemplo: Si estás en Materia "Cálculo I"
     * $calculo1->esRequisitoDe; // [Cálculo II, Física II, ...]
     */
    public function esRequisitoDe()
    {
        return $this->belongsToMany(
            Materia::class,
            'materia_requisito',
            'requisito_id',    // Esta materia es requisito
            'materia_id'       // De estas materias
        );
    }

    /**
     * Una materia tiene muchos grupos
     */
    public function grupos()
    {
        return $this->hasMany(Grupo::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por carrera
     */
    public function scopePorCarrera($query, string $carreraId)
    {
        return $query->where('carrera_id', $carreraId);
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si esta materia tiene requisitos
     */
    public function tieneRequisitos(): bool
    {
        return $this->requisitos()->exists();
    }

    /**
     * Obtiene el nombre completo con código
     * Ejemplo: "MAT-101 - Cálculo I"
     */
    public function getNombreCompletoAttribute(): string
    {
        return "{$this->codigo} - {$this->nombre}";
    }
}
