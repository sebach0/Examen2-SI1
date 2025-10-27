<?php

namespace App\Domain\TiempoHorarios\Models;

use App\Domain\Academico\Models\Docente;
use App\Domain\Academico\Models\Grupo;
use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model CargaDocente
 * 
 * 📝 CONCEPTO: Asignación Docente-Grupo
 * ======================================
 * Relaciona qué docente enseña qué grupo.
 * 
 * Casos de uso:
 * - Un docente puede enseñar múltiples grupos
 * - Un grupo puede tener múltiples docentes (teoría, práctica, lab)
 * - Tracking de horas asignadas por docente
 * 
 * @property string $id
 * @property string $docente_id
 * @property string $grupo_id
 * @property int $horas_asignadas
 */
class CargaDocente extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'carga_docente';

    public $timestamps = false;

    protected $fillable = [
        'docente_id',
        'grupo_id',
        'horas_asignadas',
    ];

    /**
     * RELACIONES
     */

    /**
     * Una carga pertenece a un docente
     */
    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    /**
     * Una carga pertenece a un grupo
     */
    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por docente
     */
    public function scopePorDocente($query, string $docenteId)
    {
        return $query->where('docente_id', $docenteId);
    }

    /**
     * Filtrar por grupo
     */
    public function scopePorGrupo($query, string $grupoId)
    {
        return $query->where('grupo_id', $grupoId);
    }

    /**
     * Cargas de una gestión específica
     */
    public function scopePorGestion($query, string $gestionId)
    {
        return $query->whereHas('grupo', function ($q) use ($gestionId) {
            $q->where('gestion_id', $gestionId);
        });
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Obtiene el total de horas del docente en una gestión
     */
    public static function totalHorasDocente(string $docenteId, string $gestionId): int
    {
        return self::porDocente($docenteId)
            ->porGestion($gestionId)
            ->sum('horas_asignadas');
    }
}
