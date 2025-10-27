<?php

namespace App\Domain\TiempoHorarios\Models;

use App\Domain\Academico\Models\Grupo;
use App\Domain\Infraestructura\Models\Aula;
use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model HorarioGrupo
 * 
 * 📝 CONCEPTO: Programación de Clases
 * ====================================
 * Define CUÁNDO y DÓNDE se imparte cada grupo.
 * 
 * Ejemplo:
 * - "Cálculo I - Grupo A" se dicta:
 *   - Lunes 8:00-9:30 en Aula 101 (teoría)
 *   - Miércoles 10:00-11:30 en Aula 101 (teoría)
 *   - Viernes 14:00-16:00 en Lab A (práctica)
 * 
 * @property string $id
 * @property string $grupo_id
 * @property string $bloque_id
 * @property string $aula_id
 * @property string $tipo (teorica, practica, laboratorio)
 */
class HorarioGrupo extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'horario_grupo';

    public $timestamps = false;

    protected $fillable = [
        'grupo_id',
        'bloque_id',
        'aula_id',
        'tipo',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un horario pertenece a un grupo
     */
    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    /**
     * Un horario pertenece a un bloque horario
     */
    public function bloque()
    {
        return $this->belongsTo(BloqueHorario::class, 'bloque_id');
    }

    /**
     * Un horario pertenece a un aula
     */
    public function aula()
    {
        return $this->belongsTo(Aula::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por grupo
     */
    public function scopePorGrupo($query, string $grupoId)
    {
        return $query->where('grupo_id', $grupoId);
    }

    /**
     * Filtrar por aula
     */
    public function scopePorAula($query, string $aulaId)
    {
        return $query->where('aula_id', $aulaId);
    }

    /**
     * Filtrar por tipo de clase
     */
    public function scopePorTipo($query, string $tipo)
    {
        return $query->where('tipo', $tipo);
    }

    /**
     * Filtrar por día de la semana
     */
    public function scopePorDia($query, int $dia)
    {
        return $query->whereHas('bloque', function ($q) use ($dia) {
            $q->where('dia_semana', $dia);
        });
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si hay conflicto de horario en el aula
     * (otra clase en la misma aula, mismo bloque, misma gestión)
     */
    public function tieneConflictoAula(): bool
    {
        return self::where('aula_id', $this->aula_id)
            ->where('bloque_id', $this->bloque_id)
            ->where('id', '!=', $this->id)
            ->whereHas('grupo', function ($query) {
                $query->where('gestion_id', $this->grupo->gestion_id);
            })
            ->exists();
    }

    /**
     * Obtiene descripción completa del horario
     * Ejemplo: "Lunes 8:00-9:30 - Aula 101 (Teoría)"
     */
    public function getDescripcionCompletaAttribute(): string
    {
        return "{$this->bloque->descripcion_completa} - {$this->aula->nombre} ({$this->tipo})";
    }
}
