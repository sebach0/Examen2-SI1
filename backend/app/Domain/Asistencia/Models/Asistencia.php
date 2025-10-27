<?php

namespace App\Domain\Asistencia\Models;

use App\Domain\Academico\Models\Docente;
use App\Domain\Academico\Models\Grupo;
use App\Domain\Shared\Traits\HasUuid;
use App\Domain\TiempoHorarios\Models\BloqueHorario;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model Asistencia
 * 
 * 📝 CONCEPTO: Registro de Asistencia
 * ====================================
 * Rastrea la presencia de un docente en una clase específica.
 * 
 * Estados:
 * - presente: Docente registró asistencia a tiempo
 * - ausente: No registró asistencia
 * - tarde: Registró después del tiempo límite
 * - justificado: Ausencia con justificación
 * 
 * Modos:
 * - QR: Escaneó código QR en el aula
 * - manual: Registrado manualmente por coordinador
 * 
 * @property string $id
 * @property string $docente_id
 * @property string $grupo_id
 * @property string $bloque_id
 * @property \DateTime $fecha
 * @property string $estado
 * @property string $modo
 * @property string|null $observacion
 * @property \DateTime $hora_marcado
 */
class Asistencia extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'asistencia';

    public $timestamps = false;

    protected $fillable = [
        'docente_id',
        'grupo_id',
        'bloque_id',
        'fecha',
        'estado',
        'modo',
        'observacion',
        'hora_marcado',
    ];

    /**
     * Casts: Convertir fecha y hora_marcado a Carbon
     */
    protected $casts = [
        'fecha' => 'datetime',
        'hora_marcado' => 'datetime',
    ];

    /**
     * RELACIONES
     */

    /**
     * Una asistencia pertenece a un docente
     */
    public function docente()
    {
        return $this->belongsTo(Docente::class);
    }

    /**
     * Una asistencia pertenece a un grupo
     */
    public function grupo()
    {
        return $this->belongsTo(Grupo::class);
    }

    /**
     * Una asistencia pertenece a un bloque horario
     */
    public function bloque()
    {
        return $this->belongsTo(BloqueHorario::class, 'bloque_id');
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
     * Filtrar por estado
     */
    public function scopePorEstado($query, string $estado)
    {
        return $query->where('estado', $estado);
    }

    /**
     * Filtrar por modo
     */
    public function scopePorModo($query, string $modo)
    {
        return $query->where('modo', $modo);
    }

    /**
     * Filtrar por rango de fechas
     */
    public function scopeEntreFechas($query, $fechaInicio, $fechaFin)
    {
        return $query->whereBetween('fecha', [$fechaInicio, $fechaFin]);
    }

    /**
     * Solo asistencias presentes
     */
    public function scopePresentes($query)
    {
        return $query->where('estado', 'presente');
    }

    /**
     * Solo asistencias ausentes
     */
    public function scopeAusentes($query)
    {
        return $query->where('estado', 'ausente');
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Verifica si es una asistencia presente
     */
    public function estaPresente(): bool
    {
        return $this->estado === 'presente';
    }

    /**
     * Verifica si llegó tarde
     */
    public function esTarde(): bool
    {
        return $this->estado === 'tarde';
    }

    /**
     * Verifica si fue registrado por QR
     */
    public function fueQr(): bool
    {
        return $this->modo === 'QR';
    }

    /**
     * Calcula porcentaje de asistencia de un docente en un grupo
     */
    public static function porcentajeAsistencia(string $docenteId, string $grupoId): float
    {
        $total = self::porDocente($docenteId)
            ->porGrupo($grupoId)
            ->count();

        if ($total === 0) {
            return 0;
        }

        $presentes = self::porDocente($docenteId)
            ->porGrupo($grupoId)
            ->whereIn('estado', ['presente', 'tarde'])
            ->count();

        return round(($presentes / $total) * 100, 2);
    }
}
