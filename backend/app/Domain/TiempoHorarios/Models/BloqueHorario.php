<?php

namespace App\Domain\TiempoHorarios\Models;

use App\Domain\Shared\Traits\HasUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Model BloqueHorario
 * 
 * 📝 CONCEPTO: Bloques Reutilizables
 * ===================================
 * Representa períodos de tiempo que se repiten cada semana.
 * 
 * Ejemplo:
 * - Lunes 8:00-9:30
 * - Martes 10:00-11:30
 * - Viernes 14:00-15:30
 * 
 * ¿Por qué crear bloques?
 * - Reutilización: No crear horarios desde cero cada vez
 * - Estandarización: Todos usan los mismos bloques
 * - Evitar conflictos: Más fácil detectar solapamientos
 * 
 * @property string $id
 * @property int $dia_semana (1=Lun, 2=Mar, ..., 7=Dom)
 * @property string $hora_inicio
 * @property string $hora_fin
 */
class BloqueHorario extends Model
{
    use HasFactory, HasUuid;

    protected $table = 'bloque_horario';

    public $timestamps = false;

    protected $fillable = [
        'dia_semana',
        'hora_inicio',
        'hora_fin',
    ];

    /**
     * Casts: Convertir hora_inicio/hora_fin a objetos Carbon
     */
    protected $casts = [
        'hora_inicio' => 'datetime:H:i',
        'hora_fin' => 'datetime:H:i',
    ];

    /**
     * RELACIONES
     */

    /**
     * Un bloque tiene muchos horarios de grupo
     */
    public function horariosGrupo()
    {
        return $this->hasMany(HorarioGrupo::class, 'bloque_id');
    }

    /**
     * Un bloque tiene muchas asistencias registradas
     */
    public function asistencias()
    {
        return $this->hasMany(\App\Domain\Asistencia\Models\Asistencia::class, 'bloque_id');
    }

    /**
     * Un bloque tiene sesiones QR
     */
    public function sesionesQr()
    {
        return $this->hasMany(\App\Domain\Asistencia\Models\QrSesion::class, 'bloque_id');
    }

    /**
     * SCOPES
     */

    /**
     * Filtrar por día de la semana
     */
    public function scopePorDia($query, int $dia)
    {
        return $query->where('dia_semana', $dia);
    }

    /**
     * Ordenar por día y hora
     */
    public function scopeOrdenado($query)
    {
        return $query->orderBy('dia_semana')
                    ->orderBy('hora_inicio');
    }

    /**
     * MÉTODOS HELPER
     */

    /**
     * Obtiene el nombre del día en español
     */
    public function getNombreDiaAttribute(): string
    {
        $dias = [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo',
        ];

        return $dias[$this->dia_semana] ?? 'Desconocido';
    }

    /**
     * Obtiene descripción completa del bloque
     * Ejemplo: "Lunes 8:00 - 9:30"
     */
    public function getDescripcionCompletaAttribute(): string
    {
        return "{$this->nombre_dia} {$this->hora_inicio->format('H:i')} - {$this->hora_fin->format('H:i')}";
    }

    /**
     * Calcula la duración del bloque en minutos
     */
    public function getDuracionMinutosAttribute(): int
    {
        return $this->hora_inicio->diffInMinutes($this->hora_fin);
    }
}
